import { useState } from 'react';
import { BsFiletypePdf } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import { models } from '../config/models';

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-text">Analyzing PDF...</div>
    </div>
  );
}

function PdfTesting() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));
    
    // Simulation for PDF models
    setTimeout(() => {
      setResponses(prev => ({
        ...prev,
        [modelId]: `Test response for ${modelId} with PDF input.`
      }));
      setLoading(prev => ({ ...prev, [modelId]: false }));
    }, 1500);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="container">
      <section className="input-section">
        <div 
          className="file-drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <BsFiletypePdf className="file-drop-icon" />
          <p className="file-drop-text">
            {selectedFile ? selectedFile.name : 'Drop your PDF here'}
          </p>
          <p className="file-drop-subtext">or click to browse</p>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </section>

      <div className="models-grid">
        {models.pdf.map(model => {
          return (
            <div key={model.id} className="model-card">
              <div className="model-header">
                <div className="model-title">
                  <span className="model-name">{model.name}</span>
                </div>
                <p className="model-description">{model.description}</p>
              </div>
              <div className="response-area">
                {loading[model.id] ? (
                  <LoadingSpinner />
                ) : responses[model.id] ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{responses[model.id]}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="no-response">No test results yet</span>
                )}
              </div>
              <button
                className={`test-button ${loading[model.id] ? 'disabled' : ''}`}
                onClick={() => handleTest(model.id)}
                disabled={loading[model.id] || !selectedFile}
              >
                {loading[model.id] ? 'Analyzing...' : 'Test Model'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PdfTesting; 