//require('dotenv').config();
import React, { useState,useEffect } from "react";
import './mainComponent.css';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import {useMediaQuery} from './useMediaQuery';
import { motion } from 'framer-motion';
import ColorThief from 'colorthief';


const Cards=({id,src,alt,likes,user,index})=>{


  const isBiggerScreen = useMediaQuery();


  const [open,setOpen]=useState(false);
  const [open2,setOpen2]=useState(false);
  const [colors, setColors] = useState([]);
  const [isHovered, setIsHovered] = useState(false);


  useEffect(()=>{
    // Extract dominant colors from image
    const extractColors = async () => {
      try {
        const colorThief = new ColorThief();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const palette = colorThief.getPalette(img, 4);
            setColors(palette.map(color => `rgb(${color[0]}, ${color[1]}, ${color[2]})`));
          } catch (error) {
            console.log('Color extraction failed:', error);
          }
        };
        img.src = src.thumb;
      } catch (error) {
        console.log('Color extraction error:', error);
      }
    };
    
    extractColors();
  },[])
 
 
  const handleClose=()=>{
    setOpen(false);
  }
  const style = {
    container: isBiggerScreen => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'transparent',
    border: 'none',
    width:isBiggerScreen?'500px':'350px',
    height:isBiggerScreen?'600px':'580px',
    boxShadow:0,
    p:0,
    })
  };
  
  return(
    <motion.div 
      className="cardDiv"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.08, 
        y: -15,
        rotateY: 5,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Modal
        open={open}
        onClose={handleClose}
        style={{backgroundColor:'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)'}}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ ...style.container(isBiggerScreen)}}
            onMouseEnter={()=>{setOpen2(true)}} onMouseLeave={()=>{setOpen2(false)}}
            >
              <div style={{display:'flex',justifyContent:'center',width:'100%',height:'100%'}}><img id={`cardimg_${id}2`} src={src.small} width="100%" height='100%' alt="img" className="cardimg" /></div>
              <Backdrop
                sx={{ color: '#fff', backgroundColor:'rgba(0, 0, 0, 0.799)' ,zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={open2}
              >
                <div className="nameAndLike2">
                  <div className="userName2">
                    <div className="imgAndbio">
                      <div> <img  src={user.profile_image.large} alt={user.name} className="profileImg" /></div>
                      <div><span style={{color:'white'}}>@{user.username}</span></div>
                      <div style={{fontSize:'1.0rem',color:'white'}}>{user.location}</div>
                      <div>{user.for_hire?<div className="hire" style={{color:'white'}}>Available to be hired</div>:null}</div>
                      <div className="bio">{user.bio}</div>
                    </div>
                    <div className="profleAndLikes" style={{display:'flex',justifyContent:'space-between'}}>
                    <div className="profile">
                      <div className="nameModal">{user.name.length>13?(user.first_name):user.name}</div>
                      <div>
                        <button 
                          // clasName="btns" 
                          style={{width:'100px',height:'30px',margin:'5px 0 10px 0',color:'black',borderRadius:'0.4rem',border:'0px solid transparent'}}
                          >
                            <a target="blank" href={user.links.html} style={{textDecoration:'none',color:'black'}} >Profile</a>
                        </button>
                      </div>
                      <div 
                      // clasName="btns" 
                        style={{width:'100px',height:'30px',margin:'0px 0 10px 0',color:'black',borderRadius:'1.1rem',border:'0px solid transparent'}} 
                      >  
                          {user.portfolio_url?<button style={{width:'100px',height:'30px',margin:'0px 0 10px 0',color:'black',borderRadius:'0.4rem',border:'0px solid transparent'}}><a target="blank" href={user.portfolio_url} style={{textDecoration:'none',color:'black'}} >Portfolio Url</a><br/></button>:null}
                      </div>
                    </div>
                    
                      <div className="right">
                        <div style={{color:'white'}}>Connect and Like</div>
                        <div className="socialHandles">
                          <div className="socialmedia">
                            <a target="blank" href={`https://www.instagram.com/${user.social.instagram_username}`}><InstagramIcon fontSize="large" sx={{ color:'pink' }}/></a>
                          </div>
                          <div className="socialmedia">
                            <a target="blank" href={`https://www.twitter.com/${user.social.twitter_username}`} ><TwitterIcon fontSize="large" color="primary"/></a>
                          </div>
                        </div>
                        <div className="likesAndPhotos">
                          <FavoriteIcon sx={{ color:'gray' }} fontSize="medium"/> <div style={{marginRight:10,color:'white'}}> &nbsp;{user.total_likes}</div> | &nbsp;&nbsp;
                          <InsertPhotoIcon /><div style={{color:'white'}}>&nbsp;{user.total_photos}</div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </Backdrop>
            </Box>
        </motion.div>
      </Modal>
     
        <motion.img 
          id={`cardimg_${id}`} 
          style={{borderTopLeftRadius:'0.4rem',borderTopRightRadius:'0.4rem', width: '100%', height: '270px', objectFit: 'cover'}} 
          src={src.thumb} 
          alt={alt} 
          onClick={()=>{setOpen(true)}}
          whileHover={{ 
            scale: 1.1,
            filter: "brightness(1.1) contrast(1.1)",
            transition: { duration: 0.3 }
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1 + 0.2,
            ease: "easeOut"
          }}
        />
        
        <motion.div 
          className="nameAndLike"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0.9, 
            y: isHovered ? -8 : 0,
            scale: isHovered ? 1.02 : 1
          }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
        >
          <div className="userName">
            <div className="imgProfile">
              <img  src={user.profile_image.small} alt={user.name} style={{borderRadius:'50%',margin:'5px auto', width: '40px', height: '40px'}} />
            </div>
            <div className="names">
              <span>{user.name.length>14?(user.first_name):user.name}</span><br/>
              <span style={{color:'rgb(190, 190, 190)'}}>@{user.username.length>13?(user.username.substring(0,13)+'..'):user.username}</span>
            </div>
          </div>
          <div className="likes">
            <div>
              <ThumbUpAltOutlinedIcon fontSize="small"/>
            </div>
            <div style={{fontSize:'0.7rem'}}>
              {likes}
            </div>
          </div>
        </motion.div>

        {/* Color Palette Swatches */}
        {colors.length > 0 && (
          <motion.div 
            className="color-palette"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1 + 0.8,
              duration: 0.5,
              ease: "easeOut"
            }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              background: 'var(--background-color2)',
              borderBottomLeftRadius: '0.4rem',
              borderBottomRightRadius: '0.4rem'
            }}
          >
            {colors.slice(0, 4).map((color, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: index * 0.1 + 0.9 + idx * 0.1,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.3,
                  transition: { duration: 0.2 }
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '2px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  boxShadow: `0 2px 8px ${color}40`
                }}
              />
            ))}
          </motion.div>
        )}
    </motion.div>
  )
}

export default Cards;
