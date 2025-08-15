//require('dotenv').config();
import React, { useState,useEffect } from "react";
import './mainComponent.css';
import { Button,Switch } from "@mui/material";
import axios from 'axios';
import Cards from './cards';
import { createTheme ,ThemeProvider} from '@mui/material/styles';
import {useMediaQuery} from './useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';
import SmartSearchBar from './SmartSearchBar';
import { performSmartSearch } from '../utils/smartSearch';
import InfiniteScrollGrid from './InfiniteScrollGrid';




const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
    },
    neutral: {
      main: '#141414',
      contrastText: 'white',
    },
    neutral2: {
      main: 'rgb(250, 250, 250)',
      contrastText: 'gray',
    },
  },
});


const MainComponent=()=>{
  const isBiggerScreen = useMediaQuery('(min-width: 500px)');
  const handleChange=()=>{
    setIsLightMode(!isLightMode);
    
    // Add smooth transition class
    document.documentElement.style.setProperty("--theme-transition", "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)");
    
    if(!isLightMode){
      document.documentElement.style.setProperty("--text-color", "black");
      document.documentElement.style.setProperty("--background-color", "white")
      document.documentElement.style.setProperty("--background-color2", "white");
      document.documentElement.style.setProperty("--border-color", "gray")
    }else{
      document.documentElement.style.setProperty("--text-color", "white");
      document.documentElement.style.setProperty("--background-color", "rgb(35,35,35)")
      document.documentElement.style.setProperty("--background-color2", "rgb(20,20,20)");
      document.documentElement.style.setProperty("--border-color", "transparent")
    }
  }
  const [isLightMode,setIsLightMode]=useState(false);
  const [imgs,setImgs]=useState();
  const [searchQuery,setSearchQuery]=useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [imageData, setImageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  let array2;
 
  // Enhanced smart search function with pagination
  const handleSmartSearch = async (originalQuery, processedQuery, page = 1) => {
    if (page === 1) {
      setIsSearching(true);
      setSearchQuery(originalQuery);
      setImageData([]);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const searchData = await performSmartSearch(originalQuery, process.env.REACT_APP_UNSPLASH_CLIENT_ID, page);
      setSearchResults(searchData);
      
      const newImages = searchData.results.map((res, index) => {
        // Generate Instagram and Twitter profile URLs using @usernames
        const instagramUrl = res.user?.social?.instagram_username 
          ? `https://www.instagram.com/${res.user.social.instagram_username}`
          : res.user?.username 
          ? `https://www.instagram.com/${res.user.username}`
          : null;
          
        const twitterUrl = res.user?.social?.twitter_username 
          ? `https://twitter.com/${res.user.social.twitter_username}`
          : res.user?.username 
          ? `https://twitter.com/${res.user.username}`
          : null;
        
        return {
          id: res.id,
          srcs: res.srcs,
          alt: res.alt,
          likes: res.likes,
          user: res.user,
          instagramUrl: instagramUrl,
          twitterUrl: twitterUrl
        };
      });
      
      if (page === 1) {
        setImageData(newImages);
      } else {
        setImageData(prev => [...prev, ...newImages]);
      }
      
      setHasNextPage(newImages.length === 30 && searchData.total > page * 30);
      setCurrentPage(page);
      
      console.log(`Smart search: "${originalQuery}" -> "${searchData.processedQuery}" (${newImages.length} results, page ${page})`);
    } catch (e) {
      console.error("Smart search error:", e);
      if (page === 1) {
        searchImgs(originalQuery);
      }
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  // Load more images for infinite scroll
  const loadMoreImages = async () => {
    if (isLoadingMore || !hasNextPage) return;
    
    const nextPage = currentPage + 1;
    if (searchQuery) {
      await handleSmartSearch(searchQuery, null, nextPage);
    } else {
      await loadInitialImages(nextPage);
    }
  };

  // Legacy search function for fallback
  const searchImgs=async(query)=>{
    try{
      console.log("QUERY",query);
      const imagelist=await axios.get( `https://api.unsplash.com/search/photos?query=${query}&per_page=20&page=1`,{
        headers:{
          Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_CLIENT_ID}`
        }
      });
      const array1=imagelist.data.results.map((res=>{
        return {
          id:res.id,srcs:res.urls,alt:res.lt_description,likes:res.likes,user:res.user
        }
      }));
      array2=array1.map((res,index)=>{ return <Cards id={res.id} key={res.id} src={res.srcs} alt={res.alt} likes={res.likes} user={res.user} index={index} />})
      console.log(array2);
      setImgs(array2);
    }catch(e){
      console.log("Error in api",e);
    }
  }



  
  // Load initial images with pagination support
  const loadInitialImages = async (page = 1) => {
    if (page === 1) {
      setIsSearching(true);
      setImageData([]);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await axios.get(`https://api.unsplash.com/search/photos?query=nature&per_page=30&page=${page}`, {
        headers: {
          Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_CLIENT_ID}`
        }
      });

      const newImages = response.data.results.map((res, index) => {
        // Generate Instagram and Twitter profile URLs using @usernames
        const instagramUrl = res.user?.social?.instagram_username 
          ? `https://www.instagram.com/${res.user.social.instagram_username}`
          : res.user?.username 
          ? `https://www.instagram.com/${res.user.username}`
          : null;
          
        const twitterUrl = res.user?.social?.twitter_username 
          ? `https://twitter.com/${res.user.social.twitter_username}`
          : res.user?.username 
          ? `https://twitter.com/${res.user.username}`
          : null;
        
        return {
          id: res.id,
          srcs: res.urls,
          alt: res.alt_description,
          likes: res.likes,
          user: res.user,
          instagramUrl: instagramUrl,
          twitterUrl: twitterUrl
        };
      });

      if (page === 1) {
        setImageData(newImages);
      } else {
        setImageData(prev => [...prev, ...newImages]);
      }

      setHasNextPage(newImages.length === 30);
      setCurrentPage(page);
      console.log(`Loaded ${newImages.length} images (page ${page})`);
    } catch (e) {
      console.error("Error loading images:", e);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }
  useEffect(()=>{
    loadInitialImages();
  },[])  
    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
           <motion.div 
             className="topTab"
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.6, ease: "easeOut" }}
           >
               <motion.div 
                 className='imgGallery' 
                 style={{fontSize:'30px',fontWeight:400}}
                 initial={{ x: -30, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
               >
                 Image Gallery
               </motion.div>
               <motion.div 
                 className="club" 
                 style={{display:'flex',justifyContent:'center'}}
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 0.6, delay: 0.3 }}
               >
                 <SmartSearchBar
                   onSearch={handleSmartSearch}
                   isLightMode={isLightMode}
                   isBiggerScreen={isBiggerScreen}
                   initialQuery={searchQuery}
                 />
               </motion.div>
      
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Switch
                  color="default"
                  checked={isLightMode}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </motion.div>
              <span style={{fontSize:'1.1rem'}}>Change Mode</span>
              </motion.div>
           </motion.div>
           <motion.div 
             className="midSection"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
           ></motion.div>
           {/* Search Results Info */}
           {(searchResults || isSearching) && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               style={{
                 textAlign: 'center',
                 padding: '20px',
                 color: 'var(--text-color)',
                 fontSize: '14px'
               }}
             >
               {isSearching ? (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                     style={{ 
                       width: '20px', 
                       height: '20px', 
                       border: '2px solid var(--text-color)', 
                       borderTop: '2px solid transparent', 
                       borderRadius: '50%' 
                     }}
                   />
                   <span>Searching with AI...</span>
                 </div>
               ) : searchResults && (
                 <div>
                   Found <strong>{searchResults.total}</strong> results for "<strong>{searchQuery}</strong>"
                   {searchResults.processedQuery !== searchQuery && (
                     <div style={{ opacity: 0.7, marginTop: '5px' }}>
                       Enhanced search: "{searchResults.processedQuery}"
                     </div>
                   )}
                 </div>
               )}
             </motion.div>
           )}

           {/* Infinite Scroll Grid */}
           <motion.div 
             className="infinite-scroll-container"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.6 }}
           >
             <InfiniteScrollGrid
               images={imageData}
               onLoadMore={loadMoreImages}
               hasNextPage={hasNextPage}
               isLoading={isLoadingMore}
             />
           </motion.div>
        </motion.div>
    )
}

export default MainComponent ;