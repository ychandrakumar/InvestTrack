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

// Get historical data for a stock
// router.get('/:ticker/history', async (req, res) => {
//   try {
//     const { ticker } = req.params;
//     const { resolution = 'D', from, to } = req.query;

//     const historicalData = await stockPriceService.getHistoricalData(
//       ticker,
//       resolution,
//       from ? parseInt(from) : null,
//       to ? parseInt(to) : null
//     );

//     if (!historicalData) {
//       return res.status(404).json({ error: 'No historical data available' });
//     }

//     res.json(historicalData);
//   } catch (err) {
//     console.error('Error fetching historical data:', err);
//     res.status(500).json({ error: 'Failed to fetch historical data' });
//   }
// });

// // Get real-time quote for a stock
// router.get('/:ticker/quote', async (req, res) => {
//   try {
//     const { ticker } = req.params;
//     const quote = await stockPriceService.getQuote(ticker);

//     if (!quote) {
//       return res.status(404).json({ error: 'Quote not available' });
//     }

//     res.json(quote);
//   } catch (err) {
//     console.error('Error fetching quote:', err);
//     res.status(500).json({ error: 'Failed to fetch quote' });
//   }
// });

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

// // Update stock
// router.put('/:id', authenticateUser, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, ticker, shares, buy_price } = req.body;
//     console.log('Updating stock for user:', req.user.id, id, { name, ticker, shares, buy_price });

//     const stock = await Stock.findByPk(id);
//     if (!stock) {
//       return res.status(404).json({ error: 'Stock not found' });
//     }

//     // Check if the stock belongs to the user
//     if (stock.user_id !== req.user.id) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     // Validate numeric values if provided
//     let parsedShares = shares !== undefined ? parseFloat(shares) : stock.shares;
//     let parsedBuyPrice = buy_price !== undefined ? parseFloat(buy_price) : stock.buy_price;

//     if (shares !== undefined && (isNaN(parsedShares) || parsedShares < 0)) {
//       throw new Error('Invalid number of shares');
//     }

//     if (buy_price !== undefined && (isNaN(parsedBuyPrice) || parsedBuyPrice < 0)) {
//       throw new Error('Invalid buy price');
//     }

//     // Get current price from Finnhub if ticker changed
//     let current_price = stock.current_price;
//     if (ticker && ticker !== stock.ticker) {
//       const quote = await stockPriceService.getStockQuote(ticker);
//       if (!quote || !quote.c) {
//         throw new Error('Unable to fetch current price for ticker');
//       }
//       current_price = quote.c;
//     }

//     await stock.update({
//       name: name ? name.trim() : stock.name,
//       ticker: ticker ? ticker.toUpperCase().trim() : stock.ticker,
//       shares: parsedShares,
//       buy_price: parsedBuyPrice,
//       current_price,
//       last_updated: new Date()
//     });

//     console.log('Stock updated:', id);
//     res.json(stock);
//   } catch (error) {
//     console.error('Error updating stock:', error);
//     res.status(400).json({ error: error.message || 'Failed to update stock' });
//   }
// });

// // Delete stock
// router.delete('/:id', authenticateUser, async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Deleting stock for user:', req.user.id, id);

//     const stock = await Stock.findByPk(id);
//     if (!stock) {
//       return res.status(404).json({ error: 'Stock not found' });
//     }

//     // Check if the stock belongs to the user
//     if (stock.user_id !== req.user.id) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     await stock.destroy();
//     console.log('Stock deleted:', id);
//     res.json({ message: 'Stock deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting stock:', error);
//     res.status(500).json({ error: 'Failed to delete stock' });
//   }
// });

// // Get portfolio summary
// router.get('/summary', authenticateUser, async (req, res) => {
//   try {
//     console.log('Getting portfolio summary for user:', req.user.id);
    
//     // Use direct Supabase query to be more explicit about filtering
//     const { data: stocks, error } = await supabase
//       .from('stocks')
//       .select('*')
//       .eq('user_id', req.user.id)
//       .gt('shares', 0)
//       .eq('is_in_watchlist', false); // Only get stocks that are NOT in watchlist
    
//     if (error) throw error;

//     const summary = {
//       totalValue: 0,
//       totalGain: 0,
//       totalGainPercent: 0,
//       stockCount: stocks.length
//     };

//     for (const stock of stocks) {
//       const stockValue = stock.shares * stock.current_price;
//       const stockCost = stock.shares * stock.buy_price;
//       const stockGain = stockValue - stockCost;

//       summary.totalValue += stockValue;
//       summary.totalGain += stockGain;
//     }

//     if (summary.totalValue > 0) {
//       summary.totalGainPercent = (summary.totalGain / (summary.totalValue - summary.totalGain)) * 100;
//     }

//     console.log('Portfolio summary:', summary);
//     res.json(summary);
//   } catch (error) {
//     console.error('Error getting portfolio summary:', error);
//     res.status(500).json({ error: 'Failed to get portfolio summary' });
//   }
// });


// // // Get historical data for a stock
// // router.get('/:ticker/historical', async (req, res) => {
// //   try {
// //     const { ticker } = req.params;
// //     const { period = '1D' } = req.query;

// //     let resolution;
// //     let from;
// //     const to = Math.floor(Date.now() / 1000);

// //     switch (period) {
// //       case '1D':
// //         resolution = '5';
// //         from = to - 24 * 60 * 60;
// //         break;
// //       case '1W':
// //         resolution = '15';
// //         from = to - 7 * 24 * 60 * 60;
// //         break;
// //       case '1M':
// //         resolution = '60';
// //         from = to - 30 * 24 * 60 * 60;
// //         break;
// //       case '3M':
// //         resolution = 'D';
// //         from = to - 90 * 24 * 60 * 60;
// //         break;
// //       case '1Y':
// //         resolution = 'D';
// //         from = to - 365 * 24 * 60 * 60;
// //         break;
// //       case 'ALL':
// //         resolution = 'W';
// //         from = to - 5 * 365 * 24 * 60 * 60;
// //         break;
// //       default:
// //         resolution = '5';
// //         from = to - 24 * 60 * 60;
// //     }

// //     // Use direct API call instead of finnhubClient
// //     const response = await axios.get('https://finnhub.io/api/v1/stock/candle', {
// //       params: {
// //         symbol: ticker,
// //         resolution: resolution,
// //         from: from,
// //         to: to,
// //         token: process.env.FINNHUB_API_KEY
// //       }
// //     });

// //     const data = response.data;
    
// //     if (data.s !== 'ok') {
// //       throw new Error('Failed to fetch historical data');
// //     }

// //     const historicalData = data.t.map((timestamp, index) => ({
// //       time: new Date(timestamp * 1000).toISOString(),
// //       price: data.c[index]
// //     }));

// //     res.json(historicalData);
// //   } catch (error) {
// //     console.error('Error fetching historical data:', error);
// //     res.status(500).json({ error: 'Failed to fetch historical data' });
// //   }
// // });



module.exports = router; 