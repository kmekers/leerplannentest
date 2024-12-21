import { useState } from 'react';
import TextTesting from './TextTesting';
import ImageTesting from './ImageTesting';
import PdfTesting from './PdfTesting';

function ApiTesting() {
  const [selectedInputType, setSelectedInputType] = useState('text');

  const inputTypes = [
    { id: 'text', label: 'Text Input' },
    { id: 'image', label: 'Image Input' },
    { id: 'pdf', label: 'PDF Input' }
  ];

  return (
    <div className="main">
      <header className="header">
        <h1 className="title">Model Testing Laboratory</h1>
        <p className="subtitle">Test and compare model responses</p>
      </header>

      <div className="input-type-buttons">
        {inputTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedInputType(type.id)}
            className={`input-type-button ${selectedInputType === type.id ? 'active' : ''}`}
          >
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {selectedInputType === 'text' && <TextTesting />}
      {selectedInputType === 'image' && <ImageTesting />}
      {selectedInputType === 'pdf' && <PdfTesting />}
    </div>
  );
}

export default ApiTesting; 