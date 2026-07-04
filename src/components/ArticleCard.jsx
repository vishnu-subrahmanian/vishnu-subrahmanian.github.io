import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './ArticleCard.css';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ArticleCard({ article }) {
  return (
    <Link to={`/articles/${article.slug}`} className="article-card">
      <div className="article-card__meta">
        <span className="article-card__date">{formatDate(article.date)}</span>
        <span className="article-card__read-time">{article.read_time}</span>
      </div>

      <div className="article-card__body">
        <h3 className="article-card__title">{article.title}</h3>

        <p className="article-card__summary">{article.summary}</p>

        {article.tags && article.tags.length > 0 && (
          <div className="article-card__tags">
            {article.tags.map((tag) => (
              <span key={tag} className="article-card__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <span className="article-card__cta">
        Read
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}
