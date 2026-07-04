import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import './ProjectCard.css';

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-card__main">
        <div className="project-card__header">
          <div>
            <span className="project-card__eyebrow">Case study / {project.year}</span>
            <h3 className="project-card__title">{project.title}</h3>
          </div>
          {project.status === 'done' && (
            <span className="project-card__badge">Done</span>
          )}
        </div>

        <p className="project-card__desc">{project.description}</p>

        {project.highlights && project.highlights.length > 0 && (
          <ul className="project-card__highlights">
            {project.highlights.map((item, i) => (
              <li key={i} className="project-card__highlight">{item}</li>
            ))}
          </ul>
        )}
      </div>

      <aside className="project-card__aside">
        {project.stack && project.stack.length > 0 && (
          <div className="project-card__stack">
            {project.stack.map((tech) => (
              <span key={tech} className="project-card__tech">{tech}</span>
            ))}
          </div>
        )}

        <div className="project-card__footer">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__link"
          >
            <span>GitHub</span>
            <ArrowUpRight size={15} />
          </a>
          {project.article_slug && (
            <Link
              to={`/articles/${project.article_slug}`}
              className="project-card__link project-card__link--primary"
            >
              <span>Read case study</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
