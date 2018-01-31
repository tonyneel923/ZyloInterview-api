module.exports = {
  apiKey: 'M82HV6ZUXGWA3E81',
  rootApi: 'https://www.alphavantage.co/query?',
  apiMethod: (method) => {
    const methods = {
      daily: 'TIME_SERIES_DAILY',
      batch: 'BATCH_STOCK_QUOTES'
    };
    return methods[method];
  }
};
