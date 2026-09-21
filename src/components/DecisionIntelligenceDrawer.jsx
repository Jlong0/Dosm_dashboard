import {
    useEffect
  } from 'react';
  
  import DecisionIntelligencePanel
    from './DecisionIntelligencePanel';
  
  
  export default function DecisionIntelligenceDrawer({
    open,
    onClose,
    evidenceContext
  }) {
  
    useEffect(() => {
      if (!open) {
        return;
      }
  
      function handleKeyDown(event) {
        if (event.key === 'Escape') {
          onClose();
        }
      }
  
      window.addEventListener(
        'keydown',
        handleKeyDown
      );
  
      /*
       * Prevent the page behind the drawer
       * from scrolling while it is open.
       */
      const previousOverflow =
        document.body.style.overflow;
  
      document.body.style.overflow =
        'hidden';
  
  
      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown
        );
  
        document.body.style.overflow =
          previousOverflow;
      };
  
    }, [
      open,
      onClose
    ]);
  
  
    return (
      <div
        className={
          open
            ? 'ai-drawer-root open'
            : 'ai-drawer-root'
        }
        aria-hidden={!open}
      >
  
        <button
          type="button"
          className="ai-drawer-backdrop"
          aria-label="Close Decision Intelligence"
          onClick={onClose}
        />
  
  
        <aside
          className="ai-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Decision Intelligence"
        >
  
          <div className="ai-drawer-toolbar">
  
            <div>
              <span className="eyebrow">
                DECISION INTELLIGENCE
              </span>
  
              <strong>
                Evidence-guided assistant
              </strong>
            </div>
  
  
            <button
              type="button"
              className="ai-drawer-close"
              onClick={onClose}
              aria-label="Close Decision Intelligence"
            >
              ×
            </button>
  
          </div>
  
  
          <div className="ai-drawer-content">
  
            <DecisionIntelligencePanel
              evidenceContext={
                evidenceContext
              }
            />
  
          </div>
  
        </aside>
  
      </div>
    );
  }