package com.zerox.csm.service;

import com.zerox.csm.dto.CartDto;
import com.zerox.csm.model.Cart;
import com.zerox.csm.model.Product;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.CartRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public List<CartDto> getAllCartItems() {
        return cartRepository.findAll().stream().map(cart -> new CartDto(
                cart.getUser().getUserId(),
                cart.getProduct().getProductId(),
                cart.getQuantity()
        )).collect(Collectors.toList());
    }
    @Transactional
    public void addToCart(CartDto cartDto) {
        User user = userRepository.findById(cartDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(cartDto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = Cart.builder()
                .cartId(UUID.randomUUID())
                .user(user)
                .product(product)
                .quantity(cartDto.getQuantity())
                .price(product.getPrice().multiply(BigDecimal.valueOf(cartDto.getQuantity())))
                .build();

        cartRepository.save(cart);
    }

    @Transactional
    public void updateCartItem(UUID cartId, CartDto cartDto) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (cartDto.getQuantity() != null) {
            cart.setQuantity(cartDto.getQuantity());
            cart.setPrice(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cartDto.getQuantity())));
        }

        cartRepository.save(cart);
    }
    public void removeCartItem(UUID productId) {
        cartRepository.deleteById(productId);
    }

    public void clearCart() {
        cartRepository.deleteAll();
    }

    //testing
//    public  void testCart(CartDto cartDto) {
//        Cart cart = new Cart(cartDto.getProduct(), cartDto.getQuantity(), cartDto.getPrice());
//        cartRepository.save(cart);
//    }
//
//    public void save(Cart cart) {
//        cartRepository.save(cart);
//    }
}
