import { useEffect, useState } from 'react';
import TargetCursor from './TargetCursor';
import './MainContent.css';

// ─────────────────────────────────────────────────────────────────
//  MODULE CONTENT — add new items here, no need to touch the JSX
// ─────────────────────────────────────────────────────────────────
const MODULES = {
  intro: {
    label: 'Intro',
    sub: '// OVERVIEW',
    items: [],          // leave blank for now
  },

  playlists: {
    label: 'Playlists',
    sub: '// AUDIO FILES',
    items: [
      {
        id: 'babel',
        label: 'Babel',
        desc: 'Access the Universal Library of Music',
        href: 'https://open.spotify.com/playlist/3sxUSXqCHx74IBgv4gptHL?si=1a150f3898c1419e',
        icon: <IconSpotify />,
      },
      {
        id: 'indie',
        label: 'Indie',
        desc: 'Transmissions from the Underground · Unclassified Frequencies',
        href: 'https://open.spotify.com/playlist/3tdgSqFmvoG4PHPra79zMR?si=69147457d7e04a27',
        icon: <IconSpotify />,
      },
    ],
  },

  links: {
    label: 'Links',
    sub: '// EXTERNAL REF',
    items: [
      {
        id: 'github',
        label: 'GitHub',
        desc: 'Source repositories & code archives',
        href: 'https://github.com/RedValis',
        icon: <IconGitHub />,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        desc: 'Professional network & clearance records',
        href: 'https://www.linkedin.com/in/muhammed-hayyan-96288a297/',
        icon: <IconLinkedIn />,
      },
    ],
  },

  projects: {
    label: 'Projects',
    sub: '// ACTIVE OPS',
    items: [
      {
        id: 'quantum',
        label: 'Quantum Dynamics Lab',
        desc: 'Spin simulation & quantum state visualizer',
        href: 'https://quantumspinsim.streamlit.app',
        icon: <IconAtom />,
      },
      {
        id: 'inflation',
        label: 'Global Inflation Visualizer',
        desc: 'Real-time macroeconomic index tracker',
        href: 'https://inflationtracker.streamlit.app',
        icon: <IconStock />,
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────
//  ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function MainContent() {
  const [visible,       setVisible]       = useState(false);
  const [syncTime,      setSyncTime]      = useState('');
  const [activeModule,  setActiveModule]  = useState(null);  // null = profile view
  const [transitioning, setTransitioning] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setSyncTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Navigate to a module with a brief fade transition
  const goTo = (id) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveModule(id);
      setTransitioning(false);
    }, 220);
  };

  const goBack = () => goTo(null);

  return (
    <>
      <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn hoverDuration={0.2} />

      <div className={`mc ${visible ? 'mc--visible' : ''}`}>
        <div className="mc-bg-grid"   aria-hidden />
        <div className="mc-scanlines" aria-hidden />

        {/* ── System bar ─────────────────────────────────────────── */}
        <header className="mc-sysbar">
          <span className="sysbar-node">NODE 447-B</span>
          <span className="sysbar-sep">·</span>
          <span className="sysbar-label">
            {activeModule
              ? `MODULE // ${MODULES[activeModule].label.toUpperCase()}`
              : 'CLASSIFIED PERSONNEL PROFILE'}
          </span>
          <span className="sysbar-spacer" />
          <span className="sysbar-enc">ENC AES-256</span>
          <span className="sysbar-sep">·</span>
          <span className="sysbar-status">◉ AUTHENTICATED</span>
          <span className="sysbar-sep">·</span>
          <span className="sysbar-time">{syncTime}</span>
        </header>

        {/* ── Content area ───────────────────────────────────────── */}
        <div className={`mc-content ${transitioning ? 'mc-content--out' : 'mc-content--in'}`}>
          {activeModule === null
            ? <ProfileView onNavigate={goTo} syncTime={syncTime} />
            : <ModuleView  module={MODULES[activeModule]} moduleId={activeModule} onBack={goBack} />
          }
        </div>

        <footer className="mc-footer">
          <span>◈ NEXUS // NODE 447-B</span>
          <span>ALL DATA ENCRYPTED · UNAUTHORISED ACCESS PROSECUTED</span>
          <span>© {new Date().getFullYear()} CLASSIFIED</span>
        </footer>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PROFILE VIEW (original dossier + module nav)
// ─────────────────────────────────────────────────────────────────
function ProfileView({ onNavigate, syncTime }) {
  return (
    <>
      <section className="mc-dossier">
        <div className="dossier-heading">
          <div className="dossier-heading-rule" />
          <span className="dossier-heading-text">PERSONNEL DOSSIER // ACCESS LEVEL 5</span>
          <div className="dossier-heading-rule" />
        </div>

        <div className="dossier-body">
          <div className="dossier-photo-wrap">
            <div className="dossier-photo">
              <div className="silhouette-head" aria-hidden />
              <div className="silhouette-body" aria-hidden />
              <div className="photo-corner tl"  aria-hidden />
              <div className="photo-corner tr"  aria-hidden />
              <div className="photo-corner bl"  aria-hidden />
              <div className="photo-corner br"  aria-hidden />
              <div className="photo-scan-line"  aria-hidden />
            </div>
            <div className="dossier-photo-label">
              <span className="photo-label-text">REDACTED</span>
              <span className="photo-label-sub">IDENTITY WITHHELD</span>
            </div>
          </div>

          <div className="dossier-fields">
            <div className="field-group">
              <FieldRow label="DESIGNATION" value={<><span className="redact">V</span> <span className="block-char">█ █ █</span> <span className="redact">S</span></>} />
              <FieldRow label="AGE"         value="18" />
              <FieldRow label="MAJOR"       value="Computer Engineering" />
            </div>
            <div className="field-divider" />
            <div className="field-group field-group--meta">
              <FieldRow label="CLEARANCE"  value="LEVEL 5"   highlight />
              <FieldRow label="STATUS"     value="◉ ACTIVE"  highlight />
              <FieldRow label="THREAT LVL" value="NOMINAL" />
              <FieldRow label="LAST SYNC"  value={syncTime}             mono />
              <FieldRow label="FILE REF"   value="447-B/PERS/0091"     mono />
            </div>
            <div className="dossier-seal">
              <span className="seal-ring" aria-hidden>◈</span>
              <span className="seal-text">VERIFIED // NEXUS SECURE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mc-modules">
        <div className="modules-heading">
          <div className="modules-heading-rule" />
          <span className="modules-heading-text">SELECT MODULE</span>
          <div className="modules-heading-rule" />
        </div>

        <div className="modules-grid">
          {Object.entries(MODULES).map(([id, { label, sub }]) => (
            <button
              key={id}
              className="module-btn cursor-target"
              type="button"
              onClick={() => onNavigate(id)}
            >
              <span className="module-btn-id">{id.toUpperCase()}</span>
              <span className="module-btn-label">{label}</span>
              <span className="module-btn-sub">{sub}</span>
              <div className="module-btn-corner tl" aria-hidden />
              <div className="module-btn-corner tr" aria-hidden />
              <div className="module-btn-corner bl" aria-hidden />
              <div className="module-btn-corner br" aria-hidden />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MODULE VIEW (title centred + item cards)
// ─────────────────────────────────────────────────────────────────
function ModuleView({ module, moduleId, onBack }) {
  const { label, sub, items } = module;

  return (
    <div className="mod-view">
      {/* Title block */}
      <div className="mod-title-wrap">
        <div className="mod-title-rule" />
        <h1 className="mod-title">{label.toUpperCase()}</h1>
        <p className="mod-title-sub">{sub}</p>
        <div className="mod-title-rule" />
      </div>

      {/* Item list */}
      <div className="mod-items">
        {items.length === 0 ? (
          <p className="mod-empty">// NO DATA — SECTION PENDING CLASSIFICATION</p>
        ) : (
          items.map(({ id, label: lbl, desc, href, icon }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mod-item cursor-target"
            >
              <span className="mod-item-icon">{icon}</span>
              <span className="mod-item-text">
                <span className="mod-item-label">{lbl}</span>
                <span className="mod-item-desc">{desc}</span>
              </span>
              <span className="mod-item-arrow">↗</span>
              <div className="mod-item-corner tl" aria-hidden />
              <div className="mod-item-corner tr" aria-hidden />
              <div className="mod-item-corner bl" aria-hidden />
              <div className="mod-item-corner br" aria-hidden />
            </a>
          ))
        )}
      </div>

      {/* Back button */}
      <button className="mod-back cursor-target" type="button" onClick={onBack}>
        <span className="mod-back-arrow">←</span>
        <span>RETURN TO DOSSIER</span>
        <div className="mod-item-corner tl" aria-hidden />
        <div className="mod-item-corner tr" aria-hidden />
        <div className="mod-item-corner bl" aria-hidden />
        <div className="mod-item-corner br" aria-hidden />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SMALL HELPERS
// ─────────────────────────────────────────────────────────────────
function FieldRow({ label, value, highlight, mono }) {
  return (
    <div className={['field-row', highlight ? 'field-row--hi' : '', mono ? 'field-row--mono' : ''].join(' ')}>
      <span className="field-label">{label}</span>
      <span className="field-sep">·</span>
      <span className="field-value">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  INLINE SVG ICONS
// ─────────────────────────────────────────────────────────────────
function IconSpotify() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.723a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.43-1.497c3.633-1.043 8.148-.537 11.21 1.334a.78.78 0 0 1 .257 1.072zm.105-2.835C14.69 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.794c3.532-1.07 9.404-.863 13.115 1.333a.937.937 0 0 1-.955 1.617z"/>
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function IconAtom() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function IconStock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}