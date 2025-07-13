import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardActions, CardContent, CardMedia, Typography, IconButton, Box } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { CartContext } from '../../../context/CartContext';
import { getFullImageUrl } from '../../../utils/imageUtils';
import WishlistButton from '../WishlistButton';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
  };
  
  if (!product) return null;

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}>
      <CardActionArea component={Link} to={`/products/${product.id || product.productId}`}>
        <Box sx={{ position: 'relative', pt: '100%' }}>
          {product.image ? (
            <CardMedia
              component="img"
              image={getFullImageUrl(product.image)}
              alt={product.name}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                color: 'grey.500'
              }}
            >
              <Typography variant="body2">No Image</Typography>
            </Box>
          )}
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <WishlistButton productId={product.id || product.productId} size="small" />
          </Box>
        </Box>
      </CardActionArea>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography 
          gutterBottom 
          variant="subtitle1" 
          component="h3" 
          noWrap
          sx={{ fontWeight: 'medium' }}
        >
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {product.brand}
          </Typography>
          {product.category?.name && (
            <>
              <Box component="span" sx={{ mx: 0.5 }}>•</Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {product.category.name}
              </Typography>
            </>
          )}
        </Box>
        
        <Typography variant="h6" color="primary" fontWeight="bold">
          Rs.{product.price.toFixed(2)}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <IconButton 
          color="primary" 
          onClick={handleAddToCart}
          size="large"
          sx={{ 
            ml: 'auto',
            '&:hover': { bgcolor: 'primary.light' }
          }}
        >
          <AddShoppingCart />
        </IconButton>
          
          {product.stockQuantity <= 5 && product.stockQuantity > 0 ? (
            <p className="text-orange-500 text-sm mt-2">Only {product.stockQuantity} left!</p>
          ) : product.stockQuantity === 0 ? (
            <p className="text-red-500 text-sm mt-2">Out of stock</p>
          ) : null}
      </CardActions>
    </Card>
  );
};

export default ProductCard; 