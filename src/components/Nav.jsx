import { useState, useEffect } from 'react';
import Layout from './Layout';
import './Nav.css';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <Layout>
        <div className="nav__inner">
          <div className="nav__links">
            <a href="#projects" className="nav__link">Projects</a>
            <a href="#articles" className="nav__link">Articles</a>
            <a href="#about" className="nav__link">About</a>
          </div>
        </div>
      </Layout>
    </nav>
  );
}
