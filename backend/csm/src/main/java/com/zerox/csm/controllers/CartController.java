package com.zerox.csm.controllers;

import com.zerox.csm.dto.CartDto.CartResponse;
import com.zerox.csm.dto.CartDto.CartItemRequest;
import com.zerox.csm.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @RequestParam UUID userId,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(userId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItemFromCart(
            @RequestParam UUID userId,
            @PathVariable UUID productId) {
        cartService.removeItemFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestParam UUID userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}