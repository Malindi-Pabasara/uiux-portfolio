import RevealWrapper from './RevealWrapper';

interface ExperienceItem {
  _id: string;
  title: string;
  company: string;
  period?: string;
  bullets: string[];
}

export default function Experience({ items }: { items: ExperienceItem[] }) {
  return (
    <section id="experience">
      <div className="wrap">
        <p className="eyebrow">experience</p>
        <h2 className="sec-title">Work experience</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {items.map((item) => (
            <RevealWrapper key={item._id}>
              <div className="exp-card">
                <div className="exp-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" />
                  </svg>
                </div>
                <div>
                  <h3>{item?.title || 'Unknown Title'}</h3>
                  <div className="exp-role">
                    {item?.company || 'Unknown Company'}{item?.period ? ` · ${item.period}` : ''}
                  </div>
                  <ul className="exp-list">
                    {(item?.bullets || []).map((b, i) => (
                      <li key={i}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
