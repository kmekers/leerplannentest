import { useState } from 'react';
import { models, prompts } from '../config/config';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

function TextTesting() {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));
    console.log('Testing model:', modelId);
    
    if (modelId === 'geitje' || modelId === 'fietje' || modelId === 'nemo') {
      try {
        const modelConfig = {
          geitje: {
            name: 'bramvanroy/geitje-7b-ultra:f16',
            prompt: prompts.testgeitje
          },
          fietje: {
            name: 'bramvanroy/fietje-2b-chat:f16',
            prompt: prompts.testfietje
          },
          nemo: {
            name: 'mistral-nemo:latest',
            prompt: prompts.testnemo
          }
        };

        const config = modelConfig[modelId];
        console.log('Using config:', config);
        
        const requestBody = {
          model: config.name,
          prompt: config.prompt.system + '\n\n' + config.prompt.task + '\n\nLes:\n' + prompt,
          stream: false
        };
        console.log('Request body:', requestBody);

        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('Response:', data);
        
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
                  <LoadingSpinner text="Processing text..." />
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