import { useEffect, useRef, useState } from 'react';

import dosmLogo from '../../docs/dosm_logo.png';
import TeamDialog from './TeamDialog';

export const TABS = ['Overview', 'States', 'Forecast', 'Causal', 'Methodology'];

export default function Header({ metadata, tab, setTab }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-navigation">
        <div className="navigation-menu" ref={menuRef} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}>
          <button
            ref={toggleRef}
            className="menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="dashboard-navigation"
            onClick={() => setMenuOpen(open => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
          {menuOpen && (
            <nav id="dashboard-navigation" className="navigation-dropdown" aria-label="Dashboard sections">
              <span className="eyebrow">Explore dashboard</span>
              {TABS.map(section => (
                <button key={section} aria-current={tab === section ? 'page' : undefined} onClick={() => {
                  setTab(section);
                  setMenuOpen(false);
                  toggleRef.current?.focus();
                }}>
                  {section}<span aria-hidden="true">{tab === section ? '●' : '→'}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
        <div className="brand"><button type="button" className="brand-logo-button" aria-label="Meet our team" aria-haspopup="dialog" onClick={() => { setMenuOpen(false); setTeamOpen(true); }}><img className="brand-logo" src={dosmLogo} alt="DOSM logo" /></button><div><strong>TOURISM / MALAYSIA</strong><span>SUSTAINABILITY OBSERVATORY</span></div></div>
        <span className="current-section">{tab}</span>
      </div>
      <div className="header-meta"><span className="status-dot" /> DOSM Datathon 2026 <small>{metadata.sources.join(' · ')} · Updated {metadata.lastUpdated}</small></div>
      <TeamDialog open={teamOpen} onClose={() => setTeamOpen(false)} />
    </header>
  );
}
