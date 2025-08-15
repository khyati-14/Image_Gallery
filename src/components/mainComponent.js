//require('dotenv').config();
import React, { useState,useEffect } from "react";
import './mainComponent.css';
import { Button,Switch } from "@mui/material";
import axios from 'axios';
import Cards from './cards';
import { createTheme ,ThemeProvider} from '@mui/material/styles';
import {useMediaQuery} from './useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';




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
  let array2;
 
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



  
  const initial=async()=>{
    try{
      const imagelist=await axios.get('https://api.unsplash.com/search/photos?query=tree&per_page=20&page=1',{
        headers:{
          Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_CLIENT_ID}`
        }
      });
      // const array=imagelist.data.results
      const array1=imagelist.data.results.map((res=>{
        return {id:res.id,srcs:res.urls,alt:res.lt_description,likes:res.likes,user:res.user}
      }));
      array2=array1.map((res,index)=>{ return <Cards id={res.id} key={res.id} src={res.srcs} alt={res.alt} likes={res.likes} user={res.user} index={index} />})
      console.log(array1);
      setImgs(array2);
    }catch(e){
      console.log("Error in api",e);
    }
    
  }
  useEffect(()=>{
    initial();
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
               <div className="search">
                 <motion.input 
                   style={{
                     width:(isBiggerScreen?'300px':'250px'),
                     height:'100%',
                     backgroundColor:(isLightMode?'rgb(230,230,230)':'gray'),
                     color:(isLightMode?'black':'white'),
                     borderRadius:'0.4rem',
                     border:'none',
                     paddingLeft:'15px',
                     transition: 'all 0.3s ease'
                   }} 
                   id="imgName" 
                   value={searchQuery} 
                   onChange={e=>{setSearchQuery(e.target.value);searchImgs(e.target.value)}} 
                   type="text" 
                   placeholder=" search here.."
                   whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,123,255,0.3)" }}
                 />
               </div>&nbsp;&nbsp;
               <motion.div 
                 className="searchBtn"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <ThemeProvider theme={theme}>
                 <Button variant="contained" onClick={()=>searchImgs(searchQuery)} color={isLightMode?"neutral2":'neutral'}>Search</Button>
                 </ThemeProvider>
                </motion.div>
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
           <motion.div 
             className="grid"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.6 }}
           >
             <AnimatePresence mode="wait">
               {imgs}
             </AnimatePresence>
           </motion.div>
        </motion.div>
    )
}

export default MainComponent ;