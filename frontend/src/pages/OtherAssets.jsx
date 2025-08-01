import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Checkbox } from "@/components/ui/checkbox";
import {Label } from "@/components/ui/label";
import api from '../services/api';
import {  Card,Title, Text} from '@tremor/react';
import {  HiPlus,  HiPencil,  HiTrash,  HiTrendingUp,  HiTrendingDown,  HiCurrencyDollar,  HiCollection,HiChartBar} from 'react-icons/hi';


const Portfolio = () => {
  const [stocks, setStocks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState({ name: '', grams: 0, buy_price: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gold,setGold]=useState(false);
  const [silver,setSilver]=useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [buttonHover, setButtonHover] = useState(false);
  


  useEffect(() => {
    console.log('Portfolio component mounted');
    fetchAssets();

    const handleThemeChange = (e) => {
      const newTheme = e.detail || localStorage.getItem('theme') || 'light';
      console.log('Theme changed to:', newTheme);
      setTheme(newTheme);
    };

    // Listen for theme changes
    window.addEventListener('themeChange', handleThemeChange);
    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const fetchAssets = async () => {
    try {
      console.log('Fetching stocks from API');
      const response = await api.get('/assets');// ..................................
      console.log('asset response:', response.data);
      setStocks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Failed to fetch stocks');
      setLoading(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding stock:', newStock);
      const response = await api.post('/assets', {  //...................................
        name: newStock.name,
        grams: parseFloat(newStock.grams),
        buy_price: parseFloat(newStock.buy_price)
      });
      handleModalClose();
      await fetchAssets();
    } catch (error) {
      console.error('Error adding stock:', error);
      setError(error.response?.data?.error || 'Failed to add stock');
    }
  };

  const handleEditStock = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating stock:', editingStock);
      await api.put(`/stocks/${editingStock.id}`, {
        name: editingStock.name,
        ticker: editingStock.ticker,
        shares: parseFloat(editingStock.shares),
        buy_price: parseFloat(editingStock.buy_price)
      });
      setShowEditModal(false);
      setEditingStock(null);
      await fetchStocks();
    } catch (error) {
      console.error('Error updating stock:', error);
      setError(error.response?.data?.error || 'Failed to update stock');
    }
  };

  const handleDeleteStock = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        console.log('Deleting stock:', id);
        await api.delete(`/stocks/${id}`);
        await fetchStocks();
      } catch (error) {
        console.error('Error deleting stock:', error);
        setError('Failed to delete stock');
      }
    }
  };

  const handleEditClick = (stock) => {
    setEditingStock(stock);
    setShowEditModal(true);
  };



  // const handleSearchChange = (e) => {
  //   const query = e.target.value;
  //   setNewStock({ ...newStock, name: '', ticker: '' });
    
  //   // Debounce the search
  //   const timeoutId = setTimeout(() => {
  //     searchStocks(query);
  //   }, 300);

  //   return () => clearTimeout(timeoutId);
  // };

 

  const handleModalClose = () => {
    setShowAddModal(false);
    setNewStock({ name: '', grams: 1, buy_price: '' });
    setGold(false);
    setSilver(false);
    // setSearchQuery('');
    // setSearchResults([]);
    // setShowDropdown(false);
  };

  const getTotalValue = () => {
    return stocks.reduce((total, stock) => total + (stock.current_price * stock.grams), 0);
  };

  const getTotalGainLoss = () => {
    const totalGainLoss = stocks.reduce((total, stock) => {
      const gainLoss = ((stock.current_price - stock.buy_price) / stock.buy_price) * 100;
      return total + gainLoss;
    }, 0);
    return stocks.length > 0 ? totalGainLoss / stocks.length : 0;
  };

  console.log('Rendering Portfolio component with theme:', theme);

  return (
    <>
      <motion.div 
        className="p-6 space-y-6"
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Portfolio
            </h1>
            <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your other assets
            </p>
          </div>
          <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={() => setShowAddModal(true)}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2.5 flex items-center gap-2 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
            }`}
          >
            {buttonHover && (
              <motion.span 
                className="absolute inset-0 bg-white opacity-20"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 200, opacity: 0.3 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            )}
            <span className="relative flex items-center justify-center w-6 h-6 bg-white bg-opacity-20 rounded-full">
              <HiPlus className="w-4 h-4" />
            </span>
            <span className="relative">Add Asset</span>
          </motion.button>
          </div>

        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6  ">
            

          <motion.div
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.3, delay: 0.2 }}
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
                <div className="absolute inset-0 bg-emerald-500 opacity-20 rounded-full blur-2xl"></div>
              </div>
              <div className="relative flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg ${
                  theme === 'dark' ? 'shadow-emerald-500/20' : 'shadow-emerald-500/30'
                }`}>
                  <HiCurrencyDollar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Portfolio Value</Text>
                  <Title className={`text-2xl font-bold mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>${getTotalValue().toLocaleString()}</Title>
                </div>
              </div>
            </Card>
          </motion.div>

          <div></div>

          <motion.div
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.3, delay: 0.3 }}
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
                  getTotalGainLoss() >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                } opacity-20 rounded-full blur-2xl`}></div>
              </div>
              <div className="relative flex items-center space-x-4">
                <div className={`p-3 rounded-xl shadow-lg ${
                  getTotalGainLoss() >= 0 
                    ? `bg-gradient-to-br from-emerald-500 to-emerald-600 ${
                        theme === 'dark' ? 'shadow-emerald-500/20' : 'shadow-emerald-500/30'
                      }`
                    : `bg-gradient-to-br from-red-500 to-red-600 ${
                        theme === 'dark' ? 'shadow-red-500/20' : 'shadow-red-500/30'
                      }`
                }`}>
                  <HiChartBar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Average Return</Text>
                  <div className="flex items-center mt-1">
                    {getTotalGainLoss() >= 0 ? (
                      <HiTrendingUp className="h-5 w-5 text-emerald-500 mr-1" />
                    ) : (
                      <HiTrendingDown className="h-5 w-5 text-red-500 mr-1" />
                    )}
                    <Title className={`text-2xl font-bold ${
                      getTotalGainLoss() >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {getTotalGainLoss().toFixed(2)}%
                    </Title>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            // initial={{ opacity: 0, y: -10 }}
            // animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 ${
              theme === 'dark' 
                ? 'bg-red-900/20 border border-red-800 text-red-400' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {error}
          </motion.div>
        )}

        {/* Stocks Table */}
        <div className={`rounded-xl overflow-hidden border shadow-xl ${
          theme === 'dark' 
            ? 'bg-[#171717] border-gray-700/50' 
            : 'bg-white border-gray-200/70'
        }`}>
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${
              theme === 'dark' ? 'bg-[#171717]' : 'bg-white'
            }`}>
              <thead>
                <tr className={`border-b ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-gray-50 border-gray-200/70'
                }`}>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Asset</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Current Price</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Holdings</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Total Value</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Return</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-gray-700/50' : 'divide-gray-200'
              }`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`px-6 py-8 text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="flex flex-col items-center">
                        <HiCollection className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className="mt-2">No stocks in portfolio</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Add Your First Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stocks.map((stock) => {
                    const value = stock.current_price * stock.grams;
                    const gainLoss = ((stock.current_price - stock.buy_price) / stock.buy_price) * 100;
                    const valueChange = (stock.current_price - stock.buy_price) * stock.grams;
                    console.log(value+" value is ");
                    
                    return (
                      <tr 
                        key={stock.id}
                        className={`transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-800/50 bg-[#171717]' 
                            : 'hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                            }`}>{stock.name}</span>
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>{stock.ticker}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          ${stock.current_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                            }`}>{stock.grams.toLocaleString()} grams</span>
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>@ ${stock.buy_price.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          ${value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              gainLoss >= 0
                                ? theme === 'dark'
                                  ? 'bg-emerald-900/30 text-emerald-400'
                                  : 'bg-emerald-100 text-emerald-800'
                                : theme === 'dark'
                                  ? 'bg-red-900/30 text-red-400'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              <span className="mr-1">
                                {gainLoss >= 0 ? (
                                  <HiTrendingUp className="w-4 h-4" />
                                ) : (
                                  <HiTrendingDown className="w-4 h-4" />
                                )}
                              </span>
                              {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)}%
                            </div>
                            <span className={`text-sm ${
                              gainLoss >= 0
                                ? theme === 'dark'
                                  ? 'text-emerald-400'
                                  : 'text-emerald-600'
                                : theme === 'dark'
                                  ? 'text-red-400'
                                  : 'text-red-600'
                            }`}>
                              {valueChange >= 0 ? '+' : ''}${valueChange.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(stock)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <HiPencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300'
                                  : 'bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700'
                              }`}
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Modals using Portal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            // initial={{ scale: 0.9, opacity: 0 }}
            // animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1f1f1f] border border-gray-600'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add New Asset
              </h3>
              <button
                onClick={handleModalClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStock}>
              <div className="space-y-4">
                {/* Stock Search with Autocomplete */}
                <div className="relative">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select asset
                  </label>
                  <div className='flex grid-col-4 justify-between'>
                    <div className="flex items-center gap-3 mx-4">
                       <Checkbox id="gold" className="scale-125" checked={gold}  
                       onCheckedChange={(e)=>{
                        setGold(e); 
                       if (e) {
                          setSilver(false);
                          setNewStock({ ...newStock, name: "Gold" });
                          } else {
                          setNewStock({ ...newStock, name: "" });
                          }
                         
                      }}
                       />
                       <Label htmlFor="gold" className="scale-125">Gold</Label>
                        </div>
                     <div>
                      <div className="flex items-center gap-3 mx-4">
                       <Checkbox id="silver" className="scale-125" checked={silver}
                        onCheckedChange={(e)=>{
                          setSilver(e);
                          if (e) {
                          setGold(false);
                          setNewStock({ ...newStock, name: "Silver" });
                          } else {
                          setNewStock({ ...newStock, name: "" });
                          } 
                          
                         
                        }}
                       />
                       <Label htmlFor="silver" className="scale-125">Silver</Label>
                        </div>
                    </div>

                  </div>
                </div>

              

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of grams
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newStock.grams}
                    onChange={(e) => setNewStock({ ...newStock, grams:  parseFloat(e.target.value) })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Buy Price per gram
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newStock.buy_price}
                    onChange={(e) => setNewStock({ ...newStock, buy_price:  parseFloat(e.target.value) })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newStock.name}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                     newStock.name
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Add asset
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {showEditModal && editingStock && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1f1f1f] border border-gray-600'
                : 'bg-white border border-gray-200'
            }`}
          >
            
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Edit Asset
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStock(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditStock}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Asset
                  </label>
                  <input
                    type="text"
                    value={editingStock.name}
                    onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of grams
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editingStock.shares}
                    onChange={(e) => setEditingStock({ ...editingStock, shares: Math.max(1, parseInt(e.target.value) || 0) })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Buy Price
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editingStock.buy_price}
                    onChange={(e) => setEditingStock({ ...editingStock, buy_price: Math.max(0.01, parseFloat(e.target.value) || 0) })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStock(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Portfolio; 