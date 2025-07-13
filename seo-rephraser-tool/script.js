document.addEventListener('DOMContentLoaded', () => {
    // تمام عناصر کا انتخاب
    const mainContent = document.getElementById('main-content');
    const mainKeywordInput = document.getElementById('main-keyword');
    const secondaryKeywordsChips = document.getElementById('secondary-keywords-chips');
    const secondaryKeywordInput = document.getElementById('secondary-keyword-input');
    const rephraseButton = document.getElementById('rephrase-button');
    const loader = document.getElementById('loader');
    const rephrasedContentDiv = document.getElementById('rephrased-content');
    const structuredContentDiv = document.getElementById('structured-content');
    // ... باقی عناصر کا انتخاب ...

    let secondaryKeywords = [];

    // **انتہائی آسان API کال کا طریقہ**
    rephraseButton.addEventListener('click', async () => {
        const content = mainContent.value.trim();
        const mainKeyword = mainKeywordInput.value.trim();
        
        if (!content) {
            alert('Please provide the main content to proceed.');
            return;
        }

        loader.style.display = 'block';
        rephraseButton.disabled = true;
        rephrasedContentDiv.innerHTML = '';
        structuredContentDiv.innerHTML = '';

        // API کی تفصیلات
        const apiKey = '5b2acdeb97mshd32507b719470f0p1b7f6bjsn08004e5af014';
        // ہم '/rephrase' اینڈ پوائنٹ کو آزمائیں گے کیونکہ یہ سب سے منطقی لگتا ہے
        const url = 'https://api-web-content-optimizer.p.rapidapi.com/rephrase';

        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'api-web-content-optimizer.p.rapidapi.com'
            },
            body: JSON.stringify({
                content: content,
                main_keyword: mainKeyword, // اگر یہ کام نہ کرے تو اسے ہٹا دیں
                secondary_keywords: secondaryKeywords // اگر یہ کام نہ کرے تو اسے ہٹا دیں
            } )
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json(); // ہم جواب کو JSON کے طور پر پڑھنے کی کوشش کریں گے

            // **اہم ڈیبگنگ کا مرحلہ**
            // API کے پورے جواب کو کنسول میں پرنٹ کریں
            console.log('API Response:', result);

            if (!response.ok) {
                // اگر API نے خرابی بھیجی ہے، تو اسے دکھائیں
                throw new Error(result.message || 'An unknown API error occurred.');
            }

            // فرض کریں کہ جواب میں 'rephrased_content' نامی کلید ہے
            const apiResponseContent = result.rephrased_content || JSON.stringify(result, null, 2);

            // API کے جواب کو دونوں جگہوں پر دکھائیں تاکہ ہم اسے دیکھ سکیں
            rephrasedContentDiv.textContent = apiResponseContent; // .textContent استعمال کریں تاکہ HTML ٹیگز نظر آئیں
            structuredContentDiv.textContent = apiResponseContent;

        } catch (error) {
            console.error('Error during API call:', error);
            rephrasedContentDiv.innerHTML = `<p style="color: #FCA5A5;"><b>Error:</b> ${error.message}. Check the console for more details.</p>`;
            structuredContentDiv.innerHTML = `<p style="color: #FCA5A5;">Could not generate content due to an error.</p>`;
        } finally {
            loader.style.display = 'none';
            rephraseButton.disabled = false;
        }
    });

    // باقی تمام فنکشنز (updateContentStats, addSecondaryKeywordChip, وغیرہ) یہاں شامل کریں...
    // ...
});
