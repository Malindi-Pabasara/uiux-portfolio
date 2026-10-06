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
                An ambitious IT professional with technical expertise backed by an HNDIT from SLIATE
                and diplomas in IT and English — grounded in the same care for structure and detail
                that carries into every system I build.
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
                  <b>Data integrity</b>
                  <span>Managed confidential records and digital documentation at Vasana Valuation Associates.</span>
                </div>
              </div>
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v16h16M8 16l3-4 3 3 4-6" />
                </svg>
                <div>
                  <b>Full-stack range</b>
                  <span>Comfortable end to end — from database schema to the interface users touch.</span>
                </div>
              </div>
              <div className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
                </svg>
                <div>
                  <b>Grounded in fundamentals</b>
                  <span>OOP, DBMS and Systems Analysis form the core of an HNDIT in progress.</span>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
