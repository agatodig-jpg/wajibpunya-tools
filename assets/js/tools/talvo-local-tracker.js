async function executeTool(inputs) {
  try {
    const { csvData, currencyRate, startDate, endDate } = inputs;
    
    // Parse CSV using PapaParse
    const results = await Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });
    
    // Map and filter transactions by date range
    const filteredTransactions = results.data.filter(row => {
      try {
        const parseDate = new Date(row.Date);
        const validStart = !startDate || parseDate >= new Date(startDate);
        const validEnd = !endDate || parseDate <= new Date(endDate);
        return validStart && validEnd;
      } catch {
        return false;
      }
    });
    
    // Aggregate by category
    const summary = {};
    filteredTransactions.forEach(trx => {
      const amount = parseFloat(trx.Amount || 0) * (currencyRate || 1);
      const category = (trx.Category || 'Uncategorized').trim() || 'Uncategorized';
      
      if (!summary[category]) {
        summary[category] = { total: 0, count: 0 };
      }
      
      summary[category].total += amount;
      summary[category].count++;
    });
    
    // Format and transform category data
    const formattedSummary = Object.entries(summary).map(([cat, data]) => ({
      category: cat,
      total: parseFloat(data.total.toFixed(2)),
      count: data.count
    }));
    
    // Calculate totals
    const totalSpending = parseFloat(
      formattedSummary.reduce((sum, item) => sum + item.total, 0).toFixed(2)
    );
    
    // Calculate average daily spend
    let averageDailySpend;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      averageDailySpend = parseFloat(((totalSpending / daysDiff)).toFixed(2));
    } else {
      averageDailySpend = totalSpending.toFixed(2);
    }
    
    const result = {
      totalSpending,
      averageDailySpend,
      summary: formattedSummary,
      filteredCount: filteredTransactions.length
    };
    
    return { success: true, result: result, error: null };
  } catch (error) {
    return { success: false, result: null, error: error.message || 'Failed to process CSV data' };
  }
}