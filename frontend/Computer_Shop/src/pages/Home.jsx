import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../services/productService";
import MainLayout from "../components/layouts/MainLayout";
// import HeroBanner from '../components/home/HeroBanner';
// import CategorySection from '../components/home/CategorySection';
// import FeaturedProducts from '../components/home/FeaturedProducts';
// import TrendingProducts from '../components/home/TrendingProducts';
// import PromoBanner from '../components/home/PromoBanner';
// import Testimonials from '../components/home/Testimonials';
// import Newsletter from '../components/home/Newsletter';
import ProductCard from "../components/common/ProductCard/ProductCard";
import LoadingSpinner from "../components/common/LoadingSpinner/LoadingSpinner";
import Header from "../components/common/Header/Header";
import Footer from "../components/common/Footer/Footer";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    brand: "",
    sortBy: "name",
    sortDirection: "asc",
    page: 0,
    size: 12,
  });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const data = await getCategories();
        setCategories(data);
        setApiError(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Use mock data if API fails
        console.log("Using mock categories due to API error");
        setCategories(MOCK_CATEGORIES);
        setApiError(true);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log("Fetching products with filters:", filters);
        const data = await getProducts(filters);
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setApiError(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Use mock data if API fails
        console.log("Using mock products due to API error");
        setProducts(MOCK_PRODUCTS);
        setTotalPages(1);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 0, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  return (
    <MainLayout>
      {/* <HeroBanner /> */}
      {/* <CategorySection categories={categories} /> */}
      {/* <FeaturedProducts products={products} loading={loading} /> */}
      {/* <PromoBanner /> */}
      {/* <TrendingProducts products={products} loading={loading} /> */}
      {/* <Testimonials /> */}
      {/* <Newsletter /> */}
    </MainLayout>
  );
};

export default Home;
