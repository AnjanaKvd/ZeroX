package com.zerox.csm.controllers;

import com.zerox.csm.dto.WishlistDto;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Wishlist management APIs")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Add a product to wishlist")
    public ResponseEntity<WishlistDto.WishlistItemResponse> addToWishlist(
            @RequestBody WishlistDto.WishlistItemRequest request) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(wishlistService.addToWishlist(userId, request.productId()));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove a product from wishlist")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable UUID productId) {
        UUID userId = getCurrentUserId();
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get user's wishlist")
    public ResponseEntity<List<WishlistDto.WishlistItemResponse>> getUserWishlist() {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Check if product is in user's wishlist")
    public ResponseEntity<Boolean> isProductInWishlist(@PathVariable UUID productId) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(wishlistService.isProductInWishlist(userId, productId));
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return user.getUserId();
    }
}
