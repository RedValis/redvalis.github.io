import { useEffect, useState } from 'react';
import Lanyard from './Lanyard';
import './LockScreen.css';

export default function LockScreen({ phase, onScan }) {
  const isScanned = phase === 'scanned' || phase === 'unlocking';
  const [time, setTime]     = useState('');
  const [glitch, setGlitch] = useState(false);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Glitch flash when access is granted
  useEffect(() => {
    if (isScanned) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 700);
    }
  }, [isScanned]);

  return (
    <div
      className={[
        'lock-screen',
        isScanned  ? 'is-scanned'  : '',
        glitch     ? 'glitching'   : '',
        `phase-${phase}`,
      ].join(' ')}
    >
      {/* ── Visual background layers ──────────────────────────────── */}
      <div className="bg-grid"     aria-hidden />
      <div className="bg-vignette" aria-hidden />
      <div className="scanlines"   aria-hidden />

      {/* ── 3-D Lanyard scene (fills the screen) ─────────────────── */}
      <div className="lanyard-scene">
        <Lanyard
          position={[0, 0, 20]}
          gravity={[0, -40, 0]}
          fov={20}
          transparent
          onScan={onScan}
          scanned={isScanned}
          showScanner
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DOM Overlays — all z-index: 10, absolute over the canvas
         ══════════════════════════════════════════════════════════════ */}

      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <span className={`status-dot ${isScanned ? 'granted' : 'denied'}`} />
          <span className="topbar-label">
            {isScanned ? 'ACCESS GRANTED — SCROLL TO ENTER' : 'SECURE ZONE // AUTHENTICATION REQUIRED'}
          </span>
        </div>
        <div className="topbar-center">
          <span className="topbar-node">NODE 447-B &nbsp;·&nbsp; NEXUS SECURE</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-time">{time}</span>
        </div>
      </header>

      {/* Bottom bar */}
      <footer className="bottombar">
        <div className="bb-left">
          <span className="bb-item">ENC: AES-256</span>
          <span className="bb-sep">|</span>
          <span className="bb-item">TLS 1.3</span>
          <span className="bb-sep">|</span>
          <span className={`bb-item bb-status ${isScanned ? 'green' : 'red'}`}>
            ● {isScanned ? 'IDENTITY VERIFIED' : 'UNVERIFIED'}
          </span>
        </div>
        <div className="bb-right">
          {!isScanned && (
            <span className="bb-item bb-hint">
              GRAB CARD &nbsp;▶&nbsp; DRAG RIGHT TO SCANNER
            </span>
          )}
        </div>
      </footer>

      {/* Left instructions panel */}
      <aside className="instructions-panel">
        <div className="panel-header">
          <span className="panel-header-label">ACCESS PROTOCOL</span>
          <span className="panel-header-rule" />
        </div>

        <ol className="steps">
          <Step num="01" label="GRAB CARD"        done={false}     active={!isScanned} />
          <Step num="02" label="DRAG TO SCANNER"  done={isScanned} active={!isScanned} />
          <Step
            num="03"
            label={isScanned ? 'SCROLL TO ENTER' : 'HOLD 1 SECOND'}
            done={isScanned}
            active={isScanned}
          />
        </ol>

        <div className="clearance-card">
          <div className="cc-icon">✦</div>
          <div className="cc-info">
            <div className="cc-level">LEVEL 5 CLEARANCE</div>
            <div className={`cc-status ${isScanned ? 'granted' : ''}`}>
              {isScanned ? 'IDENTITY CONFIRMED' : 'PENDING SCAN'}
            </div>
          </div>
        </div>

        <div className="panel-noise" />
      </aside>

      {/* Scanner label — right side */}
      <div className="scanner-label-right">
        <span className="slr-line" />
        <span className="slr-text">BIOMETRIC READER</span>
        <span className="slr-sub">
          {isScanned ? '◉ AUTHENTICATED' : '◎ AWAITING CARD'}
        </span>
        <span className="slr-line" />
      </div>

      {/* Centre-bottom call-to-action */}
      {!isScanned && (
        <div className="scan-cta">
          <span className="cta-arrows">▸▸▸</span>
          <span className="cta-text">PLACE BADGE ON READER</span>
          <span className="cta-arrows">◂◂◂</span>
        </div>
      )}

      {isScanned && (
        <div className="access-granted">
          <div className="ag-ring" />
          <div className="ag-icon">◉</div>
          <div className="ag-label">ACCESS AUTHORIZED</div>
          <div className="ag-sub">SCROLL DOWN TO ENTER</div>
        </div>
      )}
    </div>
  );
}

function Step({ num, label, done, active }) {
  return (
    <li className={['step', done ? 'done' : '', active ? 'active' : ''].join(' ')}>
      <span className="step-num">{num}</span>
      <span className="step-label">{label}</span>
      {done && <span className="step-tick">✓</span>}
    </li>
  );
}
