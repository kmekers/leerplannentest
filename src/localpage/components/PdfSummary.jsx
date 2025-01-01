import React, { useState } from 'react';
import './PdfSummary.css';

const PdfSummary = ({ summary, isProcessing }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="summary-section">
      <div className="result-section-header" onClick={toggleExpand}>
        <h3>PDF Summary</h3>
        <svg
          className="chevron-icon"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isExpanded && (
        <div className="summary-content">
          {isProcessing ? (
            <div className="processing-status">
              <div className="spinner"></div>
              <span>Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="summary-text">{summary}</div>
          ) : (
            <div className="summary-text">No summary available yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfSummary; 