package com.zerox.csm.service;

import com.zerox.csm.dto.CartDto.CartResponse;
import com.zerox.csm.dto.CartDto.CartItemRequest;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Cart;
import com.zerox.csm.model.CartItem;
import com.zerox.csm.model.Product;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.CartRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addItemToCart(UUID userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> Cart.builder().user(user).totalPrice(BigDecimal.ZERO).build());

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        cart.calculateTotalPrice();
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Transactional
    public void removeItemFromCart(UUID userId, UUID productId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().removeIf(item -> item.getProduct().getProductId().equals(productId));
        cart.calculateTotalPrice();
        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().clear();
        cart.setTotalPrice(BigDecimal.ZERO);
        cartRepository.save(cart);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        // Map Cart to CartResponse DTO
        return null; // Implement mapping logic
    }
}