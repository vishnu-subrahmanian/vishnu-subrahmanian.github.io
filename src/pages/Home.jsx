import { ArrowRight, Mail } from 'lucide-react';
import Layout from '../components/Layout';
import Marquee from '../components/Marquee';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import ArticleCard from '../components/ArticleCard';
import useScrollReveal from '../hooks/useScrollReveal';
import projects from '../assets/data/projects.json';
import articles from '../assets/data/articles.json';
import './Home.css';

const sortedArticles = [...articles].sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return new Date(b.date) - new Date(a.date);
});

export default function Home() {
  const projectsRef = useScrollReveal();
  const articlesRef = useScrollReveal();
  const aboutRef = useScrollReveal();

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <Layout>
          <div className="hero__grid">
            <div className="hero__copy">
              <span className="hero__label">VISHNU V — BENGALURU</span>
              <h1 className="hero__heading">I build AI products - backend, data, and ML, end to end.</h1>
              <p className="hero__statement">
                Software engineer who'd rather ship something real and iterate
                than perfect something in isolation. Currently working across
                data pipelines, backend systems, and applied ML infrastructure
                for products people actually use.
              </p>

              <div className="hero__actions">
                <a href="#projects" className="hero__button hero__button--primary">
                  <span>See the work</span>
                  <ArrowRight size={17} />
                </a>
                <a
                  href="mailto:vishnuv4363@gmail.com"
                  className="hero__button hero__button--ghost"
                >
                  <Mail size={17} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          <div className="hero__socials">
            <a
              href="https://github.com/vishnu-subrahmanian"
              target="_blank"
              rel="noopener noreferrer"
              className="hero__social-link"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/vishnuv14"
              target="_blank"
              rel="noopener noreferrer"
              className="hero__social-link"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </Layout>
      </section>

      <hr className="rule" />
      <Marquee />
      <hr className="rule" />

      {/* Projects */}
      <section id="projects" className="home-section" ref={projectsRef}>
        <Layout>
          <SectionHeading title="Featured projects" eyebrow="Projects">
            Practical builds across backend systems, data pipelines, and applied
            ML infrastructure, with an emphasis on shipping useful systems and
            learning from real behavior.
          </SectionHeading>
          <div className="card-list">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Layout>
      </section>

      <hr className="rule" />

      {/* Articles */}
      <section id="articles" className="home-section" ref={articlesRef}>
        <Layout>
          <SectionHeading title="Technical notes" eyebrow="Writing">
            Articles on AI updates, system design, data structures, backend
            architecture, and the engineering choices behind practical software
            and ML systems.
          </SectionHeading>
          <div className="card-list">
            {sortedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Layout>
      </section>

      <hr className="rule" />

      {/* About */}
      <section id="about" className="home-section" ref={aboutRef}>
        <Layout>
          <div className="about">
            <SectionHeading title="How I build" eyebrow="About">
              I work on the backend and data systems behind AI products:
              pipelines, APIs, retrieval, evaluation, and ML infrastructure. I
              like turning rough product ideas into working systems that can be
              tested, improved, and shipped.
            </SectionHeading>
            <p className="about__text">
              Software engineer based in Bengaluru, working at Accion Labs on
              data pipelines, RAG systems, and agentic AI platforms. I’m currently exploring search systems,
              building MCP tools, and writing about the lessons I learn from real data and experiments.
            </p>
          </div>
        </Layout>
      </section>
    </>
  );
}
