import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  CardActions, 
  IconButton, 
  Box, 
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { AddShoppingCart, Favorite, Delete } from '@mui/icons-material';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../utils/imageUtils';

const WishlistPage = () => {
  const { 
    wishlist, 
    isLoading, 
    removeFromWishlist, 
    refreshWishlist,
    getWishlistCount,
    error
  } = useWishlist();
  
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  // Refresh wishlist on component mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist().catch(err => {
      });
    }
  }, [isAuthenticated, refreshWishlist]);

  const handleAddToCart = async (item, e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation when clicking the button
    
    try {
      // Format the product data to match what the cart expects
      const productToAdd = {
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        image: item.productImageUrl,
        quantity: 1,
        // Include any other required fields that your cart might expect
        ...item
      };
      await addToCart(productToAdd);
      
      // Show success message or handle as needed
      // Optionally remove from wishlist after adding to cart:
      // await removeFromWishlist(item.productId);
    } catch (error) {
      // You might want to show an error toast here
    }
  };

  const handleRemoveFromWishlist = async (productId, e) => {
    e.preventDefault();
    await removeFromWishlist(productId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading your wishlist...</Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error loading wishlist
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={refreshWishlist}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Empty state
  if (getWishlistCount() === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Favorite 
          sx={{ 
            fontSize: 80, 
            color: 'text.secondary',
            mb: 2
          }} 
        />
        <Typography variant="h5" gutterBottom>
          Your wishlist is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Save items you love for later by clicking the heart icon.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/"
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {wishlist.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.wishlistItemId}>
            <Card 
              sx={{ 
                height: '100%',
                width: '100%',
                maxWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                },
                margin: '0 auto'
              }}
            >
              <CardActionArea 
                component={Link} 
                to={`/products/${item.productId}`}
                sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  height: '100%'
                }}
              >
                <Box sx={{ 
                  position: 'relative',
                  width: '100%',
                  height: '250px', // Fixed height for image container
                  overflow: 'hidden'
                }}>
                  {item.productImageUrl ? (
                    <CardMedia
                      component="img"
                      image={getFullImageUrl(item.productImageUrl)}
                      alt={item.productName}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 2
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.text.secondary
                      }}
                    >
                      <Typography>No Image Available</Typography>
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2
                }}>
                  <Typography 
                    variant="subtitle1" 
                    component="h2" 
                    sx={{
                      fontWeight: 500,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '3em', // Ensures consistent height for 2 lines
                      lineHeight: '1.5em'
                    }}
                  >
                    {item.productName}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="primary" 
                    sx={{ 
                      mt: 'auto',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    Rs.{item.productPrice?.toFixed(2) || 'N/A'}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ 
                p: 2, 
                pt: 0,
                justifyContent: 'space-between',
                gap: 1
              }}>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={(e) => handleRemoveFromWishlist(item.productId, e)}
                  aria-label="Remove from wishlist"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'white'
                    }
                  }}
                >
                  <Delete />
                </IconButton>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddShoppingCart />}
                  onClick={(e) => handleAddToCart(item, e)}
                  sx={{ 
                    whiteSpace: 'nowrap',
                    flexGrow: 1,
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WishlistPage;
