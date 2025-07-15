export const getFullImageUrl = (relativePath) => {
    if (!relativePath) return null;
    
    // Use base URL from environment or default to localhost
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    
    // If it's already a full URL, return it as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // For the structure in your example response
    if (relativePath.startsWith('/uploads/')) {
      return `${baseUrl}${relativePath}`;
    }
    
    // If it's just a filename with no path prefix
    if (!relativePath.startsWith('/')) {
      return `${baseUrl}/uploads/${relativePath}`;
    }
    
    // Default fallback
    return `${baseUrl}${relativePath}`;
  };

// Helper function to find the image URL property regardless of naming
export const getProductImageUrl = (product) => {
  if (!product) return null;
  
  // Check all possible image URL properties in order of preference
  if (product.imageUrl) return getFullImageUrl(product.imageUrl);
  if (product.imagePath) return getFullImageUrl(product.imagePath);
  if (product.image) return getFullImageUrl(product.image);
  
  return null;
};