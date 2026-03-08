import { useState, useEffect } from 'react';
import LockScreen from './LockScreen';
import MainContent from './MainContent';
import './App.css';

/**
 * Phase flow:
 *   'locked'    → card held on scanner → onScan() fires
 *   'scanned'   → scanner glows green, DOM updates (1.4 s)
 *   'unlocking' → white flash overlay plays  (1.4 s more)
 *   'unlocked'  → MainContent shown, scroll enabled
 */
export default function App() {
  const [phase, setPhase] = useState('locked');

  // Lock / unlock body scroll
  useEffect(() => {
    document.body.style.overflow = phase === 'unlocked' ? 'auto' : 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [phase]);

  const handleScan = () => {
    if (phase !== 'locked') return;
    setPhase('scanned');
    setTimeout(() => setPhase('unlocking'), 1400);
    setTimeout(() => setPhase('unlocked'),  2800);
  };

  return (
    <div className="app-root">
      {/* Lock screen — visible until unlock completes */}
      {phase !== 'unlocked' && (
        <LockScreen phase={phase} onScan={handleScan} />
      )}

      {/* Flash overlay that bridges the transition */}
      {phase === 'unlocking' && (
        <div className="unlock-flash" aria-hidden />
      )}

      {/* Main website — rendered (and scroll-able) after unlock */}
      {phase === 'unlocked' && (
        <MainContent />
      )}
    </div>
  );
}
