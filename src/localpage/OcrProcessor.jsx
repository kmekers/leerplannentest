import React, { useState, useEffect } from 'react';
import { visionPrompts } from './prompts/visionPrompts';
import { testPrompt } from './prompts/testPrompt';
import './OcrProcessor.css';

const OcrProcessor = ({ pdfFile, onProcessingComplete }) => {
    const [processingStatus, setProcessingStatus] = useState('');
    const [progress, setProgress] = useState(0);

    const processFile = async (file) => {
        try {
            setProcessingStatus('Testing OCR...');
            setProgress(10);

            // Test OCR with simple prompt
            const testResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-vision',
                    prompt: testPrompt.content,
                    system: testPrompt.system,
                    files: [await file.arrayBuffer()]
                })
            });

            if (!testResponse.ok) {
                throw new Error('Test OCR failed');
            }

            const testData = await testResponse.json();
            console.log('Test OCR Result:', testData.response);

            setProcessingStatus('Preparing file for processing...');
            setProgress(10);

            // Create a FormData object to send the file
            const formData = new FormData();
            formData.append('file', file);

            // Send the PDF to Ollama directly
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-vision',
                    prompt: visionPrompts.ocr.content,
                    system: visionPrompts.system.content,
                    files: [await file.arrayBuffer()]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to process with Ollama');
            }

            setProgress(50);
            setProcessingStatus('Extracting text content...');

            const data = await response.json();
            const extractedText = data.response;

            // Generate summary
            setProgress(70);
            setProcessingStatus('Generating lesson summary...');

            const summaryResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-vision',
                    prompt: visionPrompts.summary.content + '\n\n' + extractedText
                })
            });

            if (!summaryResponse.ok) throw new Error('Failed to generate summary');
            const summaryData = await summaryResponse.json();
            
            // Generate lesson plan
            setProgress(85);
            setProcessingStatus('Creating lesson plan table...');

            const planResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-vision',
                    prompt: visionPrompts.lessonPlan.content + '\n\n' + extractedText
                })
            });

            if (!planResponse.ok) throw new Error('Failed to generate lesson plan');
            const planData = await planResponse.json();

            // Return processed data
            return {
                rawText: extractedText,
                summary: summaryData.response,
                lessonPlan: planData.response
            };
        } catch (error) {
            console.error('Processing error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const handleProcessing = async () => {
            if (!pdfFile) return;
            
            try {
                setProcessingStatus('Starting processing...');
                setProgress(0);

                const processedData = await processFile(pdfFile);
                onProcessingComplete(processedData);
                
                setProcessingStatus('Processing complete!');
                setProgress(100);
            } catch (error) {
                setProcessingStatus(`Error: ${error.message}`);
                console.error('Processing error:', error);
            }
        };

        handleProcessing();
    }, [pdfFile]);

    return (
        <div className="ocr-processor">
            <div className="processing-status">
                <div className="status-text">{processingStatus}</div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default OcrProcessor; 