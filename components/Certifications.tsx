import RevealWrapper from './RevealWrapper';

interface Cert { _id: string; title: string; issuer: string; year: string; }

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
  </svg>
);

export default function Certifications({ items }: { items: Cert[] }) {
  return (
    <section id="certifications">
      <div className="wrap">
        <p className="eyebrow">certifications</p>
        <h2 className="sec-title">Certifications</h2>
        <div className="cert-grid">
          {items.map((cert) => (
            <RevealWrapper key={cert._id}>
              <div className="cert-card">
                <StarIcon />
                <div>
                  <h3>{cert?.title || 'Unknown Title'}</h3>
                  <span>{cert?.issuer || 'Unknown Issuer'} · {cert?.year || 'Unknown Year'}</span>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
