import { useState } from 'react';
import { models } from '../config/models';
import { prompts } from '../config/prompts';
import ReactMarkdown from 'react-markdown';

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-text">Processing text...</div>
    </div>
  );
}

function TextTesting() {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));
    
    if (modelId === 'geitje') {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'bramvanroy/geitje-7b-ultra:f16',
            prompt: prompts.testgeitje.system + '\n\n' + prompts.testgeitje.task + '\n\nLes:\n' + prompt,
            stream: false
          }),
        });

        const data = await response.json();
        setResponses(prev => ({
          ...prev,
          [modelId]: data.response
        }));
      } catch (error) {
        setResponses(prev => ({
          ...prev,
          [modelId]: 'Error: ' + error.message
        }));
      } finally {
        setLoading(prev => ({ ...prev, [modelId]: false }));
      }
    } else {
      // Simulation for other text models
      setTimeout(() => {
        setResponses(prev => ({
          ...prev,
          [modelId]: `Test response for ${modelId} with text input.`
        }));
        setLoading(prev => ({ ...prev, [modelId]: false }));
      }, 1500);
    }
  };

  return (
    <div className="container">
      <section className="input-section">
        <div className="input-container">
          <textarea
            className="text-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your test prompt here..."
          />
        </div>
      </section>

      <div className="models-grid">
        {models.text.map(model => {
          const Icon = model.icon;
          return (
            <div key={model.id} className="model-card">
              <div className="model-header">
                <div className="model-title">
                  {Icon && <Icon className="model-icon" />}
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
                disabled={loading[model.id] || !prompt.trim()}
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