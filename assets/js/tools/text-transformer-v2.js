async function executeTool(inputs) {
  try {
    // Validate inputs
    if (!inputs.inputText || typeof inputs.inputText !== 'string') {
      throw new Error('inputText is required and must be a string');
    }
    
    const validCases = ['upper', 'lower', 'title'];
    let targetCase = (inputs.targetCase && validCases.includes(inputs.targetCase.toLowerCase())) ? inputs.targetCase.toLowerCase() : 'original';
    
    // Convert text based on case type
    let transformedText;
    if (targetCase === 'upper') {
      transformedText = inputs.inputText.toUpperCase();
    } else if (targetCase === 'lower') {
      transformedText = inputs.inputText.toLowerCase();
    } else if (targetCase === 'title' || targetCase === 'original') {
      const words = inputs.inputText.split(' ').filter(w => w.length > 0);
      if (words.length > 0) {
        transformedText = words.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      } else {
        transformedText = inputs.inputText;
      }
    } else {
      transformedText = inputs.inputText;
    }

    // Character counts
    const charCountTotal = inputs.inputText.length;
    const nonSpaceCharCount = inputs.inputText.replace(/\s/g, '').length;
    
    // Word frequency calculation
    const wordsArray = targetCase === 'original' ? 
      inputs.inputText.split(' ').filter(w => w.length > 0) :
      transformedText.split(' ').filter(w => w.length > 0);
    
    let wordFrequency;
    if (wordsArray.length > 0) {
      const freqObj = {};
      for (const word of wordsArray) {
        freqObj[word] = (freqObj[word] || 0) + 1;
      }
      // Sort by frequency descending, then alphabetically
      wordFrequency = Object.entries(freqObj).sort((a, b) => 
        b[1] - a[1] || a[0].localeCompare(b[0])
      );
    } else {
      wordFrequency = [];
    }

    return { success: true, result: transformedText, charCountTotal, nonSpaceCharCount, wordFrequency: wordsArray.length > 0 ? wordFrequency : undefined }; 
  } catch (error) {
    return { success: false, result: null, error: error.message || 'Unknown error occurred' };
  }
}