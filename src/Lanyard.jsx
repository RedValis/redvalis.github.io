/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// replace with your own imports
import cardGLB from './assets/card.glb';
import lanyard from './assets/lanyard.png';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// ─────────────────────────────────────────
// Scanner configuration — tweak these if needed
// ─────────────────────────────────────────
const SCANNER_POS = new THREE.Vector3(3, 0.5, 0); // world-space position of scanner
const SCAN_RADIUS = 1.3;                           // units — how close the card must be
const SCAN_HOLD_FRAMES = 38;                       // ~0.5s at 60fps before triggering

// ─────────────────────────────────────────
// 3-D Scanner Mesh — lives inside the Canvas
// ─────────────────────────────────────────
function ScannerMesh({ scanned, active }) {
  const bodyRef   = useRef();
  const lineRef   = useRef();
  const rimRef    = useRef();
  const t         = useRef(0);

  // Pre-allocate colour targets so nothing is created per-frame
  const cScanned  = useRef(new THREE.Color('#f0f0f0'));
  const cActive   = useRef(new THREE.Color('#aaaaaa'));
  const cIdle     = useRef(new THREE.Color('#282828'));

  useFrame((_, delta) => {
    t.current += delta;

    // Animate scan line up / down
    if (lineRef.current) {
      lineRef.current.position.y = Math.sin(t.current * 2.5) * 0.82;
    }

    // Lerp scanner colour toward target
    if (bodyRef.current?.material) {
      const target = scanned ? cScanned.current : active ? cActive.current : cIdle.current;
      bodyRef.current.material.emissive.lerp(target, 0.07);
      bodyRef.current.material.color.lerp(target, 0.07);
      bodyRef.current.material.emissiveIntensity += (((active || scanned) ? 0.9 : 0.2) - bodyRef.current.material.emissiveIntensity) * 0.06;
    }

    if (rimRef.current?.material) {
      const target = scanned ? cScanned.current : active ? cActive.current : cIdle.current;
      rimRef.current.material.color.lerp(target, 0.07);
    }
  });

  return (
    <group position={[SCANNER_POS.x, SCANNER_POS.y, SCANNER_POS.z]}>
      {/* Main body */}
      <mesh ref={bodyRef}>
        <boxGeometry args={[1.7, 2.5, 0.08]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive="#1a1a1a"
          emissiveIntensity={0.2}
          transparent
          opacity={0.82}
          metalness={0.95}
          roughness={0.08}
        />
      </mesh>

      {/* Wireframe border */}
      <mesh ref={rimRef}>
        <boxGeometry args={[1.75, 2.55, 0.09]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Animated scan line */}
      <mesh ref={lineRef} position={[0, 0, 0.06]}>
        <planeGeometry args={[1.55, 0.025]} />
        <meshBasicMaterial
          color={scanned ? '#f0f0f0' : '#aaaaaa'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Status dot */}
      <mesh position={[0, -1.4, 0.06]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : active ? '#888888' : '#3a3a3a'} />
      </mesh>

      {/* Corner brackets — top-left */}
      <mesh position={[-0.72, 1.1, 0.06]}>
        <planeGeometry args={[0.22, 0.04]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>
      <mesh position={[-0.83, 1.0, 0.06]}>
        <planeGeometry args={[0.04, 0.22]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>

      {/* Corner brackets — top-right */}
      <mesh position={[0.72, 1.1, 0.06]}>
        <planeGeometry args={[0.22, 0.04]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0.83, 1.0, 0.06]}>
        <planeGeometry args={[0.04, 0.22]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>

      {/* Corner brackets — bottom-left */}
      <mesh position={[-0.72, -1.1, 0.06]}>
        <planeGeometry args={[0.22, 0.04]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>
      <mesh position={[-0.83, -1.0, 0.06]}>
        <planeGeometry args={[0.04, 0.22]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>

      {/* Corner brackets — bottom-right */}
      <mesh position={[0.72, -1.1, 0.06]}>
        <planeGeometry args={[0.22, 0.04]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0.83, -1.0, 0.06]}>
        <planeGeometry args={[0.04, 0.22]} />
        <meshBasicMaterial color={scanned ? '#f0f0f0' : '#888888'} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────
// Main Lanyard export
// ─────────────────────────────────────────
export default function Lanyard({
  position    = [0, 0, 30],
  gravity     = [0, -40, 0],
  fov         = 20,
  transparent = true,
  // New props for scanner integration
  onScan      = null,   // () => void — called once when card is held over scanner
  scanned     = false,  // controls scanner visual state from parent
  showScanner = false,  // whether to render the 3-D scanner at all
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            onScan={onScan}
            scanned={scanned}
            showScanner={showScanner}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2}  color="white" position={[0, -1, 5]}    rotation={[0, 0, Math.PI / 3]}          scale={[100, 0.1, 1]} />
          <Lightformer intensity={3}  color="white" position={[-1, -1, 1]}   rotation={[0, 0, Math.PI / 3]}          scale={[100, 0.1, 1]} />
          <Lightformer intensity={3}  color="white" position={[1, 1, 1]}     rotation={[0, 0, Math.PI / 3]}          scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]}  rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

// ─────────────────────────────────────────
// Physics band + card + scanner detection
// ─────────────────────────────────────────
function Band({
  maxSpeed    = 50,
  minSpeed    = 0,
  isMobile    = false,
  onScan      = null,
  scanned     = false,
  showScanner = false,
}) {
  const band  = useRef();
  const fixed = useRef();
  const j1    = useRef();
  const j2    = useRef();
  const j3    = useRef();
  const card  = useRef();

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const tmp = new THREE.Vector3(); // reusable for proximity check

  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  const [dragged, drag]   = useState(false);
  const [hovered, hover]  = useState(false);
  const [cardNear, setCardNear] = useState(false);

  // Prevent the onScan callback from firing more than once
  const hasFired   = useRef(false);
  const holdFrames = useRef(0);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2,    [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3,    [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    // ── Drag logic (unchanged from original) ──────────────────────────
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      // ── Rope lerp (unchanged from original) ──────────────────────────
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });

      // ── Scanner proximity detection ───────────────────────────────────
      if (showScanner && !hasFired.current && card.current) {
        const c = card.current.translation();
        tmp.set(c.x, c.y, c.z);
        const dist  = tmp.distanceTo(SCANNER_POS);
        const isNear = dist < SCAN_RADIUS;

        // Only call setCardNear when value changes (avoids re-render flood)
        setCardNear(prev => (prev !== isNear ? isNear : prev));

        if (isNear) {
          holdFrames.current += 1;
          if (holdFrames.current >= SCAN_HOLD_FRAMES && onScan) {
            hasFired.current = true;
            onScan();
          }
        } else {
          holdFrames.current = 0;
        }
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS   = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              )
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry}  material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      {/* 3-D scanner — only shown when showScanner is true */}
      {showScanner && (
        <ScannerMesh scanned={scanned} active={cardNear} />
      )}

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}