import { useEffect, useRef } from 'react';

const MEMBERS = [
  { name: 'Tan Shi Kai', initials: 'TSK' },
  { name: 'Long Ji-Rui', initials: 'LJR' },
  { name: 'Reena Yee Joan', initials: 'RYJ' },
  { name: 'Jie Xin', initials: 'JX' },
];

export default function TeamDialog({ open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="team-dialog"
      aria-labelledby="team-title"
      aria-describedby="team-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <button type="button" className="team-close" aria-label="Close team introduction" onClick={onClose} autoFocus>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
      </button>
      <span className="eyebrow">THE PEOPLE BEHIND THE DASHBOARD</span>
      <h2 id="team-title">Meet our team.</h2>
      <p id="team-description">Four minds exploring a more sustainable future for Malaysian tourism.</p>
      <div className="team-grid">
        {MEMBERS.map((member, index) => (
          <article className="team-card" key={member.name} style={{ '--member-order': index }}>
            <span className="team-avatar" aria-hidden="true">{member.initials}</span>
            <span className="eyebrow">TEAM MEMBER / 0{index + 1}</span>
            <h3>{member.name}</h3>
            <span className="team-card-rule" aria-hidden="true" />
            <p>DOSM Datathon 2026</p>
          </article>
        ))}
      </div>
      <p className="team-signoff">Tourism / Malaysia · Sustainability Observatory</p>
    </dialog>
  );
}
