package com.zerox.csm.service;

import com.zerox.csm.dto.CartDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Cart;
import com.zerox.csm.repository.CartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {
    private final CartRepository cartRepository;
    private final ProductService productService;

    public Cart addToCart(Cart cart) {
        return cartRepository.findByUserIdAndProductId(cart.getUserId(), cart.getProductId())
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity() + cart.getQuantity());
                    return cartRepository.save(existingItem);
                })
                .orElseGet(() -> cartRepository.save(cart));
    }

    public <CartItemView> List<CartItemView> getCartItems(Integer userId) {
        List<CartItemView> items = cartRepository.findAllProjectedByUserId(userId);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("No items found in cart for user: " + userId);
        }
        return items;
    }



    public void removeFromCart(Integer userId, Integer productId) {
    }

    // ... other methods with proper error handling
}