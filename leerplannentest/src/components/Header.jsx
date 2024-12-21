import { Link } from 'react-router-dom';
import { RiRobot2Fill, RiBrainFill, RiTestTubeFill } from 'react-icons/ri';
import { useEffect, useState } from 'react';

function Header() {
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
  );
}

export default Header; 