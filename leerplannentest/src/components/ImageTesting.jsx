import { useState } from 'react';
import { BsImageFill } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import { models, prompts } from '../config/config';
import LoadingSpinner from './LoadingSpinner';

function ImageTesting() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));

    if (modelId === 'llama31') {
      try {
        const reader = new FileReader();
        
        const processImage = () => {
          return new Promise((resolve, reject) => {
            reader.onload = async () => {
              try {
                const base64Image = reader.result.split(',')[1];
                const model = models.image.find(m => m.id === modelId);
                
                const response = await fetch('http://localhost:11434/api/generate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: model.modelId,
                    prompt: prompts.llama31.system + '\n\n' + prompts.llama31.task,
                    images: [base64Image],
                    stream: false
                  }),
                });

                const data = await response.json();
                resolve(data);
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(selectedFile);
          });
        };

        const data = await processImage();
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
      setTimeout(() => {
        setResponses(prev => ({
          ...prev,
          [modelId]: `Test response for ${modelId} with image input.`
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
          <BsImageFill className="file-drop-icon" />
          <p className="file-drop-text">
            {selectedFile ? selectedFile.name : 'Drop your image here'}
          </p>
          <p className="file-drop-subtext">or click to browse</p>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </section>

      <div className="models-grid">
        {models.image.map(model => {
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
                  <LoadingSpinner text="Analyzing image..." />
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

export default ImageTesting; 