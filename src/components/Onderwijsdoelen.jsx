import React, { useState, useEffect } from 'react';
import './Onderwijsdoelen.css';

const Onderwijsdoelen = () => {
  const [doelen, setDoelen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [expandedDimensions, setExpandedDimensions] = useState(new Set());
  const [selectedSleutelcompetentie, setSelectedSleutelcompetentie] = useState(null);

  useEffect(() => {
    const fetchDoelen = async () => {
      try {
        const response = await fetch('https://onderwijs.api.vlaanderen.be/onderwijsdoelen/onderwijsdoel?onderwijsniveau=Secundair%20onderwijs&so_graad=1ste%20graad&stroom=A-stroom&versie=2.0', {
          headers: {
            'x-api-key': import.meta.env.VITE_ONDERWIJS_API_KEY
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setDoelen(data.gegevens.member);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDoelen();
  }, []);

  const stripHtmlTags = (text) => {
    if (!text) return '';
    return text.replace(/<\/?[^>]+(>|$)/g, '');
  };

  const truncateText = (text, limit = 150) => {
    const cleanText = stripHtmlTags(text);
    if (!cleanText || cleanText.length <= limit) return cleanText;
    return cleanText.slice(0, limit) + '...';
  };

  const toggleCard = (id, event) => {
    event.preventDefault();
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleDimensions = (id, event) => {
    event.preventDefault();
    setExpandedDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCompetentieClick = (nr) => {
    setSelectedSleutelcompetentie(prev => prev === nr ? null : nr);
    setExpandedCards(new Set());
    setExpandedDimensions(new Set());
  };

  const filteredDoelen = doelen.filter(doel => {
    if (!selectedSleutelcompetentie) return false;
    return doel.onderwijsdoelenset?.vlaamse_sleutelcompetentie?.nr === selectedSleutelcompetentie;
  });

  const formatDimensionText = (label, text) => {
    return text ? `<strong>${label}:</strong> ${text}` : null;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="main">
      <div className="filter-type">
        <h2 className="filter-title">Klik op de competentie waar jij rond wil werken voor heldere informatie én specifiek lesmateriaal.</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '1' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('1')}
          >
            1. Lichamelijke en geestelijke gezondheid
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '2' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('2')}
          >
            2. Nederlands
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '3' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('3')}
          >
            3. Andere talen
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '4' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('4')}
          >
            4. Digitale competenties
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '5' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('5')}
          >
            5. Sociaal-relationele competenties
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '6' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('6')}
          >
            6. Wiskunde – Nat - Tech - Stem
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '7' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('7')}
          >
            7. Burgerschap
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '8' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('8')}
          >
            8. Historisch bewustzijn
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '9' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('9')}
          >
            9. Ruimtelijk bewustzijn
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '10' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('10')}
          >
            10. Duurzaamheid
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '11' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('11')}
          >
            11. Economische en financiële competenties
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '12' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('12')}
          >
            12. Juridische competenties
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '13' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('13')}
          >
            13. Leercompetenties
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '14' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('14')}
          >
            14. Zelfbewustzijn
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '15' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('15')}
          >
            15. Ondernemingszin
          </button>
          <button 
            className={`filter-button ${selectedSleutelcompetentie === '16' ? 'active' : ''}`}
            onClick={() => handleCompetentieClick('16')}
          >
            16. Cultureel bewustzijn
          </button>
        </div>
      </div>

      {selectedSleutelcompetentie && (
        <div className="onderwijsdoelen-grid">
          {filteredDoelen.map((doel) => {
            const isExpanded = expandedCards.has(doel.id);
            const isDimensionsExpanded = expandedDimensions.has(doel.id);
            const description = stripHtmlTags(doel.omschrijving);
            const hasLongDescription = description?.length > 150;

            const dimensionsText = [
              formatDimensionText('Cognitieve dimensie', doel.cognitieve_dimensie),
              formatDimensionText('Conceptuele kennis', doel.conceptuele_kennis),
              formatDimensionText('Procedurele kennis', doel.procedurele_kennis),
              formatDimensionText('Feitelijke kennis', doel.feitelijke_kennis)
            ].filter(Boolean);

            const hasDimensions = dimensionsText.length > 0;

            return (
              <div key={doel.id} className="doel-card">
                <div className="doel-header">
                  <div className="doel-code">{doel.code}</div>
                </div>
                <div className={`doel-description ${!isExpanded ? 'collapsed' : ''}`}>
                  {isExpanded ? description : truncateText(description)}
                  <button className="read-more-btn" onClick={(e) => toggleCard(doel.id, e)}>
                    {isExpanded ? 'Lees minder' : 'Lees meer'}
                  </button>
                </div>
                {doel.titels?.[1]?.titel && (
                  <div className="doel-titel-section">
                    <div className="doel-titel">Bouwsteen</div>
                    <div className="doel-titel-content">
                      {stripHtmlTags(doel.titels[1].titel)}
                    </div>
                  </div>
                )}

                {doel.onderwijsdoelenset?.vlaamse_sleutelcompetentie && (
                  <div className="doel-meta">
                    <div className="doel-competentie">
                      <strong>Sleutelcompetentie {doel.onderwijsdoelenset.vlaamse_sleutelcompetentie.nr}</strong>
                      {stripHtmlTags(doel.onderwijsdoelenset.vlaamse_sleutelcompetentie.naam)}
                    </div>
                  </div>
                )}

                {hasDimensions && (
                  <div className={`doel-details ${!isDimensionsExpanded ? 'collapsed' : ''}`}>
                    <div className="doel-details-content">
                      {isDimensionsExpanded 
                        ? dimensionsText.map((dim, index) => (
                            <div key={index} className="doel-detail" dangerouslySetInnerHTML={{ __html: dim }} />
                          ))
                        : <div className="doel-detail">
                            {truncateText(stripHtmlTags(dimensionsText.join('\n')), 100)}
                          </div>
                      }
                    </div>
                    <button className="read-more-btn" onClick={(e) => toggleDimensions(doel.id, e)}>
                      {isDimensionsExpanded ? 'Lees minder' : 'Lees meer'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Onderwijsdoelen; 