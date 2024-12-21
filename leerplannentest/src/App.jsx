import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { RiRobot2Fill, RiBrainFill, RiTestTubeFill } from 'react-icons/ri'
import Analyzer from './components/Analyzer'
import ApiTesting from './components/ApiTesting'

function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <div>
        <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              <RiRobot2Fill className="nav-icon brand-icon" />
              <span>AI Teacher Assistant</span>
            </Link>
            <div className="nav-links">
              <Link to="/analyzer" className="nav-link">
                <RiBrainFill className="nav-icon" />
                <span>Leerplannen Doel Analyzer</span>
              </Link>
              <Link to="/api-testing" className="nav-link">
                <RiTestTubeFill className="nav-icon" />
                <span>Model Testing</span>
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <main className="main">
              <div className="card">
                <h1 className="title">
                  Welcome to AI Teacher Assistant
                </h1>
                <p className="subtitle">
                  Select an option from the navigation bar to get started.
                </p>
              </div>
            </main>
          } />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/api-testing" element={<ApiTesting />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
