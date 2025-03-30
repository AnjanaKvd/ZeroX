import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    // Create a cart item with correct ID structure
    const cartItem = {
      id: product.productId || product.id, // Handle both ID formats
      productId: product.productId || product.id,
      name: product.name,
      price: product.price,
      image: product.imagePath || product.image,
      quantity: 1
    };
    
    addToCart(cartItem);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.productId || product.id}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {product.imagePath || product.image ? (
            <img 
              src={product.imagePath || product.image} 
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