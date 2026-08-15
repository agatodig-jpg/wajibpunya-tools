async function executeTool(inputs) {
  if (!inputs || typeof inputs !== 'object') {
    return { success: false, result: null, error: \"Invalid inputs object.\" };
  }

  const textInput = inputs.textInput;
  const contextLimitStr = inputs.contextLimit;

  // Validate Text Input
  if (textInput === undefined || textInput === null) {
    return { success: false, result: null, error: \"textInput is required.\" };
  }

  let text = String(textInput).trim();
  if (text === '') {
    return { success: false, result: null, error: \"textInput cannot be empty.\" };
  }

  // Validate Context Limit
  let contextLimit;
  try {
    contextLimit = parseInt(String(contextLimitStr), 10);
  } catch (e) {
    return { success: false, result: null, error: \"Invalid contextLimit format.\" };
  }

  if (isNaN(contextLimit) || contextLimit <= 0) {
    return { success: false, result: null, error: \"contextLimit must be a positive integer.\" };
  }

  // Token Estimation Logic
  // Approximate token count by counting alphanumeric sequences (words/numbers)
  // Punctuation is treated as separators.
  const cleanText = text.replace(/[^a-zA-Z0-9\\u4e00-\\u9fff]/g, ' ');
  const tokens = cleanText.trim().split(/\\s+/).filter(t => t.length > 0);
  const estimatedTokens = tokens.length;

  // Calculations
  let remainingBudget = contextLimit - estimatedTokens;
  let usagePercentage = 0;
  
  if (contextLimit > 0) {
    usagePercentage = Math.min(100, (estimatedTokens / contextLimit) * 100);
  }

  // UI Visualization Logic (DOM Elements)
  const progressId = 'glm-progress-' + Date.now().toString(36);
  try {
    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.cssText = 'margin: 15px 0; padding: 8px; border-radius: 4px; font-family: monospace; background: #f9f9f9;';

    const label = document.createElement('div');
    label.style.marginBottom = '4px';
    label.innerText = `Tokens Used: ${estimatedTokens} / Limit: ${contextLimit}`;

    const barContainer = document.createElement('div');
    barContainer.style.width = '100%'; barContainer.style.height = '16px'; barContainer.style.background = '#e0e0e0'; barContainer.style.borderRadius = '4px';

    const barFill = document.createElement('div');
    barFill.style.width = usagePercentage + '%'; barFill.style.height = '100%';
    
    // Color coding based on usage
    if (estimatedTokens > contextLimit) {
      barFill.style.background = '#e74c3c'; // Over budget
    } else if (usagePercentage > 90) {
      barFill.style.background = '#f39c12'; // Warning
    } else {
      barFill.style.background = '#2ecc71'; // Good
    }

    barFill.innerText = `(${usagePercentage.toFixed(1)}%)`;
    barContainer.appendChild(barFill);
    progressBarContainer.appendChild(label);
    progressBarContainer.appendChild(barContainer);

    // Render to page (if possible)
    if (document.body) {
      document.body.appendChild(progressBarContainer);
    }
  } catch (uiErr) {
    // Graceful fallback if DOM creation fails in certain environments
    console.warn('Unable to render visual progress bar:', uiErr);
  }

  const data = {
    success: true,
    tokenCount: estimatedTokens,
    limit: contextLimit,
    remaining: remainingBudget < 0 ? 0 : remainingBudget,
    percentage: usagePercentage.toFixed(2) + '%',
    status: remainingBudget < 0 ? 'over_budget' : 'ok'
  };

  return { success: true, result: data, error: null };
}