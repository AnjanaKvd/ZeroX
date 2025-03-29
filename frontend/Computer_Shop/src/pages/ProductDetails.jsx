import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { getProductById } from '../services/productService';
import { CartContext } from '../context/CartContext';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useContext(CartContext);
  
    useEffect(() => {
      const fetchProduct = async () => {
        try {
          const data = await getProductById(productId);
          setProduct(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }, [productId]);
  
    if (loading) {
      return <div className="container mx-auto p-8">Loading...</div>;
    }
  
    if (error || !product) {
      return <div className="container mx-auto p-8">Error: {error || 'Product not found'}</div>;
    }
  
    const handleQuantityChange = (change) => {
      setQuantity(prev => {
        const newQuantity = prev + change;
        return newQuantity > 0 && newQuantity <= product.inStock ? newQuantity : prev;
      });
    };
  
    const handleAddToCart = () => {
      addToCart({ ...product, quantity });
    };
  
    return (
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="mb-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to Products
        </Link>
  
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-96 object-cover rounded-lg"
            />
            
            {/* UPC Barcode */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Product Barcode</h3>
              {/* <UPCBarcode upc={product.barcode} /> */}
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* Ratings */}
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`
                      ${index < Math.floor(product.ratings) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                      w-5 h-5
                    `}
                  />
                ))}
                <span className="text-gray-500 ml-2">
                  ({product.numberOfRatings} ratings)
                </span>
              </div>
              
              {/* Stock Status */}
              {/* <StockStatus inStock={product.inStock} /> */}
            </div>
            
            {/* Basic Info */}
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Brand:</strong> {product.brand}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Category:</strong> {product.category}
              </p>
            </div>
            
            {/* Price */}
            <div className="text-3xl font-bold text-blue-600 mb-4">
              ${product.price.toFixed(2)}
            </div>
            
            {/* Short Description */}
            <p className="text-gray-600 mb-4">{product.shortDescription}</p>
            
            {/* Additional Details */}
            <div className="mb-4">
              <p className="text-gray-700">
                <strong>SKU:</strong> {product.sku}
              </p>
              <p className="text-gray-700">
                <strong>UPC:</strong> {product.upc}
              </p>
              <p className="text-gray-700">
                <strong>Warranty:</strong>{' '}
                {product.warrantyPeriodMonths 
                  ? `${product.warrantyPeriodMonths} months` 
                  : 'No warranty'}
              </p>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-4">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="bg-gray-200 p-2 rounded-l-lg"
              >
                <Minus size={20} />
              </button>
              <span className="px-4 py-2 bg-gray-100">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="bg-gray-200 p-2 rounded-r-lg"
              >
                <Plus size={20} />
              </button>
              <span className="ml-4 text-gray-600">
                {product.inStock} items in stock
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center disabled:bg-gray-400"
              >
                <ShoppingCart className="mr-2" /> Add to Cart
              </button>
              <button 
                disabled={!product.inStock}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ProductDetailPage;