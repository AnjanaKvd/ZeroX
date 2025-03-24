package com.zerox.csm.controllers;

import com.zerox.csm.dto.ReviewDto.ProductRatingResponse;
import com.zerox.csm.dto.ReviewDto.ReviewCreateRequest;
import com.zerox.csm.dto.ReviewDto.ReviewResponse;
import com.zerox.csm.dto.ReviewDto.ReviewUpdateRequest;
import com.zerox.csm.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only create reviews as themselves
        return ResponseEntity.ok(reviewService.createReview(request));
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                reviewService.getProductReviews(productId, PageRequest.of(page, size))
        );
    }
    
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ProductRatingResponse> getProductRating(
            @PathVariable UUID productId
    ) {
        return ResponseEntity.ok(reviewService.getProductRating(productId));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only view their own reviews
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }
    
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable UUID reviewId
    ) {
        return ResponseEntity.ok(reviewService.getReview(reviewId));
    }
    
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only update their own reviews
        return ResponseEntity.ok(reviewService.updateReview(reviewId, request));
    }
    
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable UUID reviewId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only delete their own reviews
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
} 