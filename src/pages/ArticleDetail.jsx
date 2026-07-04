import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Layout from '../components/Layout';
import articles from '../assets/data/articles.json';
import './ArticleDetail.css';

const modules = import.meta.glob(
  '../assets/articles/*.md',
  { query: '?raw', import: 'default' }
);

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const article = articles.find((a) => a.slug === slug);

  useEffect(() => {
    setLoading(true);
    setContent('');

    const loader = modules[`../assets/articles/${slug}.md`];
    if (loader) {
      loader().then((raw) => {
        setContent(raw);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [slug]);

  if (!article) {
    return (
      <Layout>
        <div style={{ paddingTop: 80, paddingBottom: 100 }}>
          <p className="article-detail__404">Article not found.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return null;
  }

  if (!content) {
    return (
      <Layout>
        <div style={{ paddingTop: 80, paddingBottom: 100 }}>
          <p className="article-detail__404">Article not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="article-detail">
        <Link to="/" className="article-detail__back">
          ← Writing
        </Link>

        <h1 className="article-detail__title">{article.title}</h1>

        <div className="article-detail__meta">
          <span className="article-detail__date">{formatDate(article.date)}</span>
          <span className="article-detail__read-time">{article.read_time}</span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="article-detail__tags">
            {article.tags.map((tag) => (
              <span key={tag} className="article-detail__tag">{tag}</span>
            ))}
          </div>
        )}

        <hr className="rule" style={{ margin: '36px 0' }} />

        {article.linkedin_url && (
          <div className="article-detail__callout">
            <span className="article-detail__callout-text">
              Originally published as a LinkedIn post
            </span>
            <a
              href={article.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-detail__callout-link"
            >
              View on LinkedIn ↗
            </a>
          </div>
        )}

        <div className="article-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  );
}
