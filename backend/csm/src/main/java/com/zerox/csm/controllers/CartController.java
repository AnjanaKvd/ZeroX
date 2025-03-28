package com.zerox.csm.controllers;

import com.zerox.csm.dto.CartDto;
import com.zerox.csm.model.Cart;
import com.zerox.csm.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
public class CartController {
    private final CartService cartService;

    @PostMapping
    public ResponseEntity<Cart> addToCart(@Valid @RequestBody Cart cart) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addToCart(cart));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartDto>> getCartItems(
            @PathVariable @Min(1) Integer userId) {
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable @Min(1) Integer userId,
            @PathVariable @Min(1) Integer productId) {
        cartService.removeFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }
}