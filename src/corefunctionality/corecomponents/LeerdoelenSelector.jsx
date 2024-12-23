import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { callClaudeAPI } from './ClaudeService';
import './LeerdoelenSelector.css';

const LeerdoelenSelector = ({ onSelectionChange }) => {
    const [selectedCompetencies, setSelectedCompetencies] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [onderwijsdoelen, setOnderwijsdoelen] = useState({});

    const competenties = {
        '1': 'Lichamelijke en geestelijke gezondheid',
        '2': 'Nederlands',
        '3': 'Andere talen',
        '4': 'Digitale competenties',
        '5': 'Sociaal-relationele competenties',
        '6': 'Wiskunde – natuurwetenschappen – technologie – STEM',
        '7': 'Burgerschap',
        '8': 'Historisch bewustzijn',
        '9': 'Ruimtelijk bewustzijn',
        '10': 'Duurzaamheid',
        '11': 'Economische en financiële competenties',
        '12': 'Juridische competenties',
        '13': 'Leercompetenties',
        '14': 'Zelfbewustzijn',
        '15': 'Ondernemingszin',
        '16': 'Cultureel bewustzijn'
    };

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
                
                // Group doelen by competentie
                const doelenByCompetentie = data.gegevens.member.reduce((acc, doel) => {
                    const competentieNr = doel.onderwijsdoelenset?.vlaamse_sleutelcompetentie?.nr;
                    if (competentieNr) {
                        if (!acc[competentieNr]) {
                            acc[competentieNr] = [];
                        }
                        acc[competentieNr].push(doel);
                    }
                    return acc;
                }, {});

                setOnderwijsdoelen(doelenByCompetentie);
                console.log('Fetched onderwijsdoelen:', doelenByCompetentie);
            } catch (error) {
                console.error('Error fetching onderwijsdoelen:', error);
                setError('Failed to fetch onderwijsdoelen');
            }
        };

        fetchDoelen();
    }, []);

    const handleSelect = (nr) => {
        if (isProcessing) return;
        
        setSelectedCompetencies(prev => {
            const newSelection = prev.includes(nr)
                ? prev.filter(id => id !== nr)
                : [...prev, nr];
            console.log('Selected competencies:', newSelection);
            if (onSelectionChange) {
                onSelectionChange(newSelection);
            }
            return newSelection;
        });
    };

    return (
        <div className="leerdoelen-selector">
            <div className="selector-header">
                <h2 className="selector-title">Welke leerdoelen wil je matchen?</h2>
                <Link to="/onderwijsdoelen" className="more-info-link">
                    Bekijk alle leerdoelen details →
                </Link>
            </div>

            <div className="competentie-grid">
                {Object.entries(competenties).map(([nr, title]) => (
                    <button
                        key={nr}
                        className={`competentie-button ${selectedCompetencies.includes(nr) ? 'active' : ''}`}
                        onClick={() => handleSelect(nr)}
                        disabled={isProcessing}
                    >
                        <span className="number">{nr}.</span>
                        <span className="title">{title}</span>
                    </button>
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default LeerdoelenSelector; 