import { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

// Import the actual images
import gamingLaptops from "../../assets/images/hero/gaming-laptops-banner.jpg";
import summerSale from "../../assets/images/hero/summer-sale-banner.jpg";
import customPC from "../../assets/images/hero/custom-pc-banner.jpg";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme } = useTheme();
  const [autoPlay, setAutoPlay] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const controlsTimerRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: "New Gaming Laptops",
      description: "Experience next-level gaming with our latest collection",
      buttonText: "Shop Now",
      buttonLink: "/category/laptops/gaming",
      image: gamingLaptops,
    },
    {
      id: 2,
      title: "Summer Sale",
      description: "Up to 60% off on selected items",
      buttonText: "View Deals",
      buttonLink: "/special-offers",
      image: summerSale,
    },
    {
      id: 3,
      title: "Build Your Dream PC",
      description: "Customize your perfect setup with our components",
      buttonText: "Start Building",
      buttonLink: "/custom-build",
      image: customPC,
    },
  ];

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  // Handle auto rotation
  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay]);
  
  // Handle controls visibility on mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      // Clear previous timer
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      // Set new timer to hide controls after 3 seconds of no movement
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    // Handle scroll position
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Initial timer
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  // Enhanced blur effect based on scroll position
  const opacity = Math.max(0, Math.min(1, 1 - scrollPosition / 300));
  const blurValue = Math.min(16, scrollPosition / 50);
  
  return (
    <div className="relative w-full min-h-screen">
      {/* Background container */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full"
            style={{ 
              opacity: opacity,
              filter: `blur(${blurValue}px)`
            }}
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark gradient overlay */}
            <div 
              className="absolute inset-0 transition-colors duration-500" 
              style={{ 
                background: `linear-gradient(to right, rgba(0,0,0,${0.8 + (1-opacity)*0.2}) 0%, rgba(0,0,0,${0.6 + (1-opacity)*0.4}) 50%, rgba(0,0,0,${0.4 + (1-opacity)*0.6}) 100%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Add theme-colored background that appears when scrolling */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}
          style={{ opacity: 1 - opacity }}
        />
      </div>

      {/* Content layer */}
      <div 
        className="relative z-10 w-full min-h-screen"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        {/* Content Container */}
        <div className="flex items-center h-screen">
          <div className="container mx-auto px-6 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl ml-16 md:ml-24"
                style={{ opacity: opacity }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-block px-4 py-1 mb-4 bg-primary/90 text-white text-sm font-semibold rounded-full backdrop-blur-sm"
                >
                  Featured Deal
                </motion.div>
                
                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                
                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-xl md:text-2xl text-gray-100 mb-8"
                >
                  {slides[currentSlide].description}
                </motion.p>
                
                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Link
                    to={slides[currentSlide].buttonLink}
                    className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 font-medium text-lg shadow-lg"
                  >
                    {slides[currentSlide].buttonText}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className={`transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Navigation Arrows - now positioned lower on the screen */}
          <div className="absolute top-[60%] left-1/4 right-1/4 transform -translate-y-1/2 flex justify-between z-20">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md transition-all group shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md transition-all group shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-10 bg-primary shadow-lg' 
                    : 'w-3 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}