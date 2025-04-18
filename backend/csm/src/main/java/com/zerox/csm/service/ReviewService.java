package com.zerox.csm.service;

import com.zerox.csm.dto.ReviewDto;
import com.zerox.csm.dto.ReviewDto.ReviewCreateRequest;
import com.zerox.csm.dto.ReviewDto.ReviewResponse;
import com.zerox.csm.dto.ReviewDto.ReviewUpdateRequest;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.ReviewRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .comment(request.comment())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToReviewResponse(reviewRepository.save(review));
    }
    
    public Page<ReviewResponse> getProductReviews(UUID productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        return reviewRepository.findByProductProductId(productId, pageable)
                .map(this::mapToReviewResponse);
    }
    
    public List<ReviewResponse> getUserReviews(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return reviewRepository.findByUserUserId(userId)
                .stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse getReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        return mapToReviewResponse(review);
    }
    
    @Transactional
    public ReviewResponse updateReview(UUID reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        review.setRating(request.rating());
        review.setComment(request.comment());
        
        return mapToReviewResponse(reviewRepository.save(review));
    }
    
    @Transactional
    public void deleteReview(UUID reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found");
        }
        
        reviewRepository.deleteById(reviewId);
    }
    
    public ReviewDto.ProductRatingResponse getProductRating(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        Double avgRating = reviewRepository.findAverageRatingByProductProductId(productId);
        Page<Review> reviews = reviewRepository.findByProductProductId(productId, Pageable.unpaged());
        
        return new ReviewDto.ProductRatingResponse(
                product.getProductId(),
                product.getName(),
                avgRating != null ? avgRating : 0.0,
                (int) reviews.getTotalElements()
        );
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return new ReviewResponse(
                review.getReviewId(),
                review.getProduct().getProductId(),
                review.getProduct().getName(),
                review.getUser().getUserId(),
                review.getUser().getFullName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
} 