import React, { useEffect, useState } from 'react'
import {Card, CardContent, CardHeader, CardTitle,  } from "../components/ui/card";
import {Button } from "../components/ui/button";
import axios from 'axios';
import { Text } from '@tremor/react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


 


function News() {
  const data=[
        {
            "title": "Container Store Cleared to Exit Bankruptcy in Take-Private Deal",
            "description": "The Container Store won court approval to exit bankruptcy a little more than a month after filing Chapter 11 and to enact a lender-backed plan to cut its debt and provide the retailer with fresh capital to withstand the post-pandemic sales lull.",
            "url": "https://www.livemint.com/companies/news/container-store-cleared-to-exit-bankruptcy-in-take-private-deal-11737751546194.html",
            "image_url": "https://www.livemint.com/lm-img/img/2024/12/06/1600x900/company_2_1733465085102_1733465089141.png"
            
        },
        {
            "title": "Retailer Joann Is Considering Second Bankruptcy Filing in a Year",
            "description": "Joann Inc., the fabric and crafts retailer that emerged from Chapter 11 less than a year ago, is considering filing for bankruptcy again as it runs out of cash, according to people with knowledge of the matter.",
            "url": "https://www.livemint.com/companies/news/retailer-joann-is-considering-second-bankruptcy-filing-in-a-year-11736542954794.html",
            "image_url": "https://www.livemint.com/lm-img/img/2024/12/06/1600x900/company_2_1733465085102_1733465089141.png"
        },
        {
            "title": "How Low Can Bond Spreads Go? Five Numbers to Watch",
            "description": "(Bloomberg) -- Corporate-bond valuations are in nosebleed territory, flashing their biggest warning in almost 30 years as an influx of money from pension fund managers and insurers boosts competition for assets. So far, investors are sanguine about the risk.Most Read from BloombergIs This Weird Dome the Future of Watching Sports?NYPD Seeking Gunmen After 10 People Wounded Outside Queens VenueBurned-Out Parents Need Better Public SpacesDetroit’s Michigan Central Is the Building Revival Story of 2",
            "url": "https://finance.yahoo.com/news/low-bond-spreads-five-numbers-200000480.html",
            "image_url": "https://s.yimg.com/ny/api/res/1.2/pRf5ts4M0wGi8t9uEeN5jg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD03Njg-/https://media.zenfs.com/en/bloomberg_markets_842/7d3310d9aaf2338df29e4edb66018e01" 
        }
    ]

 const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [news,setNews] =useState(data);



    useEffect(() => {
      
      const handleThemeChange = (e) => {
        const newTheme = e.detail || localStorage.getItem('theme') || 'light';
        console.log('Theme changed to:', newTheme);
        setTheme(newTheme);
      };
  
     
      window.addEventListener('themeChange', handleThemeChange);
      document.addEventListener('themeChanged', handleThemeChange);
  
      return () => {
        window.removeEventListener('themeChange', handleThemeChange);
        document.removeEventListener('themeChanged', handleThemeChange);
      };
    }, []);


  useEffect(() => {
   const fetchNews = async () => {
      try {
       
        const response = await axios.get(`${API_BASE_URL}/news/search`);
        console.log('News response:', response.data);
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching News', error);
  
      }
    };
    fetchNews();

    if(news==null)setNews(data);

  },[]);


  return (
    <>
    <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} m-4 p-4` }>
              News
            </h1>
            
          </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-4">

  {news.map((ele, index) => (
    <Card
      key={index}
      className={`relative p-6 rounded-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#1f1f1f]/80 border border-white/10 backdrop-blur-md'
                : 'bg-white/80 border border-gray-200 backdrop-blur-md'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
    >
       <div className={`absolute pointer-events-none inset-0 bg-gradient-to-br ${
              theme === 'dark' 
                ? 'from-blue-500/10 via-purple-500/5 to-transparent' 
                : 'from-blue-100/30 via-purple-100/20 to-transparent'
            } blur-xl`}></div>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{ele.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-4">
          {ele.description}
        </p>
      </CardHeader>
      <CardContent>
        <img
          src={ele.image_url}
          alt="img"
          className="w-full h-40 object-cover rounded-lg mt-2"
        />
      </CardContent>
      <Button>
        <a href={ele.url} target='_blank'>Read more..</a>
        </Button>
    </Card>
  ))}
</div>
</>


  )
}

export default News;




