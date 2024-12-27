import React, { useState, useEffect } from 'react';
import PdfUploader from '../corefunctionality/corecomponents/PdfUploader';
import LeerdoelenSelector from '../corefunctionality/corecomponents/LeerdoelenSelector';
import './LocalPage.css';

function LocalPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [classificationResults, setClassificationResults] = useState(null);
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState(null);
  const [modelChoice, setModelChoice] = useState("llama");
  const [classificationModel, setClassificationModel] = useState("mistral-nemo");
  const [uploadError, setUploadError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [onderwijsdoelen, setOnderwijsdoelen] = useState({});
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [pdfSummary, setPdfSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [editableAnalysis, setEditableAnalysis] = useState([]);
  const [editableClassification, setEditableClassification] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [analysisVisible, setAnalysisVisible] = useState(true);
  const [classificationVisible, setClassificationVisible] = useState(true);
  const [summaryVisible, setSummaryVisible] = useState(true);

  const competentieNames = {
    '1': 'Lichamelijke en geestelijke gezondheid',
    '2': 'Nederlands',
    '3': 'Andere talen',
    '4': 'Digitale competenties',
    '5': 'Sociaal-relationele competenties',
    '6': 'Wiskunde – natuurwetenschappen – technologie – STEM',
    '7': 'Burgerschap',
    '8': 'Historisch bewustzijn',
    '9': 'Ruimtelijk bewustzijn',
    '10': 'Duurzaamheid',
    '11': 'Economische en financiële competenties',
    '12': 'Juridische competenties',
    '13': 'Leercompetenties',
    '14': 'Zelfbewustzijn',
    '15': 'Ondernemingszin',
    '16': 'Cultureel bewustzijn'
  };

  useEffect(() => {
    const fetchDoelen = async () => {
      try {
        const response = await fetch(
          'https://onderwijs.api.vlaanderen.be/onderwijsdoelen/onderwijsdoel?onderwijsniveau=Secundair%20onderwijs&so_graad=1ste%20graad&stroom=A-stroom&versie=2.0',
          {
            headers: {
              'x-api-key': import.meta.env.VITE_ONDERWIJS_API_KEY
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch onderwijsdoelen');
        
        const data = await response.json();
        const doelenByCompetentie = data.gegevens.member.reduce((acc, doel) => {
          const competentieNr = doel.onderwijsdoelenset?.vlaamse_sleutelcompetentie?.nr;
          if (competentieNr) {
            if (!acc[competentieNr]) acc[competentieNr] = [];
            acc[competentieNr].push(doel);
          }
          return acc;
        }, {});

        setOnderwijsdoelen(doelenByCompetentie);
      } catch (error) {
        console.error('Error fetching onderwijsdoelen:', error);
      }
    };

    fetchDoelen();
  }, []);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    // Reset all states at once
    const resetStates = {
      selectedFile: file,
      pdfUrl: URL.createObjectURL(file),
      analysisResults: null,
      pdfSummary: null,
      uploadError: null,
      pageCount: 0,
      selectedPages: [],
      isProcessing: true,
      currentlyAnalyzing: null,
      classificationResults: null
    };
    
    // Batch update all states
    Object.entries(resetStates).forEach(([key, value]) => {
      switch(key) {
        case 'selectedFile':
          setSelectedFile(value);
          break;
        case 'pdfUrl':
          setPdfUrl(value);
          break;
        case 'analysisResults':
          setAnalysisResults(value);
          break;
        case 'pdfSummary':
          setPdfSummary(value);
          break;
        case 'uploadError':
          setUploadError(value);
          break;
        case 'pageCount':
          setPageCount(value);
          break;
        case 'selectedPages':
          setSelectedPages(value);
          break;
        case 'isProcessing':
          setIsProcessing(value);
          break;
        case 'currentlyAnalyzing':
          setCurrentlyAnalyzing(value);
          break;
        case 'classificationResults':
          setClassificationResults(value);
          break;
      }
    });
    
    try {
      // Get page count
      const countFormData = new FormData();
      countFormData.append('file', file);
      
      const countResponse = await fetch('http://localhost:5002/get-page-count', {
        method: 'POST',
        body: countFormData
      });
      
      if (countResponse.ok) {
        const countData = await countResponse.json();
        const allPages = Array.from({length: countData.page_count}, (_, i) => i + 1);
        setPageCount(countData.page_count);
        setSelectedPages(allPages);
        
        // Convert pages
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pages', JSON.stringify(allPages));
        
        const response = await fetch('http://localhost:5002/upload-pdf', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Converted ${data.pages_converted} pages`);
          
          // First update UI with PDF info and wait for render
          setIsProcessing(false);
          
          // Wait for UI to update and files to be written
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Then start summary generation
          const generateSummary = async () => {
            setIsSummarizing(true);
            try {
              const strippedTextResponse = await fetch('http://localhost:5002/get-stripped-text', {
                method: 'POST'
              });

              if (!strippedTextResponse.ok) {
                throw new Error('Failed to get stripped text');
              }

              const textData = await strippedTextResponse.json();
              
              if (!textData.text_content) {
                throw new Error('No text content available');
              }
              
              // Generate summary using stripped text
              const summaryResponse = await fetch('http://localhost:5002/summarize-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  content: textData.text_content,
                  model: 'mistral-nemo'
                })
              });

              if (summaryResponse.ok) {
                const summaryData = await summaryResponse.json();
                const summaryText = summaryData.summary.summary;
                setPdfSummary(summaryText);
                setEditableSummary(summaryText);
              } else {
                const errorText = await summaryResponse.text();
                console.error('Failed to get summary:', errorText);
                throw new Error(`Summary generation failed: ${errorText}`);
              }
            } catch (error) {
              console.error('Error in summary process:', error);
              setUploadError(`Summary error: ${error.message}`);
            } finally {
              setIsSummarizing(false);
            }
          };

          // Start summary generation after UI update
          generateSummary();
          
        } else {
          const errorText = await response.text();
          console.error('Conversion failed:', errorText);
          setUploadError(`Error converting PDF: ${errorText}`);
        }
      } else {
        const errorText = await countResponse.text();
        console.error('Failed to get page count:', errorText);
        setUploadError(`Error getting page count: ${errorText}`);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setUploadError(`Error uploading PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageSelect = (pageNum) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        return prev.filter(p => p !== pageNum);
      } else {
        return [...prev, pageNum].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedPages(Array.from({length: pageCount}, (_, i) => i + 1));
  };

  const handleDeselectAll = () => {
    setSelectedPages([]);
  };

  const handleTestConvert = async () => {
    if (!selectedFile || selectedPages.length === 0) {
      console.log("No file or pages selected");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('pages', JSON.stringify(selectedPages));

    try {
      const response = await fetch('http://localhost:5002/test-convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Conversion failed:', errorText);
        setCurrentlyAnalyzing(`Error: ${errorText}`);
      } else {
        const data = await response.json();
        console.log('PDF converted successfully');
        setCurrentlyAnalyzing(null);
      }
    } catch (error) {
      if (error.message !== 'Failed to fetch') {  // Ignore connection refused errors
        console.error('Error during test conversion:', error);
        setCurrentlyAnalyzing(`Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
    setCurrentlyAnalyzing("Analyzing pages...");
    
    try {
      const response = await fetch('http://localhost:5002/analyze-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          model_choice: modelChoice,
          conversation_history: modelChoice === "mini" ? conversationHistory : undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analysis failed:', errorText);
        setCurrentlyAnalyzing(`Error: ${errorText}`);
      } else {
        const data = await response.json();
        console.log('Got analysis results:', data);
        setAnalysisResults(data.results);
        if (data.conversation_history) {
          setConversationHistory(data.conversation_history);
        }
        setCurrentlyAnalyzing(null);
      }
    } catch (error) {
      if (error.message !== 'Failed to fetch') {  // Ignore connection refused errors
        console.error('Error during analysis:', error);
        setCurrentlyAnalyzing(`Error: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClassify = async () => {
    if (!analysisResults || analysisResults.length === 0) {
      setClassificationResults("Error: No analysis results available. Please analyze the document first.");
      return;
    }

    if (!selectedCompetencies || selectedCompetencies.length === 0) {
      setClassificationResults("Error: Please select at least one competency to classify against.");
      return;
    }
    
    setIsClassifying(true);
    try {
      // Validate and combine all analysis results into one text
      const validResults = analysisResults.filter(result => result && result.analysis);
      if (validResults.length === 0) {
        throw new Error("No valid analysis results found");
      }
      
      const combinedContent = validResults
        .map(result => result.analysis)
        .join('\n\n');

      if (!combinedContent.trim()) {
        throw new Error("Combined analysis content is empty");
      }

      // Get competency goals for selected competencies
      const selectedDoelen = selectedCompetencies.reduce((acc, competency) => {
        const competencyDoelen = onderwijsdoelen[competency] || [];
        return [...acc, ...competencyDoelen];
      }, []);

      if (selectedDoelen.length === 0) {
        throw new Error("No learning goals found for selected competencies");
      }

      // Format learning goals for classification
      const doelenText = selectedDoelen.map(doel => 
        `${doel.code}\n${doel.omschrijving}\n\nDetails:\n` +
        (doel.cognitieve_dimensie ? `Cognitieve dimensie: ${doel.cognitieve_dimensie}\n` : '') +
        (doel.conceptuele_kennis ? `Conceptuele kennis: ${doel.conceptuele_kennis}\n` : '') +
        (doel.procedurele_kennis ? `Procedurele kennis: ${doel.procedurele_kennis}\n` : '') +
        (doel.feitelijke_kennis ? `Feitelijke kennis: ${doel.feitelijke_kennis}\n` : '')
      ).join('\n\n');

      const response = await fetch('http://localhost:5002/classify-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: combinedContent,
          goals: doelenText,
          model: classificationModel,
          competencies: selectedCompetencies.map(id => ({
            id,
            name: competentieNames[id]
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Classification failed:', errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      if (!data || !data.classification) {
        throw new Error("Invalid response format from classification service");
      }
      
      setClassificationResults(data.classification);
    } catch (error) {
      console.error('Error during classification:', error);
      setClassificationResults(`Error: ${error.message}`);
    } finally {
      setIsClassifying(false);
    }
  };

  // Reset conversation history when changing models or files
  useEffect(() => {
    setConversationHistory([]);
  }, [modelChoice, selectedFile]);

  // Update analysis results handler
  useEffect(() => {
    if (analysisResults) {
      setEditableAnalysis(analysisResults.map(result => result.analysis || ''));
    }
  }, [analysisResults]);

  // Update classification results handler
  useEffect(() => {
    if (classificationResults) {
      setEditableClassification(classificationResults);
    }
  }, [classificationResults]);

  // Update summary handler
  useEffect(() => {
    if (pdfSummary) {
      setEditableSummary(pdfSummary);
    }
  }, [pdfSummary]);

  // Handle text area changes
  const handleAnalysisChange = (index, value) => {
    const newAnalysis = [...editableAnalysis];
    newAnalysis[index] = value;
    setEditableAnalysis(newAnalysis);
  };

  const handleClassificationChange = (value) => {
    setEditableClassification(value);
  };

  const handleSummaryChange = (value) => {
    setEditableSummary(value);
    setPdfSummary({ summary: value });
  };

  return (
    <div className="analyzer-container">
      <div className="analyzer-header">
        <h1>Lesvoorbereiding met CPU van je eigen computer</h1>
        <p>Upload je lesvoorbereiding en analyseer deze lokaal</p>
      </div>

      <div className="competencies-section">
        <h3>Select Competencies</h3>
        <LeerdoelenSelector
          competentieNames={competentieNames}
          selectedCompetencies={selectedCompetencies}
          onCompetencySelect={setSelectedCompetencies}
        />
      </div>

      <div className="analyzer-content">
        <div className="results-section">
          {!selectedFile ? (
            <PdfUploader onFileSelect={handleFileSelect} />
          ) : (
            <div className="controls-header">
              <button
                onClick={() => {
                  // Reset all states
                  setSelectedFile(null);
                  setPdfUrl(null);
                  setAnalysisResults(null);
                  setPdfSummary(null);
                  setUploadError(null);
                  setPageCount(0);
                  setSelectedPages([]);
                  setIsProcessing(false);
                  setCurrentlyAnalyzing(null);
                  setClassificationResults(null);
                  setConversationHistory([]);
                }}
                className="reset-button"
                title="Start Over"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="reset-icon">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Start Over
              </button>
            </div>
          )}
          
          {uploadError && (
            <div className="error-message">
              {uploadError}
            </div>
          )}
          
          <div className="model-selector">
            <select 
              value={modelChoice} 
              onChange={(e) => setModelChoice(e.target.value)}
              className="model-select"
            >
              <option value="llama">Llama 3.2 Vision</option>
              <option value="mini">GPT-4o Mini</option>
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isProcessing}
            className="analyze-button"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Pages'}
          </button>

          {isAnalyzing && currentlyAnalyzing && (
            <div className="analysis-progress">
              <p>{currentlyAnalyzing}</p>
            </div>
          )}

          {analysisResults && (
            <div className="analysis-results">
              <div 
                className="result-section-header"
                onClick={() => setAnalysisVisible(!analysisVisible)}
              >
                <h3>Analysis Results</h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ transform: analysisVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {analysisVisible && analysisResults.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-section-header">
                    <h4>Page {index + 1}</h4>
                  </div>
                  <pre>{result.analysis}</pre>
                  <textarea
                    className="editable-area"
                    value={editableAnalysis[index] || ''}
                    onChange={(e) => handleAnalysisChange(index, e.target.value)}
                    spellCheck="false"
                  />
                </div>
              ))}
            </div>
          )}

          {analysisResults && (
            <div className="classification-section">
              <div 
                className="result-section-header"
                onClick={() => setClassificationVisible(!classificationVisible)}
              >
                <h3>Classification</h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ transform: classificationVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {classificationVisible && (
                <>
                  <div className="model-selector">
                    <select 
                      value={classificationModel} 
                      onChange={(e) => setClassificationModel(e.target.value)}
                      className="model-select"
                    >
                      <option value="mistral-nemo">Mistral Nemo</option>
                      <option value="bramvanroy/fietje-2b-chat">Fietje 2B</option>
                      <option value="bramvanroy/geitje-7b-ultra">Geitje 7B</option>
                    </select>
                  </div>
                  <button
                    onClick={handleClassify}
                    disabled={isClassifying || selectedCompetencies.length === 0}
                    className="classify-button"
                  >
                    {isClassifying ? 'Classifying...' : 'Classify Content'}
                  </button>
                  {classificationResults && (
                    <div className="classification-results">
                      <pre>{classificationResults}</pre>
                      <textarea
                        className="editable-area"
                        value={editableClassification}
                        onChange={(e) => handleClassificationChange(e.target.value)}
                        spellCheck="false"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="preview-section">
          {pageCount > 0 && (
            <div className="page-selector">
              <div className="page-selector-header">
                <h3>PDF Information</h3>
                {isProcessing ? (
                  <div className="processing-status">
                    <div className="spinner"></div>
                    <span>Converting pages...</span>
                  </div>
                ) : (
                  <div className="page-info">
                    <div className="pdf-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Pages:</span>
                        <span className="stat-value">{pageCount}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Pages Converted:</span>
                        <span className="stat-value">{selectedPages.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">File Name:</span>
                        <span className="stat-value">{selectedFile?.name}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">File Size:</span>
                        <span className="stat-value">{(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isSummarizing ? (
            <div className="summary-section">
              <div className="processing-status">
                <div className="spinner"></div>
                <span>Generating summary...</span>
              </div>
            </div>
          ) : pdfSummary && (
            <div className="summary-section">
              <div 
                className="result-section-header"
                onClick={() => setSummaryVisible(!summaryVisible)}
              >
                <h3>PDF Summary</h3>
                <svg 
                  className="chevron-icon"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ transform: summaryVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {summaryVisible && (
                <textarea
                  className="editable-area"
                  value={editableSummary}
                  onChange={(e) => setEditableSummary(e.target.value)}
                  spellCheck="false"
                />
              )}
            </div>
          )}

          {pdfUrl && (
            <div className="pdf-preview">
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                className="pdf-viewer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocalPage; 