import RevealWrapper from './RevealWrapper';

interface SkillItem { _id: string; category: string; items: string[]; }

const ICONS = [
  // Design
  <svg key="design" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l11.5 11.5"/><circle cx="11" cy="11" r="2"/></svg>,
  // UX
  <svg key="ux" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  // Technical
  <svg key="tech" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
];

export default function Skills({ items }: { items: SkillItem[] }) {
  return (
    <section id="skills">
      <div className="wrap">
        <p className="eyebrow">skills</p>
        <h2 className="sec-title">What I work with</h2>
        <div className="skill-grid">
          {items.map((skill, idx) => (
            <RevealWrapper key={skill._id}>
              <div className="skill-card">
                <div className="icon">{ICONS[idx % ICONS.length]}</div>
                <h3>{skill.category}</h3>
                <div className="chips">
                  {(skill.items || []).map((chip) => (
                    <span className="chip" key={chip}>{chip}</span>
                  ))}
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
