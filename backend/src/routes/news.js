const express = require('express');
const router = express.Router();
const axios = require('axios');

// Test Finnhub connection
router.get('/search', async (req, res) => {
  try {
    console.log("came to news section ");
    
    // console.log('Testing Finnhub connection for ticker:', ticker);
    
    const response = await axios.get('https://api.marketaux.com/v1/news/all', {
      params: {
        symbols: "TSLA,AMZN,MSFT",
        filter_entities: true,
        language:"en",
        api_token:process.env.NEWS_API_KEY
        // token: process.env.FINNHUB_API_KEY
      }
    });
    
    console.log('news response:', response.data.data);
    res.json(response.data.data);
  } catch (error) {
    console.error('news test error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'news test failed',
      details: error.response?.data || error.message,
      apiKey: process.env.FINNHUB_API_KEY ? 'Present' : 'Missing'
    });
  }
});

module.exports = router; 



















module.exports = router; 