import React, { useState } from 'react';
import { matchLeerdoelenWithClaude, formatMatchResults } from './ClaudeService';
import './LeerdoelenMatcher.css';

const LeerdoelenMatcher = ({ selectedCompetencies, lessonContent }) => {
    const [matchResults, setMatchResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const matchLeerdoelen = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await matchLeerdoelenWithClaude(selectedCompetencies, lessonContent);
            const formattedResults = formatMatchResults(data);
            setMatchResults(formattedResults);
        } catch (error) {
            console.error('Error matching leerdoelen:', error);
            setError('Er is een fout opgetreden bij het matchen van de leerdoelen.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="leerdoelen-matcher">
            <button 
                className="match-button"
                onClick={matchLeerdoelen}
                disabled={isLoading || !lessonContent || selectedCompetencies.length === 0}
            >
                {isLoading ? 'Bezig met matchen...' : 'Match Leerdoelen'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {Object.keys(matchResults).length > 0 && (
                <div className="match-results">
                    <h3>Matching Resultaten</h3>
                    {Object.entries(matchResults).map(([competentie, matches]) => (
                        <div key={competentie} className="match-item">
                            <h4>Competentie {competentie}</h4>
                            <ul>
                                {matches.map((match, index) => (
                                    <li key={index}>
                                        <div className="match-header">
                                            <span className="match-score">{match.score}%</span>
                                            <span className="match-id">{match.id}</span>
                                        </div>
                                        <div className="match-content">
                                            <p className="match-description">{match.description}</p>
                                            <p className="match-explanation">{match.explanation}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeerdoelenMatcher; 