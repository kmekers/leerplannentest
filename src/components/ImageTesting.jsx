import { useState } from 'react';
import { FaImage } from 'react-icons/fa';
import { config } from '../config/config';
import ReactMarkdown from 'react-markdown';

function ImageTesting() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleTest = async (modelId) => {
    setLoading(prev => ({ ...prev, [modelId]: true }));
    
    try {
      const reader = new FileReader();
      
      const processImage = () => {
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64Image = reader.result.split(',')[1];
              const model = config.image.find(m => m.id === modelId);
              
              const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: model.modelId,
                  prompt: model.prompt.system + '\n\n' + model.prompt.task,
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
          reader.readAsDataURL(selectedImage);
        });
      };

      const data = await processImage();
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
          onClick={() => document.getElementById('image-input').click()}
        >
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '0.5rem' 
              }} 
            />
          ) : (
            <>
              <FaImage className="file-drop-icon" />
              <p className="file-drop-text">
                {selectedImage ? selectedImage.name : 'Drop your image here'}
              </p>
              <p className="file-drop-subtext">or click to browse</p>
            </>
          )}
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
      </section>

      <div className="models-grid">
        {config.image.map(model => {
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
                  <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-text">Analyzing image...</div>
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
                disabled={loading[model.id] || !selectedImage}
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