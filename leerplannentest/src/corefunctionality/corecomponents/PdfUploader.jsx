import { useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import './PdfUploader.css';

const PdfUploader = ({ onFileSelect }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div 
            className="pdf-drop-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('pdf-input').click()}
        >
            <FaFileUpload className="pdf-drop-icon" />
            <p className="pdf-drop-text">
                {selectedFile ? selectedFile.name : 'Drop your PDF here'}
            </p>
            <p className="pdf-drop-subtext">or click to browse</p>
            <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default PdfUploader; 