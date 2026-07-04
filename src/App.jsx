import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main style={{ paddingTop: '60px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
