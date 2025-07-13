import { IconButton, Tooltip } from '@mui/material';
import { Favorite as FavoriteFilled, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';

const WishlistButton = ({ productId, size = 'medium', edge = false, sx = {} }) => {
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistItem(productId);
  };

  return (
    <Tooltip 
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      arrow
      placement="top"
    >
      <IconButton
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleClick}
        edge={edge}
        size={size}
        sx={{
          color: isWishlisted ? 'error.main' : 'inherit',
          '&:hover': {
            color: isWishlisted ? 'error.dark' : 'primary.main',
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          },
          ...sx
        }}
      >
        {isWishlisted ? <FavoriteFilled /> : <FavoriteBorder />}
      </IconButton>
    </Tooltip>
  );
};

export default WishlistButton;
