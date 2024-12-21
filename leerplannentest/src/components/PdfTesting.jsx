import { useState } from 'react';
import { BsFiletypePdf } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import { models, CLAUDE_API_KEY } from '../config/config';
import LoadingSpinner from './LoadingSpinner';

function PdfTesting() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));
    
    if (modelId === 'claude') {
      try {
        console.log('Starting PDF processing for Claude...');
        const reader = new FileReader();
        
        const processPdf = () => {
          return new Promise((resolve, reject) => {
            reader.onload = async () => {
              try {
                console.log('PDF loaded, converting to base64...');
                const base64Pdf = reader.result.split(',')[1];
                const model = models.pdf.find(m => m.id === modelId);
                console.log('Using model:', model);
                
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (!CLAUDE_API_KEY) {
                  console.error('API Key missing or undefined');
                  throw new Error('API key is not configured. Please check your .env file.');
                }
                console.log('API Key validation passed');

                console.log('Preparing API request...');
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'x-api-key': CLAUDE_API_KEY,
                    'content-type': 'application/json',
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                  },
                  body: JSON.stringify({
                    model: model.model,
                    max_tokens: 1024,
                    system: "You are an AI assistant that helps teachers analyze their lessons and extract learning objectives (leerplandoelen).",
                    messages: [{
                      role: 'user',
                      content: [{
                        type: 'document',
                        source: {
                          type: 'base64',
                          media_type: 'application/pdf',
                          data: base64Pdf
                        }
                      }, {
                        type: 'text',
                        text: 'Extract and list all learning objectives (leerplandoelen) from this document. Present them in a clear, structured format.'
                      }]
                    }]
                  })
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                console.log('API Response received:', data);
                resolve(data);
              } catch (error) {
                console.error('Detailed error information:');
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error status:', error.status);
                console.error('Error type:', error.type);
                console.error('Full error object:', JSON.stringify(error, null, 2));
                console.error('Stack trace:', error.stack);
                
                if (error.status === 429) {
                  reject(new Error('Rate limit exceeded. Please wait a moment and try again.'));
                } else {
                  reject(error);
                }
              }
            };
            reader.onerror = (error) => {
              console.error('FileReader error:', error);
              reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(selectedFile);
          });
        };

        const data = await processPdf();
        console.log('Processing complete, data received:', data);
        const textContent = data.content[0].text;
        setResponses(prev => ({
          ...prev,
          [modelId]: textContent
        }));
      } catch (error) {
        console.error('Error processing PDF:', error);
        setResponses(prev => ({
          ...prev,
          [modelId]: 'Error: ' + error.message
        }));
      } finally {
        setLoading(prev => ({ ...prev, [modelId]: false }));
      }
    } else {
      // Simulation for other PDF models
      setTimeout(() => {
        setResponses(prev => ({
          ...prev,
          [modelId]: `Test response for ${modelId} with PDF input.`
        }));
        setLoading(prev => ({ ...prev, [modelId]: false }));
      }, 1500);
    }
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
                  <LoadingSpinner text="Analyzing PDF..." />
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