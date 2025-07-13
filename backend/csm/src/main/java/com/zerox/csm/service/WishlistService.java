package com.zerox.csm.service;

import com.zerox.csm.dto.WishlistDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Product;
import com.zerox.csm.model.User;
import com.zerox.csm.model.WishlistItem;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public WishlistDto.WishlistItemResponse addToWishlist(UUID userId, UUID productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check if item already exists in wishlist
        if (wishlistRepository.existsByUser_UserIdAndProduct_ProductId(userId, productId)) {
            throw new IllegalStateException("Product already exists in wishlist");
        }
        
        WishlistItem wishlistItem = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();
        
        // Add to user's wishlist
        user.addToWishlist(wishlistItem);
        
        // Save the wishlist item
        WishlistItem savedItem = wishlistRepository.save(wishlistItem);
        
        return WishlistDto.WishlistItemResponse.fromWishlistItem(savedItem);
    }
    
    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        WishlistItem wishlistItem = wishlistRepository.findByUser_UserIdAndProduct_ProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));
        
        wishlistRepository.delete(wishlistItem);
    }
    
    @Transactional(readOnly = true)
    public List<WishlistDto.WishlistItemResponse> getUserWishlist(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return wishlistRepository.findByUser_UserIdOrderByAddedAtDesc(userId).stream()
                .map(WishlistDto.WishlistItemResponse::fromWishlistItem)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public boolean isProductInWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUser_UserIdAndProduct_ProductId(userId, productId);
    }
}
