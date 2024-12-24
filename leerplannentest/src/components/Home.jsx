import { useState } from 'react';
import { RiRobot2Fill } from 'react-icons/ri';
import { IoWarning, IoClose } from 'react-icons/io5';
import { MdVerified, MdWarning, MdPsychology, MdOutlinePerson } from 'react-icons/md';
import './Home.css';

const Home = () => {
  const [showDevMessage, setShowDevMessage] = useState(false);

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <RiRobot2Fill 
            className="home-icon" 
            onClick={() => setShowDevMessage(true)}
          />
          <h1 className="home-title">Welkom bij Mardy</h1>
        </div>

        <div className="home-warning">
          <div className="warning-header">
            <div className="warning-title">
              <IoWarning className="warning-icon" />
              <h3>AI Waarschuwing</h3>
            </div>
            <p className="warning-subtitle">Let op bij het gebruik van AI-gegenereerde content</p>
          </div>
          
          <div className="warning-content">
            <div className="warning-grid">
              <div className="warning-item">
                <MdVerified className="list-icon" />
                <div className="warning-text">
                  <h4>Validatie</h4>
                  <p>Controleer altijd de gegenereerde leerdoelen op juistheid</p>
                </div>
              </div>
              <div className="warning-item">
                <MdWarning className="list-icon" />
                <div className="warning-text">
                  <h4>Vooroordelen</h4>
                  <p>AI kan vooroordelen bevatten of bevooroordeeld zijn</p>
                </div>
              </div>
              <div className="warning-item">
                <MdPsychology className="list-icon" />
                <div className="warning-text">
                  <h4>Hallucinaties</h4>
                  <p>Wees bewust van mogelijke hallucinaties of verzinsels</p>
                </div>
              </div>
              <div className="warning-item">
                <MdOutlinePerson className="list-icon" />
                <div className="warning-text">
                  <h4>Expertise</h4>
                  <p>Gebruik je professionele oordeel bij de eindresultaten</p>
                </div>
              </div>
            </div>
            
            <div className="warning-footer">
              <p>Deze tool is een hulpmiddel, geen vervanging voor menselijke expertise</p>
            </div>
          </div>
        </div>

        <div className="home-footer">
          <p> Koen Mekers is ex Leerkracht, nu functioneel analist</p>
        </div>
      </div>

      {showDevMessage && (
        <div className="popup-overlay" onClick={() => setShowDevMessage(false)}>
          <div className="dev-popup" onClick={e => e.stopPropagation()}>
            <div className="dev-popup-content">
              <p>Btw, geen dev, dit is niet zo moeilijk ;-) </p>
              <button className="popup-close" onClick={() => setShowDevMessage(false)}>
                <IoClose />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 