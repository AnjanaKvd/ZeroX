import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // Debug log to see individual product structure
  console.log('ProductCard received product:', product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a cart item with correct ID structure
    const cartItem = {
      id: product.productId,
      productId: product.productId,
      name: product.name,
      price: product.price,
      image: product.imagePath,
      quantity: 1
    };
    
    addToCart(cartItem);
  };

  // Guard clause to prevent rendering with invalid data
  if (!product || !product.productId) {
    console.error('Invalid product data:', product);
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.productId}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {product.imagePath ? (
            <img 
              src={product.imagePath} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-600">${Number(product.price).toFixed(2)}</span>
            <button 
              onClick={handleAddToCart}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
              aria-label="Add to cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard; 