import RevealWrapper from './RevealWrapper';

interface EduItem { _id: string; degree: string; institution: string; period: string; details: string; active: boolean; }

export default function Education({ items }: { items: EduItem[] }) {
  return (
    <section id="education">
      <div className="wrap">
        <p className="eyebrow">education</p>
        <h2 className="sec-title">Education</h2>
        <div className="timeline">
          {items.map((edu) => (
            <RevealWrapper key={edu._id}>
              <div className={`tl-item${!edu.active ? ' muted' : ''}`}>
                <div className="tl-dot" />
                <h3>{edu?.degree || 'Unknown Degree'}</h3>
                <div className="period">{edu?.institution || 'Unknown Institution'} · {edu?.period || 'Unknown Period'}</div>
                {edu?.details && <p>{edu.details}</p>}
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
