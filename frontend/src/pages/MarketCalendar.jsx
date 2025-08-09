import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Badge } from '@tremor/react';
import { 
  HiCalendar, 
  HiTrendingUp, 
  HiTrendingDown, 
  HiCurrencyDollar,
  HiClock,
  HiStar,
  HiNewspaper
} from 'react-icons/hi';
import api from '../services/api';
import Tabs from '../components/ui/Tabs';

const MarketCalendar = ({ theme = 'light' }) => {
  const [earnings, setEarnings] = useState([]);
  const [ipos, setIpos] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(' Fetching market data...');

      // Fetch market data in parallel
      const [earningsRes, iposRes, statusRes] = await Promise.allSettled([
        api.get('/stocks/calendar/earnings'),
        api.get('/stocks/calendar/ipo'),
        api.get('/stocks/market/status')
      ]);

      console.log(' API Responses:', {
        earnings: earningsRes.status === 'fulfilled' ? earningsRes.value.data : 'Failed',
        ipos: iposRes.status === 'fulfilled' ? iposRes.value.data : 'Failed',
        status: statusRes.status === 'fulfilled' ? statusRes.value.data : 'Failed'
      });



      // Handle nested data structure from Finnhub API
      const earningsData = earningsRes.status === 'fulfilled' 
        ? (earningsRes.value.data?.earningsCalendar || earningsRes.value.data || [])
        : [];
      
      const iposData = iposRes.status === 'fulfilled' 
        ? (iposRes.value.data?.ipoCalendar || iposRes.value.data || [])
        : [];
      
      const statusData = statusRes.status === 'fulfilled' 
        ? statusRes.value.data 
        : null;

      setEarnings(earningsData);
      setIpos(iposData);
      setMarketStatus(statusData);

      console.log(' Market data loaded:', {
        earningsCount: earningsData.length,
        iposCount: iposData.length,
        hasStatus: !!statusData
      });
    } catch (error) {
      console.error(' Error fetching market data:', error);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    
    // Handle Finnhub time codes
    switch (timeString) {
      case 'bmo':
        return 'Before Market Open';
      case 'dmt':
        return 'During Market Trading';
      case 'amc':
        return 'After Market Close';
      default:
        // Handle regular time strings
        try {
          return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return timeString;
        }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            IPO Calendar
          </h1>
          <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track IPOs
          </p>
        </div>
        
        {/* Market Status */}
        {/* {marketStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-2xl hover:-translate-y-1 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/50'
              }`}
              decoration="none"
            >
              <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
                <div className={`absolute inset-0 ${
                  getMarketStatusColor(marketStatus) === 'green' ? 'bg-emerald-500' : 'bg-red-500'
                } opacity-20 rounded-full blur-2xl`}></div>
              </div>
              <div className="relative flex items-center space-x-4">
                <div className={`p-3 rounded-xl shadow-lg ${
                  getMarketStatusColor(marketStatus) === 'green'
                    ? `bg-gradient-to-br from-emerald-500 to-emerald-600 ${
                        theme === 'dark' ? 'shadow-emerald-500/20' : 'shadow-emerald-500/30'
                      }`
                    : `bg-gradient-to-br from-red-500 to-red-600 ${
                        theme === 'dark' ? 'shadow-red-500/20' : 'shadow-red-500/30'
                      }`
                }`}>
                  <HiClock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Market Status</Text>
                  <div className="flex items-center mt-1">
                    <Title className={`text-2xl font-bold ${
                      getMarketStatusColor(marketStatus) === 'green' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {getMarketStatusText(marketStatus)}
                    </Title>
                    <div className={`w-2 h-2 rounded-full ml-2 ${
                      getMarketStatusColor(marketStatus) === 'green' 
                        ? 'bg-emerald-500 animate-pulse' 
                        : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )} */}
      </div>

    <div className={`w-full overflow-hidden relative h-full rounded-2xl p-6 backdrop-blur-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800/95 border border-gray-600/50 shadow-2xl' 
                    : 'bg-gradient-to-br from-emerald-50/95 via-green-50/95 to-teal-50/95 shadow-lg border border-emerald-200/50'
                }`}>
                  <div className="flex justify-between items-center mb-6">
                    <Title className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Upcoming IPOs
                    </Title>
                    <Badge color="green">{ipos.length} events</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 max-h-[30rem] overflow-y-auto">
                    {ipos.length > 0 ? (
                      ipos.slice(0, 20).map((ipo, index) => (
                        <div key={index} className={`flex items-center justify-between p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700/95 border border-gray-600/50 hover:bg-gray-700/98' 
                            : 'bg-gradient-to-r from-emerald-50/95 to-teal-50/95 hover:from-emerald-50/98 hover:to-teal-50/98 hover:shadow-lg border border-emerald-100/50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              theme === 'dark' 
                                ? 'bg-green-500/20 border border-green-500/30' 
                                : 'bg-green-100'
                            }`}>
                              <HiStar className={`w-5 h-5 ${
                                theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`font-semibold text-lg ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>{ipo.symbol}</div>
                                <Badge color="green" className="text-xs">IPO</Badge>
                              </div>
                              <div className={`text-sm mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {ipo.companyName}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <HiCalendar className="w-3 h-3" />
                                  {formatDate(ipo.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HiCurrencyDollar className="w-3 h-3" />
                                  ${ipo.priceLow} - ${ipo.priceHigh}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Shares</div>
                            <div className={`font-semibold text-sm ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {ipo.numberOfShares ? (ipo.numberOfShares / 1e6).toFixed(1) + 'M' : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`col-span-full text-center py-8 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No upcoming IPOs found
                      </div>
                    )}
                  </div>
                </div>
    </motion.div>
  );
};

export default MarketCalendar; 