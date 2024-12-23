import React, { useState, useEffect } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FiDownload } from 'react-icons/fi';
import PdfUploader from '../corecomponents/PdfUploader';
import LeerdoelenSelector from '../corecomponents/LeerdoelenSelector';
import { analyzerPrompts, modelConfig } from './coreprompt/analyzerPrompts';
import { callClaudeAPI } from '../corecomponents/ClaudeService';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType } from 'docx';
import './AnalyzerPage.css';

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

const AnalyzerPage = () => {
    // File states
    const [selectedFile, setSelectedFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    
    // Analysis states
    const [summary, setSummary] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [matchResults, setMatchResults] = useState({});
    
    // Competency states
    const [selectedCompetencies, setSelectedCompetencies] = useState([]);
    const [onderwijsdoelen, setOnderwijsdoelen] = useState({});

    // Lesson plan states
    const [lessonPlan, setLessonPlan] = useState('');
    const [expandedSection, setExpandedSection] = useState('summary'); // 'summary', 'lessonPlan', or competency number

    // Fetch onderwijsdoelen on mount
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

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setPdfUrl(URL.createObjectURL(file));
        setSummary('');
        setMatchResults({});
    };

    const handleCompetencySelect = (competencies) => {
        setSelectedCompetencies(competencies);
    };

    const analyzePdf = async () => {
        if (!selectedFile || selectedCompetencies.length === 0) return;
        
        setIsAnalyzing(true);
        try {
            // First analyze the PDF
            const reader = new FileReader();
            const pdfText = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(selectedFile);
            });

            // Get summary from Claude
            const summaryResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
                    'content-type': 'application/json',
                    ...modelConfig.headers
                },
                body: JSON.stringify({
                    model: modelConfig.model,
                    max_tokens: modelConfig.max_tokens,
                    temperature: modelConfig.temperature,
                    system: analyzerPrompts.system.content,
                    messages: [{
                        role: 'user',
                        content: [{
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: pdfText
                            }
                        }, {
                            type: 'text',
                            text: `Analyseer deze les en geef een gestructureerde samenvatting in het volgende formaat:

ONDERWERP EN DOEL:
[Beschrijf het hoofdonderwerp en doel van de les]

LEERDOELEN:
• [Leerdoel 1]
• [Leerdoel 2]
• [Leerdoel 3]

ACTIVITEITEN/WERKVORMEN:
1. [Activiteit 1 met details]
2. [Activiteit 2 met details]
3. [Activiteit 3 met details]

Gebruik deze exacte structuur en kopjes. Zorg voor duidelijke bullet points bij de leerdoelen en genummerde activiteiten.`
                        }]
                    }]
                })
            });

            if (!summaryResponse.ok) throw new Error('Failed to analyze PDF');
            
            const summaryData = await summaryResponse.json();
            const lessonContent = summaryData.content[0].text;
            setSummary(lessonContent);

            // After getting the summary, get the lesson plan
            const lessonPlanResponse = await callClaudeAPI({
                model: "claude-3-sonnet-20240229",
                prompt: `Based on this lesson content, create a detailed lesson plan table. Format it exactly like this:

Tijd | Activiteit | Beschrijving
--- | --- | ---
10 min | Introductie | Bespreek het onderwerp en de leerdoelen
20 min | Digitaal memoryspel | Uitleg en start activiteit
5 min | Uitleg opdracht | Korte instructie
etc...

Please maintain this exact format with minutes in the Tijd column.\n\n${lessonContent}`
            });

            setLessonPlan(lessonPlanResponse.content[0].text);

            // Then analyze each competency
            const newResults = {};
            for (const competency of selectedCompetencies) {
                try {
                    // Show loading state
                    newResults[competency] = { loading: true };
                    setMatchResults({ ...newResults });

                    // Get competency goals
                    const doelen = onderwijsdoelen[competency] || [];
                    const doelenText = doelen.map(doel => 
                        `${doel.code}\n${doel.omschrijving}`
                    ).join('\n\n');

                    // Analyze competency match
                    const result = await callClaudeAPI({
                        model: "claude-3-sonnet-20240229",
                        prompt: `${lessonContent}\n\n${doelenText}\n\n
Geef je analyse in dit formaat:

Matchen:
- [leerdoel code] [beschrijving]
- [leerdoel code] [beschrijving]

Matchen niet:
- [leerdoel code] [beschrijving]
- [leerdoel code] [beschrijving]

Zorg ervoor dat elk leerdoel op een nieuwe regel begint met een streepje (-).
Gebruik de exacte codes (zoals 1.1, 2.3, etc.) aan het begin van elke regel.`
                    });

                    newResults[competency] = result;
                    setMatchResults({ ...newResults });
                } catch (error) {
                    console.error(`Error analyzing competency ${competency}:`, error);
                    newResults[competency] = { 
                        content: [{ text: `Error analyzing competency: ${error.message}` }] 
                    };
                    setMatchResults({ ...newResults });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setSummary(`Error analyzing PDF: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Add this helper function to sort competencies
    const sortCompetencies = (competencies) => {
        return [...competencies].sort((a, b) => parseInt(a) - parseInt(b));
    };

    const handleSectionClick = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Add this function to parse the lesson plan text into table data
    const parseLessonPlan = (text) => {
        try {
            // Split into lines and remove empty lines
            const lines = text.trim().split('\n').filter(line => line.trim());
            
            // Remove header and separator lines
            const dataLines = lines.filter(line => 
                !line.includes('---') && 
                !line.includes('Tijd | Activiteit | Beschrijving')
            );

            return dataLines.map(line => {
                const [time, activity, description = ''] = line.split('|').map(cell => cell.trim());
                return { 
                    time: time || '', 
                    activity: activity || '', 
                    description: description || ''
                };
            });
        } catch (error) {
            console.error('Error parsing lesson plan:', error);
            return [];
        }
    };

    // Add this function to handle table cell edits
    const handleCellEdit = (rowIndex, field, value) => {
        const rows = parseLessonPlan(lessonPlan);
        rows[rowIndex][field] = value;
        const newLessonPlan = rows.map(row => 
            `${row.time} | ${row.activity} | ${row.description}`
        ).join('\n');
        setLessonPlan(newLessonPlan);
    };

    const generateWordDocument = async () => {
        // Create lesson plan table
        const lessonPlanRows = parseLessonPlan(lessonPlan);
        const tableRows = [
            new TableRow({
                children: [
                    new TableCell({ 
                        children: [new Paragraph({ 
                            text: "Tijd",
                            style: { font: "Calibri", size: 24, bold: true }
                        })],
                        shading: { fill: "E7E6E6" }
                    }),
                    new TableCell({ 
                        children: [new Paragraph({ 
                            text: "Activiteit",
                            style: { font: "Calibri", size: 24, bold: true }
                        })],
                        shading: { fill: "E7E6E6" }
                    }),
                    new TableCell({ 
                        children: [new Paragraph({ 
                            text: "Beschrijving",
                            style: { font: "Calibri", size: 24, bold: true }
                        })],
                        shading: { fill: "E7E6E6" }
                    }),
                ],
            }),
            ...lessonPlanRows.map(row => new TableRow({
                children: [
                    new TableCell({ 
                        children: [new Paragraph({ 
                            text: row.time,
                            style: { font: "Calibri", size: 22 }
                        })]
                    }),
                    new TableCell({ 
                        children: [new Paragraph({ 
                            text: row.activity,
                            style: { font: "Calibri", size: 22 }
                        })]
                    }),
                    new TableCell({ 
                        children: [new Paragraph({ 
                            text: row.description,
                            style: { font: "Calibri", size: 22 }
                        })]
                    }),
                ],
            })),
        ];

        const lessonPlanTable = new Table({
            rows: tableRows,
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            margins: {
                top: 100,
                bottom: 100,
                right: 100,
                left: 100,
            },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "808080" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "808080" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "808080" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "808080" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "808080" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "808080" },
            },
        });

        // Function to process summary text into structured paragraphs
        const processSummaryText = (text) => {
            const lines = text.split('\n');
            const processedLines = [];
            let currentSection = '';
            let isInNumberedList = false;
            let isInParagraph = false;
            let paragraphText = '';

            lines.forEach((line, index) => {
                if (line.trim().match(/^[A-Z\s&/]+:$/)) {  // Section headers
                    if (paragraphText) {
                        processedLines.push(new Paragraph({
                            text: paragraphText.trim(),
                            style: {
                                font: "Calibri",
                                size: 24,
                                color: "262626"
                            },
                            spacing: { before: 120, after: 120 },
                            indent: { left: 0 }
                        }));
                        paragraphText = '';
                    }
                    isInNumberedList = false;
                    isInParagraph = false;
                    processedLines.push(new Paragraph({
                        text: line.trim(),
                        heading: HeadingLevel.HEADING_2,
                        style: {
                            font: "Arial Black",
                            size: 32,
                            bold: true,
                            color: "000000"
                        },
                        spacing: { before: 400, after: 200 },
                        indent: { left: 0 }
                    }));
                } else if (line.trim().match(/^\d+\./)) {  // Numbered items
                    if (paragraphText) {
                        processedLines.push(new Paragraph({
                            text: paragraphText.trim(),
                            style: {
                                font: "Calibri",
                                size: 24,
                                color: "262626"
                            },
                            spacing: { before: 120, after: 120 },
                            indent: { left: 0 }
                        }));
                        paragraphText = '';
                    }
                    isInNumberedList = true;
                    isInParagraph = false;
                    processedLines.push(new Paragraph({
                        text: line.trim(),
                        style: {
                            font: "Calibri",
                            size: 24,
                            bold: true
                        },
                        spacing: { before: 120, after: 120 },
                        indent: { left: 360, hanging: 360 }
                    }));
                } else if (line.trim().startsWith('•')) {  // Bullet points
                    if (paragraphText) {
                        processedLines.push(new Paragraph({
                            text: paragraphText.trim(),
                            style: {
                                font: "Calibri",
                                size: 24,
                                color: "262626"
                            },
                            spacing: { before: 120, after: 120 },
                            indent: { left: 0 }
                        }));
                        paragraphText = '';
                    }
                    isInParagraph = false;
                    processedLines.push(new Paragraph({
                        text: line.trim().substring(1).trim(),
                        style: {
                            font: "Calibri",
                            size: 24
                        },
                        bullet: {
                            level: 0
                        },
                        spacing: { before: 120, after: 120 },
                        indent: { left: 360, hanging: 360 }
                    }));
                } else if (line.trim().startsWith('-')) {  // Sub-items
                    if (paragraphText) {
                        processedLines.push(new Paragraph({
                            text: paragraphText.trim(),
                            style: {
                                font: "Calibri",
                                size: 24,
                                color: "262626"
                            },
                            spacing: { before: 120, after: 120 },
                            indent: { left: 0 }
                        }));
                        paragraphText = '';
                    }
                    isInParagraph = false;
                    processedLines.push(new Paragraph({
                        text: line.trim().substring(1).trim(),
                        style: {
                            font: "Calibri",
                            size: 24
                        },
                        bullet: {
                            level: 0
                        },
                        spacing: { before: 120, after: 120 },
                        indent: { left: isInNumberedList ? 720 : 360, hanging: 360 }
                    }));
                } else if (line.trim()) {  // Regular text
                    if (!isInParagraph) {
                        isInParagraph = true;
                        paragraphText = line.trim();
                    } else {
                        paragraphText += ' ' + line.trim();
                    }
                    
                    // If this is the last line, add the paragraph
                    if (index === lines.length - 1 && paragraphText) {
                        processedLines.push(new Paragraph({
                            text: paragraphText.trim(),
                            style: {
                                font: "Calibri",
                                size: 24,
                                color: "262626"
                            },
                            spacing: { before: 120, after: 120 },
                            indent: { left: 0 }
                        }));
                    }
                }
            });

            return processedLines;
        };

        // Function to process competency text into structured paragraphs
        const processCompetencyText = (text) => {
            const lines = text.split('\n');
            const processedLines = [];
            let currentSection = '';

            lines.forEach(line => {
                if (line.trim().startsWith('Matchen:')) {
                    currentSection = 'Matchen';
                    processedLines.push(new Paragraph({
                        text: 'Matchen:',
                        heading: HeadingLevel.HEADING_3,
                        style: {
                            font: "Arial Black",
                            size: 28,
                            bold: true,
                            color: "000000"
                        },
                        spacing: { before: 240, after: 120 },
                        indent: { left: 0 }
                    }));
                } else if (line.trim().startsWith('Matchen niet:')) {
                    currentSection = 'Matchen niet';
                    processedLines.push(new Paragraph({
                        text: 'Matchen niet:',
                        heading: HeadingLevel.HEADING_3,
                        style: {
                            font: "Arial Black",
                            size: 28,
                            bold: true,
                            color: "000000"
                        },
                        spacing: { before: 240, after: 120 },
                        indent: { left: 0 }
                    }));
                } else if (line.trim().startsWith('-')) {
                    const goalText = line.trim().substring(1).trim();
                    processedLines.push(new Paragraph({
                        text: goalText,
                        style: {
                            font: "Calibri",
                            size: 24,
                            color: "262626"
                        },
                        bullet: {
                            level: 0
                        },
                        spacing: { before: 120, after: 120 },
                        indent: { left: 720, hanging: 360 }
                    }));
                } else if (line.trim()) {
                    processedLines.push(new Paragraph({
                        text: line.trim(),
                        style: {
                            font: "Calibri",
                            size: 24,
                            color: "262626"
                        },
                        spacing: { before: 120, after: 120 },
                        indent: { left: 720 }
                    }));
                }
            });

            return processedLines;
        };

        // Create the document
        const doc = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: "Title",
                        name: "Title",
                        run: {
                            font: "Arial Black",
                            size: 48,
                            bold: true,
                            color: "000000"
                        },
                        paragraph: {
                            spacing: { before: 240, after: 400 },
                            alignment: 'center'
                        }
                    },
                    {
                        id: "Heading1",
                        name: "Heading 1",
                        run: {
                            font: "Arial Black",
                            size: 36,
                            bold: true,
                            color: "000000"
                        },
                        paragraph: {
                            spacing: { before: 400, after: 240 },
                            indent: { left: 0 }
                        }
                    },
                    {
                        id: "Heading2",
                        name: "Heading 2",
                        run: {
                            font: "Arial Black",
                            size: 32,
                            bold: true,
                            color: "000000"
                        },
                        paragraph: {
                            spacing: { before: 360, after: 180 },
                            indent: { left: 0 }
                        }
                    },
                    {
                        id: "SubHeading",
                        name: "Sub Heading",
                        run: {
                            font: "Arial",
                            size: 24,
                            bold: true,
                            color: "000000"  // Black color
                        },
                        paragraph: {
                            spacing: { before: 120, after: 120 },
                            indent: { left: 0 }  // No indent for subheadings
                        }
                    },
                    {
                        id: "Normal",
                        name: "Normal",
                        run: {
                            font: "Calibri",
                            size: 24,
                            color: "262626"
                        },
                        paragraph: {
                            spacing: { before: 120, after: 120, line: 360 },
                            indent: { left: 720, hanging: 360 }  // Proper bullet point indentation
                        }
                    }
                ]
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        text: "Lesvoorbereiding",
                        style: "Title"
                    }),
                    new Paragraph({
                        text: "Samenvatting",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    ...processSummaryText(summary),
                    new Paragraph({
                        text: "Lesverloop",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    lessonPlanTable,
                    new Paragraph({
                        text: "Competenties",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    ...sortCompetencies(Object.keys(matchResults)).map(competency => [
                        new Paragraph({
                            text: `Competentie ${competency}: ${competentieNames[competency]}`,
                            heading: HeadingLevel.HEADING_2,
                        }),
                        ...processCompetencyText(matchResults[competency].content[0].text)
                    ]).flat(),
                ],
            }],
        });

        // Generate and download the document
        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lesvoorbereiding.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="analyzer-container">
            <div className="analyzer-header">
                <h1>AI Les Analyzer</h1>
                <p>Upload je les om de leerplandoelen te krijgen</p>
            </div>

            <div className="selector-container">
                <LeerdoelenSelector onSelectionChange={handleCompetencySelect} />
            </div>

            <div className="analyzer-content">
                <div className="upload-section">
                    <PdfUploader onFileSelect={handleFileSelect} />
                    
                    {selectedFile && (
                        <button 
                            className="analyze-button"
                            onClick={analyzePdf} 
                            disabled={isAnalyzing || selectedCompetencies.length === 0}
                        >
                            {isAnalyzing ? 'Bezig met analyseren...' : 'Analyseer Les'}
                        </button>
                    )}

                    {summary && (
                        <div className="results-section">
                            <div className="result-section-header" onClick={() => handleSectionClick('summary')}>
                                <h3>Samenvatting</h3>
                                {expandedSection === 'summary' ? <IoChevronUp /> : <IoChevronDown />}
                            </div>
                            {expandedSection === 'summary' && (
                                <textarea 
                                    value={summary} 
                                    onChange={(e) => setSummary(e.target.value)} 
                                    rows={10}
                                />
                            )}

                            <div className="result-section-header" onClick={() => handleSectionClick('lessonPlan')}>
                                <h3>Lesverloop</h3>
                                {expandedSection === 'lessonPlan' ? <IoChevronUp /> : <IoChevronDown />}
                            </div>
                            {expandedSection === 'lessonPlan' && (
                                <div className="lesson-plan-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Tijd</th>
                                                <th>Activiteit</th>
                                                <th>Beschrijving</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parseLessonPlan(lessonPlan).map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.time}
                                                            onChange={(e) => handleCellEdit(index, 'time', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.activity}
                                                            onChange={(e) => handleCellEdit(index, 'activity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.description}
                                                            onChange={(e) => handleCellEdit(index, 'description', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="competencies-results">
                                {sortCompetencies(Object.keys(matchResults)).map((competency) => {
                                    const result = matchResults[competency];
                                    return (
                                        <div key={competency} className="competency-result">
                                            <div 
                                                className="result-section-header"
                                                onClick={() => handleSectionClick(competency)}
                                            >
                                                <h3>Competentie {competency}: {competentieNames[competency]}</h3>
                                                {expandedSection === competency ? <IoChevronUp /> : <IoChevronDown />}
                                            </div>
                                            {expandedSection === competency && (
                                                result.loading ? (
                                                    <div>Bezig met analyseren...</div>
                                                ) : (
                                                    <textarea 
                                                        value={result.content[0].text}
                                                        onChange={(e) => {
                                                            setMatchResults({
                                                                ...matchResults,
                                                                [competency]: {
                                                                    content: [{ text: e.target.value }]
                                                                }
                                                            });
                                                        }}
                                                        rows={10}
                                                    />
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                className="print-button"
                                onClick={generateWordDocument}
                            >
                                <FiDownload /> Lesvoorbereiding
                            </button>
                        </div>
                    )}
                </div>

                {pdfUrl && (
                    <div className="pdf-preview">
                        <iframe 
                            src={pdfUrl} 
                            title="PDF Viewer"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyzerPage; 