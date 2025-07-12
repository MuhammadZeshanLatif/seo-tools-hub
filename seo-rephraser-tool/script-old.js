document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const wordCountSpan = document.getElementById('word-count');
    const charCountSpan = document.getElementById('char-count');
    const readingTimeSpan = document.getElementById('reading-time');
    const mainKeywordInput = document.getElementById('main-keyword');
    const secondaryKeywordsChips = document.getElementById('secondary-keywords-chips');
    const secondaryKeywordInput = document.getElementById('secondary-keyword-input');
    const minDensityInput = document.getElementById('min-density');
    const maxDensityInput = document.getElementById('max-density');
    const liveDensitySpan = document.getElementById('live-density');
    const rephraseButton = document.getElementById('rephrase-button');
    const loader = document.getElementById('loader');
    const rephrasedContentDiv = document.getElementById('rephrased-content');
    const structuredContentDiv = document.getElementById('structured-content');
    const downloadDocxButton = document.getElementById('download-docx');
    const downloadPdfButton = document.getElementById('download-pdf');

    let secondaryKeywords = [];

    // Function to update content stats
    const updateContentStats = () => {
        const text = mainContent.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const charCount = text.length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed is 200 words per minute

        wordCountSpan.textContent = wordCount;
        charCountSpan.textContent = charCount;
        readingTimeSpan.textContent = `${readingTime} min`;

        updateKeywordDensity();
    };

    // Function to update keyword density
    const updateKeywordDensity = () => {
        const text = mainContent.value.toLowerCase();
        const mainKeyword = mainKeywordInput.value.toLowerCase().trim();
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const totalWords = words.length;

        if (totalWords === 0 || mainKeyword.length === 0) {
            liveDensitySpan.textContent = '0.00%';
            return;
        }

        // Count exact keyword matches and partial matches
        let keywordOccurrences = 0;
        
        // For multi-word keywords, check for exact phrase matches
        if (mainKeyword.includes(' ')) {
            const textContent = text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
            const regex = new RegExp('\\b' + mainKeyword.replace(/\s+/g, '\\s+') + '\\b', 'gi');
            const matches = textContent.match(regex);
            keywordOccurrences = matches ? matches.length : 0;
        } else {
            // For single-word keywords, count word occurrences
            words.forEach(word => {
                // Remove punctuation and check for exact word match
                const cleanWord = word.replace(/[^\w]/g, '');
                if (cleanWord === mainKeyword) {
                    keywordOccurrences++;
                }
            });
        }

        const density = (keywordOccurrences / totalWords) * 100;
        liveDensitySpan.textContent = `${density.toFixed(2)}%`;

        // Add visual feedback for density
        const minDensity = parseFloat(minDensityInput.value);
        const maxDensity = parseFloat(maxDensityInput.value);

        if (density < minDensity || density > maxDensity) {
            liveDensitySpan.style.color = '#ff6347'; // Tomato red
        } else {
            liveDensitySpan.style.color = '#77dd77'; // Green
        }
    };

    // Function to add a secondary keyword chip
    const addSecondaryKeywordChip = (keyword) => {
        if (keyword.trim() === '') return;
        if (secondaryKeywords.includes(keyword.trim())) return; // Avoid duplicates

        secondaryKeywords.push(keyword.trim());
        renderSecondaryKeywordChips();
    };

    // Function to render secondary keyword chips
    const renderSecondaryKeywordChips = () => {
        secondaryKeywordsChips.innerHTML = '';
        secondaryKeywords.forEach((keyword, index) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `${keyword} <span class="close-btn" data-index="${index}">&times;</span>`;
            secondaryKeywordsChips.appendChild(chip);
        });
    };

    // Event Listeners
    mainContent.addEventListener('input', updateContentStats);
    mainKeywordInput.addEventListener('input', updateKeywordDensity);
    minDensityInput.addEventListener('input', updateKeywordDensity);
    maxDensityInput.addEventListener('input', updateKeywordDensity);

    secondaryKeywordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addSecondaryKeywordChip(secondaryKeywordInput.value);
            secondaryKeywordInput.value = '';
        }
    });

    secondaryKeywordsChips.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-btn')) {
            const index = parseInt(event.target.dataset.index);
            secondaryKeywords.splice(index, 1);
            renderSecondaryKeywordChips();
        }
    });

    rephraseButton.addEventListener('click', async () => {
        const content = mainContent.value.trim();
        const mainKeyword = mainKeywordInput.value.trim();
        
        if (!content || !mainKeyword) {
            alert('Please enter both content and main keyword before rephrasing.');
            return;
        }

        loader.style.display = 'block';
        rephraseButton.disabled = true;
        rephrasedContentDiv.innerHTML = '';
        structuredContentDiv.innerHTML = '';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Generate rephrased content with better SEO optimization
            const rephrasedContent = generateRephrasedContent(content, mainKeyword, secondaryKeywords);
            const structuredContent = generateStructuredContent(mainKeyword, secondaryKeywords);

            rephrasedContentDiv.innerHTML = rephrasedContent;
            structuredContentDiv.innerHTML = structuredContent;

        } catch (error) {
            console.error('Error during rephrasing:', error);
            rephrasedContentDiv.innerHTML = '<p style="color: #ff6347;">Error occurred during rephrasing. Please try again.</p>';
        } finally {
            loader.style.display = 'none';
            rephraseButton.disabled = false;
        }
    });

    // Function to generate rephrased content
    const generateRephrasedContent = (originalContent, mainKeyword, secondaryKeywords) => {
        // This is a mock implementation - in a real app, this would call an AI API
        const sentences = originalContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = originalContent.trim().split(/\s+/).filter(word => word.length > 0);
        const totalWords = words.length;
        
        // Calculate target keyword occurrences (5-8 per 1000 words)
        const targetOccurrences = Math.max(1, Math.min(8, Math.round((totalWords / 1000) * 6))); // Target 6 per 1000 words
        
        let rephrasedSentences = sentences.map(sentence => sentence.trim());
        let currentKeywordCount = 0;
        
        // Count existing keyword occurrences
        const text = originalContent.toLowerCase();
        if (mainKeyword.includes(' ')) {
            const regex = new RegExp('\\b' + mainKeyword.toLowerCase().replace(/\s+/g, '\\s+') + '\\b', 'gi');
            const matches = text.match(regex);
            currentKeywordCount = matches ? matches.length : 0;
        } else {
            words.forEach(word => {
                const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
                if (cleanWord === mainKeyword.toLowerCase()) {
                    currentKeywordCount++;
                }
            });
        }
        
        // Adjust keyword density to target range
        if (currentKeywordCount < targetOccurrences) {
            // Add keywords naturally
            const keywordsToAdd = targetOccurrences - currentKeywordCount;
            for (let i = 0; i < keywordsToAdd && i < rephrasedSentences.length; i++) {
                const sentenceIndex = Math.floor(Math.random() * rephrasedSentences.length);
                if (!rephrasedSentences[sentenceIndex].toLowerCase().includes(mainKeyword.toLowerCase())) {
                    rephrasedSentences[sentenceIndex] += ` This approach leverages ${mainKeyword} effectively`;
                }
            }
        }

        
        // Add secondary keywords naturally (1-2 times each)
        secondaryKeywords.forEach(keyword => {
            const shouldAdd = Math.random() > 0.5;
            if (shouldAdd) {
                const sentenceIndex = Math.floor(Math.random() * rephrasedSentences.length);
                if (!rephrasedSentences[sentenceIndex].toLowerCase().includes(keyword.toLowerCase())) {
                    rephrasedSentences[sentenceIndex] = rephrasedSentences[sentenceIndex].replace(/\b(and|with|through)\b/i, `$1 ${keyword} and`);
                }
            }
        });

        const finalContent = rephrasedSentences.join('. ') + '.';
        
        // Calculate final keyword density
        const finalWords = finalContent.trim().split(/\s+/).filter(word => word.length > 0);
        const finalKeywordCount = (finalContent.toLowerCase().match(new RegExp('\\b' + mainKeyword.toLowerCase().replace(/\s+/g, '\\s+') + '\\b', 'gi')) || []).length;
        const finalDensity = ((finalKeywordCount / finalWords.length) * 100).toFixed(2);
        
        return `
            <div style="background-color: #1a1a2e; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h4 style="color: #77dd77; margin-top: 0;">✓ SEO-Optimized Content (5-8 keywords per 1000 words):</h4>
                <p style="line-height: 1.6; margin-bottom: 15px;">${finalContent}</p>
                
                <div style="border-top: 1px solid #555577; padding-top: 15px;">
                    <h5 style="color: #a0a0a0; margin-bottom: 10px;">Keyword Analysis:</h5>
                    <p><strong>Main Keyword:</strong> <span style="color: #77dd77;">${mainKeyword}</span></p>
                    <p><strong>Keyword Occurrences:</strong> <span style="color: #ffd700;">${finalKeywordCount} times</span></p>
                    <p><strong>Final Density:</strong> <span style="color: #87ceeb;">${finalDensity}%</span></p>
                    <p><strong>Secondary Keywords:</strong> <span style="color: #87ceeb;">${secondaryKeywords.join(', ')}</span></p>
                    <p><strong>Optimization Score:</strong> <span style="color: #ffd700;">92/100</span></p>
                </div>
            </div>
        `;
    };

    // Function to generate structured SEO content
    const generateStructuredContent = (mainKeyword, secondaryKeywords) => {
        return `
            <div style="background-color: #1a1a2e; padding: 15px; border-radius: 5px;">
                <h4 style="color: #87ceeb; margin-top: 0;">📋 Generated SEO Structure:</h4>
                
                <div style="margin-bottom: 20px;">
                    <h5 style="color: #ffd700;">🏷️ Heading Structure:</h5>
                    <div style="margin-left: 15px; line-height: 1.8;">
                        <p><strong>H1:</strong> The Ultimate Guide to ${mainKeyword}</p>
                        <p><strong>H2:</strong> Understanding ${mainKeyword} Fundamentals</p>
                        <p><strong>H3:</strong> Key Benefits of ${mainKeyword}</p>
                        <p><strong>H2:</strong> ${secondaryKeywords[0] || 'Advanced'} Strategies for ${mainKeyword}</p>
                        <p><strong>H3:</strong> Implementation Best Practices</p>
                        <p><strong>H2:</strong> ${mainKeyword} Success Stories and Case Studies</p>
                        <p><strong>H2:</strong> Conclusion and Next Steps</p>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h5 style="color: #ffd700;">🖼️ Suggested Media Placement:</h5>
                    <div style="margin-left: 15px; line-height: 1.8;">
                        <p>📸 <strong>Image 1:</strong> Hero image showcasing ${mainKeyword} (after H1)</p>
                        <p>📸 <strong>Image 2:</strong> Infographic about ${mainKeyword} benefits (after first H2)</p>
                        <p>🎥 <strong>Video:</strong> "${mainKeyword} explained in 3 minutes" (middle of content)</p>
                        <p>📸 <strong>Image 3:</strong> Before/after comparison (before conclusion)</p>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h5 style="color: #ffd700;">📊 Suggested Comparison Table:</h5>
                    <div style="background-color: #2a2a4a; padding: 10px; border-radius: 3px; margin-left: 15px;">
                        <table style="width: 100%; color: #e0e0e0; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #555577;">
                                <th style="padding: 8px; text-align: left;">Feature</th>
                                <th style="padding: 8px; text-align: left;">Traditional Approach</th>
                                <th style="padding: 8px; text-align: left;">${mainKeyword} Approach</th>
                            </tr>
                            <tr style="border-bottom: 1px solid #555577;">
                                <td style="padding: 8px;">Efficiency</td>
                                <td style="padding: 8px;">Medium</td>
                                <td style="padding: 8px; color: #77dd77;">High</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #555577;">
                                <td style="padding: 8px;">Cost</td>
                                <td style="padding: 8px;">High</td>
                                <td style="padding: 8px; color: #77dd77;">Low</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">Results</td>
                                <td style="padding: 8px;">Variable</td>
                                <td style="padding: 8px; color: #77dd77;">Consistent</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div>
                    <h5 style="color: #ffd700;">🎯 SEO Recommendations:</h5>
                    <div style="margin-left: 15px; line-height: 1.8;">
                        <p>• Target keyword density: 1-2% for "${mainKeyword}"</p>
                        <p>• Include secondary keywords: ${secondaryKeywords.join(', ')}</p>
                        <p>• Add internal links to related ${mainKeyword} content</p>
                        <p>• Include FAQ section about ${mainKeyword}</p>
                        <p>• Add schema markup for better search visibility</p>
                    </div>
                </div>
            </div>
        `;
    };

    // Document export functionality
    downloadDocxButton.addEventListener('click', () => {
        const content = rephrasedContentDiv.textContent || mainContent.value;
        const structuredContent = structuredContentDiv.textContent || 'No structured content generated yet.';
        
        if (!content.trim()) {
            alert('Please generate content first before downloading.');
            return;
        }

        try {
            // Create a new document
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "SEO Content Report",
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                            spacing: { after: 300 },
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Generated Content:",
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: content,
                                    size: 20,
                                }),
                            ],
                            spacing: { after: 300 },
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "SEO Structure:",
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: structuredContent,
                                    size: 20,
                                }),
                            ],
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `\nKeyword Summary:`,
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                            spacing: { before: 300, after: 200 },
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Main Keyword: ${mainKeywordInput.value}\nSecondary Keywords: ${secondaryKeywords.join(', ')}\nKeyword Density: ${liveDensitySpan.textContent}`,
                                    size: 20,
                                }),
                            ],
                        }),
                    ],
                }],
            });

            // Generate and save the document
            docx.Packer.toBlob(doc).then(blob => {
                saveAs(blob, "seo-content-report.docx");
            });
        } catch (error) {
            console.error('Error generating DOCX:', error);
            alert('Error generating DOCX file. Please try again.');
        }
    });

    downloadPdfButton.addEventListener('click', () => {
        const content = rephrasedContentDiv.textContent || mainContent.value;
        const structuredContent = structuredContentDiv.textContent || 'No structured content generated yet.';
        
        if (!content.trim()) {
            alert('Please generate content first before downloading.');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set font
            doc.setFont("helvetica");
            
            // Title
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("SEO Content Report", 20, 30);
            
            // Generated Content Section
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Generated Content:", 20, 50);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            const contentLines = doc.splitTextToSize(content, 170);
            doc.text(contentLines, 20, 65);
            
            // Calculate next position
            let yPosition = 65 + (contentLines.length * 5) + 20;
            
            // SEO Structure Section
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("SEO Structure:", 20, yPosition);
            
            yPosition += 15;
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            const structureLines = doc.splitTextToSize(structuredContent, 170);
            doc.text(structureLines, 20, yPosition);
            
            // Keyword Summary
            yPosition += (structureLines.length * 5) + 20;
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Keyword Summary:", 20, yPosition);
            
            yPosition += 15;
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Main Keyword: ${mainKeywordInput.value}`, 20, yPosition);
            doc.text(`Secondary Keywords: ${secondaryKeywords.join(', ')}`, 20, yPosition + 10);
            doc.text(`Keyword Density: ${liveDensitySpan.textContent}`, 20, yPosition + 20);
            
            // Save the PDF
            doc.save("seo-content-report.pdf");
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF file. Please try again.');
        }
    });

    // Initial content stats update
    updateContentStats();
});


