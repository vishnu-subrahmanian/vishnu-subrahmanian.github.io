import Layout from './Layout';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <Layout>
        <div className="footer__inner">
          <span className="footer__copy">© 2026 Vishnu V</span>
          <div className="footer__links">
            <a
              href="https://github.com/vishnu-subrahmanian"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/vishnuv14"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              LinkedIn
            </a>
            <a
              href="mailto:vishnuv4363@gmail.com"
              className="footer__link"
            >
              Email
            </a>
          </div>
        </div>
      </Layout>
    </footer>
  );
}
