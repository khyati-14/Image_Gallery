import React from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { motion } from 'framer-motion';
import './SocialFooter.css';

const SocialFooter = ({ isLightMode }) => {
  return (
    <motion.footer 
      className={`social-footer ${isLightMode ? 'light-mode' : 'dark-mode'}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="footer-content">
        <motion.div 
          className="footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Connect and Like
        </motion.div>
        
        <motion.div 
          className="socialHandles"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, type: "spring", stiffness: 100 }}
        >
          <motion.div 
            className="socialmedia"
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 1 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <a 
              target="blank" 
              href="https://www.instagram.com/"
              rel="noopener noreferrer"
            >
              <InstagramIcon 
                fontSize="large" 
                sx={{ color: 'pink' }}
              />
            </a>
          </motion.div>
          
          <motion.div 
            className="socialmedia"
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 1 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <a 
              target="blank" 
              href="https://www.twitter.com/"
              rel="noopener noreferrer"
            >
              <TwitterIcon 
                fontSize="large" 
                color="primary"
              />
            </a>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="footer-divider"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: 1.1 }}
        />
        
        <motion.div 
          className="footer-copyright"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          © 2024 Image Gallery. Made with ❤️
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default SocialFooter;
