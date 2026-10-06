import RevealWrapper from './RevealWrapper';

interface SkillItem { _id: string; category: string; items: string[]; }

const ICONS = [
  // Frontend
  <svg key="f" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>,
  // Backend
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17l6-6-6-6M12 19h8"/></svg>,
  // Database
  <svg key="d" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zM4 6v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2"/></svg>,
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
