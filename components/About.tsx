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
                HNDIT student with a strong interest in UI/UX design and creating simple, user-friendly digital experiences. Skilled in Figma, wireframing, prototyping, user flows, and visual interface design. Looking for a UI/UX internship to develop practical design skills and contribute to real-world digital products.
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
                  <b>Visual Interface &amp; UI Design</b>
                  <span>Skilled in Figma, Canva, wireframing, prototyping, user flows, and designing responsive web interfaces.</span>
                </div>
              </div>
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v16h16M8 16l3-4 3 3 4-6" />
                </svg>
                <div>
                  <b>User Experience (UX)</b>
                  <span>Applying basic user research, user personas, usability principles, and design thinking to create engaging experiences.</span>
                </div>
              </div>
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
                </svg>
                <div>
                  <b>Design Fundamentals</b>
                  <span>Strong grasp of typography, color, and layout principles to design aesthetically pleasing digital products.</span>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
