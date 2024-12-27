import { Link } from 'react-router-dom';
import { RiRobot2Fill, RiBrainFill, RiTestTubeFill, RiBookOpenLine, RiCpuLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import './Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <RiRobot2Fill className="nav-icon brand-icon" />
          <span>Mardy</span>
        </Link>
        <div className="nav-links">
          <Link to="/analyzer" className="nav-link">
            <RiBrainFill className="nav-icon page-icon" />
            <span>Analyzer</span>
          </Link>
          <Link to="/api-testing" className="nav-link">
            <RiTestTubeFill className="nav-icon page-icon" />
            <span>Testing</span>
          </Link>
          <Link to="/onderwijsdoelen" className="nav-link">
            <RiBookOpenLine className="nav-icon page-icon" />
            <span>Doelen</span>
          </Link>
          <Link to="/local" className="nav-link">
            <RiCpuLine className="nav-icon page-icon" />
            <span>Lokaal</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Header; 