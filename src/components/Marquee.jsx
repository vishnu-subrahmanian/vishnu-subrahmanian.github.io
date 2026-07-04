import './Marquee.css';

const CONTENT =
  'RAG SYSTEMS ✦ DATA PIPELINES ✦ AI AGENTS ✦ PYSPARK ✦ FASTAPI ✦ AWS ✦ DATABRICKS ✦ APPLIED ML ✦ RAG SYSTEMS ✦ DATA PIPELINES ✦ AI AGENTS ✦ PYSPARK ✦ FASTAPI ✦ AWS ✦ DATABRICKS ✦ APPLIED ML ✦';

export default function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee__track">
        <span className="marquee__text">{CONTENT}</span>
        <span className="marquee__text">{CONTENT}</span>
      </div>
    </div>
  );
}
