import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Import the actual images
import gamingLaptops from "../../assets/images/hero/gaming-laptops-banner.jpg";
import summerSale from "../../assets/images/hero/summer-sale-banner.jpg";
import customPC from "../../assets/images/hero/custom-pc-banner.jpg";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme } = useTheme();
  const [autoPlay, setAutoPlay] = useState(true);

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
      description: "Up to 40% off on selected items",
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

  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div 
      className="relative overflow-hidden rounded-lg shadow-lg h-[400px] md:h-[500px] bg-surface"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full flex items-center">
            <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Text Content */}
              <div className="md:w-1/2 text-center md:text-left space-y-4">
                <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${
                  theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                }`}>
                  {slide.title}
                </h1>
                <p className={`text-lg md:text-xl ${
                  theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                }`}>
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="inline-block px-8 py-3 bg-primary text-surface rounded-lg hover:bg-primary-hover transition-colors font-medium"
                >
                  {slide.buttonText}
                </Link>
              </div>

              {/* Image Container */}
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-lg aspect-video overflow-hidden rounded-lg">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-all"
      >
        <ChevronLeft className="h-6 w-6 text-text-primary" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-all"
      >
        <ChevronRight className="h-6 w-6 text-text-primary" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-text-secondary/50 hover:bg-text-secondary'
            }`}
          />
        ))}
      </div>
    </div>
  );
}