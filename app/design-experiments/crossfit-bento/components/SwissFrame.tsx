import { ReactNode } from 'react';

interface SwissFrameProps {
  logo: string;
  meta: string;
  subLabels: string[];
  footerLabels: string[];
  children: ReactNode;
}

export function SwissFrame({ logo, meta, subLabels, footerLabels, children }: SwissFrameProps) {
  return (
    <div className="swiss-frame">
      <header className="swiss-header">
        <div className="swiss-rule" />
        <div className="swiss-header-row">
          <span className="swiss-logo">{logo}</span>
          <span className="swiss-meta">{meta}</span>
        </div>
        <div className="swiss-rule" />
        <div className="swiss-sub-row">
          {subLabels.map((label) => (
            <span key={label} className="swiss-label">{label}</span>
          ))}
        </div>
        <div className="swiss-rule" />
      </header>

      {children}

      <footer className="swiss-footer">
        <div className="swiss-rule" />
        <div className="swiss-footer-row">
          {footerLabels.map((label) => (
            <span key={label} className="swiss-label">{label}</span>
          ))}
        </div>
        <div className="swiss-rule" />
      </footer>
    </div>
  );
}
