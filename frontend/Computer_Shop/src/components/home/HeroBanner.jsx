"use client"

import { useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      title: "New Gaming Laptops",
      description: "Experience next-level gaming with our latest collection",
      buttonText: "Shop Now",
      buttonLink: "/category/laptops/gaming",
      image: "/placeholder.svg?height=500&width=1200",
      bgColor: "bg-deep-blue",
    },
    {
      id: 2,
      title: "Summer Sale",
      description: "Up to 40% off on selected items",
      buttonText: "View Deals",
      buttonLink: "/special-offers",
      image: "/placeholder.svg?height=500&width=1200",
      bgColor: "bg-vibrant-orange",
    },
    {
      id: 3,
      title: "Build Your Dream PC",
      description: "Customize your perfect setup with our components",
      buttonText: "Start Building",
      buttonLink: "/custom-build",
      image: "/placeholder.svg?height=500&width=1200",
      bgColor: "bg-dark-gray",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg shadow-md h-[400px] md:h-[500px]">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={`min-w-full h-full flex items-center ${slide.bgColor} text-white`}>
            <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6">{slide.description}</p>
                <Link href={slide.buttonLink} className="btn btn-secondary inline-block">
                  {slide.buttonText}
                </Link>
              </div>
              <div className="md:w-1/2">
                <img
                  src={slide.image || "../../assets/images/placeholder.svg"}
                  alt={slide.title}
                  className="rounded-lg shadow-lg max-h-[300px] mx-auto"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}

