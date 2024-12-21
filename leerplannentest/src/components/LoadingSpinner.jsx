import './LoadingSpinner.css';

function LoadingSpinner({ text = "Processing..." }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="spinner-text">{text}</div>
    </div>
  );
}

export default LoadingSpinner; 