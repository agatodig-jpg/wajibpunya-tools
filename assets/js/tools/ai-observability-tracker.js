async function executeTool(inputs) {
  try {
    const { metric_name, current_value, previous_value, discussion_link } = inputs;

    if (!metric_name || isNaN(current_value)) {
      throw new Error('Invalid input metrics: metric_name and current_value are required');
    }

    let prevValue = typeof previous_value === 'number' ? Number(previous_value) : 0;
    const curValue = Number(current_value);
    const discussionUrl = String(discussion_link || '');

    // Calculate percentage change
    if (prevValue !== 0 && !isNaN(prevValue)) {
      const pctChange = ((curValue - prevValue) / Math.abs(prevValue)) * 100;
      return { 
        success: true, 
        result: { 
          metricName: metric_name, 
          currentVal: curValue, 
          previousVal: prevValue, 
          percentageChange: Number(pctChange).toFixed(2), 
          discussionLink: discussionUrl 
        }, 
        error: null 
      };
    }

    if (curValue !== 0) {
      return { 
        success: true, 
        result: { 
          metricName: metric_name, 
          currentVal: curValue, 
          previousVal: prevValue, 
          percentageChange: '∞', 
          isFirstObservation: true, 
          discussionLink: discussionUrl 
        }, 
        error: null 
      };
    }

    return { 
      success: true, 
      result: { 
        metricName: metric_name, 
        currentVal: curValue, 
        previousVal: prevValue, 
        percentageChange: 0, 
        isFirstObservation: false, 
        discussionLink: discussionUrl 
      }, 
      error: null 
    };

  } catch (err) {
    throw err;
  }
}
