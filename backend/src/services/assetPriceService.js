const axios = require('axios');
const Stock = require('../models/Stock');
const supabase = require('../config/supabase');

const METAL_API_KEY = process.env.METAL_API_KEY;
const METAL_BASE_URL = 'https://api.metalpriceapi.com/v1';

const getAssetQuote = async (ticker) => {
  try {
    console.log('Fetching quote for ticker:', ticker);
    const response = await axios.get(`${METAL_BASE_URL}/latest`, {
        //   /latest?api_key={{API_KEY}}&base=USD&currencies=XAU,XAG,EUR
      params: {
        api_key: METAL_API_KEY,
        base: "USD",
        currencies:ticker
      },
      headers:{

      }
    });
    console.log('Quote response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};



module.exports = {
  getAssetQuote,
  // getHistoricalData,
  // updateAssetPrices,
  // startPeriodicUpdates
}; 