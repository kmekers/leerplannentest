function Analyzer() {
  return (
    <div className="main">
      <div className="card">
        <h1 className="title">Leerplannen Doel Analyzer</h1>
        <div className="upload-section">
          <label htmlFor="lesson-upload" className="upload-label">
            Upload your lesson plan
          </label>
          <input 
            type="file" 
            id="lesson-upload" 
            className="upload-input"
            accept=".pdf,.doc,.docx,.txt"
          />
          <button className="button">Analyze</button>
        </div>
        <div className="results-section">
          {/* Results will be displayed here */}
        </div>
      </div>
    </div>
  )
}

export default Analyzer