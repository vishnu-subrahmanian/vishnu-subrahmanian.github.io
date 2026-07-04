import './SectionHeading.css';

export default function SectionHeading({ title, eyebrow, children }) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="section-heading__eyebrow">{eyebrow}</span>}
      <h2 className="section-heading__title">{title}</h2>
      {children && <p className="section-heading__copy">{children}</p>}
    </div>
  );
}
