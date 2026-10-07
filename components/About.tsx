import RevealWrapper from './RevealWrapper';

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <p className="eyebrow">about</p>
        <h2 className="sec-title">Who I am</h2>
        <div className="about-grid">
          <RevealWrapper>
            <div className="about-panel" style={{ height: '100%' }}>
              <p>
                An ambitious IT professional and HNDIT student with a strong passion for UI/UX design. I combine a solid foundation in technology with a creative eye, focusing on creating simple, user-friendly digital experiences that solve real-world problems.
              </p>
            </div>
          </RevealWrapper>
          <RevealWrapper>
            <div className="focus-panel">
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <b>User-Centered Design</b>
                  <span>Creating simple, intuitive, and engaging digital experiences tailored for users.</span>
                </div>
              </div>
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v16h16M8 16l3-4 3 3 4-6" />
                </svg>
                <div>
                  <b>Visual Interface Design</b>
                  <span>Skilled in wireframing, prototyping, user flows, and high-fidelity mockups in Figma.</span>
                </div>
              </div>
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
                </svg>
                <div>
                  <b>Design Fundamentals</b>
                  <span>Applying strong typography, layout principles, and usability heuristics to every project.</span>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
