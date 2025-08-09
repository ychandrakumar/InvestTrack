const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const assetPriceService = require('../services/assetPriceService');
const axios = require('axios');
const supabase = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');



// Get all stocks (portfolio)
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('Fetching assets stocks for user:', req.user.id);
    
    // Use direct Supabase query to be more explicit about filtering
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', req.user.id)
      .gt('grams', 0)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    console.log(`Found ${assets.length} assets for user ${req.user.id}`);
    res.json(assets);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});



// Add new stock
router.post('/', authenticateUser, async (req, res) => {

    console.log("came here in routes/assets/path section ..... ");
  try {
    const { name, grams, buy_price } = req.body;
    console.log('Received request to add stock for user:', req.user.id, req.body);

    // Validate required fields
    if (!name || !grams || !buy_price) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate numeric values
    const parsedGrams = parseFloat(grams);
    const parsedBuyPrice = parseFloat(buy_price);

    if (isNaN(parsedGrams) || parsedGrams <= 0) {
      console.error('Invalid number of grams:', grams);
      throw new Error('Invalid number of grams');
    }

    if (isNaN(parsedBuyPrice) || parsedBuyPrice <= 0) {
      console.error('Invalid buy price:', buy_price);
      throw new Error('Invalid buy price');
    }
    const ticker=(name==="Gold")?"XAU":"XAG";
    console.log('Fetching current price for ticker:', ticker);
    // Get current price from Finnhub
    const quote = await assetPriceService.getAssetQuote(ticker);
    console.log('Received quote:', quote);
    
    // if (!quote || !quote.c) {
    //   console.error('Failed to fetch quote for ticker:', ticker);
    //   throw new Error('Unable to fetch current price for ticker');
    // }

    console.log('Creating asset in database for user:', req.user.id);
    console.log('User object:', {
      id: req.user.id,
      email: req.user.email,
      aud: req.user.aud
    });
    
    const assetData = {
      name: name.trim(),
      grams: parsedGrams,
      buy_price: parsedBuyPrice,
      current_price: (name==="Gold")?(quote.rates.USDXAU)/28.34:(quote.rates.USDXAG)/28.34,
      user_id: req.user.id, // Add user_id
      last_updated: new Date()
    };
    
    console.log('Stock data to insert:', assetData);
    
    const asset = await Asset.create(assetData);

    console.log('asset added successfully:', asset.id);
    res.status(201).json(asset);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(400).json({ error: error.message || 'Failed to add stock' });
  }
});




module.exports = router; 