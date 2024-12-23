import { useState } from 'react';
import { config } from '../config/config';
import ReactMarkdown from 'react-markdown';

function TextTesting() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [inputText, setInputText] = useState('');

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));
    
    try {
      const model = config.text.find(m => m.id === modelId);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.modelName,
          prompt: model.prompt.system + '\n\n' + model.prompt.task + '\n\nLes:\n' + inputText,
          stream: false
        }),
      });

      const data = await response.json();
      setResponses(prev => ({
        ...prev,
        [modelId]: data.response
      }));
    } catch (error) {
      console.error('Error with model:', modelId, error);
      setResponses(prev => ({
        ...prev,
        [modelId]: 'Error: ' + error.message
      }));
    } finally {
      setLoading(prev => ({ ...prev, [modelId]: false }));
    }
  };

  return (
    <div className="container">
      <section className="input-section">
        <textarea
          className="text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your text here..."
        />
      </section>

      <div className="models-grid">
        {config.text.map(model => {
          return (
            <div key={model.id} className="model-card">
              <div className="model-header">
                <div className="model-title">
                  <model.icon className="model-icon" />
                  <span className="model-name">{model.name}</span>
                </div>
                <p className="model-description">{model.description}</p>
              </div>
              <div className="response-area">
                {loading[model.id] ? (
                  <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-text">Processing...</div>
                  </div>
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
                disabled={loading[model.id] || !inputText.trim()}
              >
                {loading[model.id] ? 'Processing...' : 'Test Model'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TextTesting; 