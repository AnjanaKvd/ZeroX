import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
  };
  
  if (!product) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.id || product.productId}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-500">Product Image</span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
          
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600">{product.brand}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600">{product.category?.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
            
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Add to Cart
            </button>
          </div>
          
          {product.stockQuantity <= 5 && product.stockQuantity > 0 ? (
            <p className="text-orange-500 text-sm mt-2">Only {product.stockQuantity} left!</p>
          ) : product.stockQuantity === 0 ? (
            <p className="text-red-500 text-sm mt-2">Out of stock</p>
          ) : null}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard; 