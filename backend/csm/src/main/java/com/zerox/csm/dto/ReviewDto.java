package com.zerox.csm.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReviewDto {

    public record ReviewCreateRequest(
            @NotNull UUID productId,
            @Min(1) @Max(5) int rating,
            String comment
    ) {}

    public record ReviewUpdateRequest(
            @Min(1) @Max(5) int rating,
            String comment
    ) {}

    public record ReviewResponse(
            UUID reviewId,
            UUID productId,
            String productName,
            UUID userId,
            String userName,
            int rating,
            String comment,
            LocalDateTime createdAt
    ) {}

    public record ProductRatingResponse(
            UUID productId,
            String productName,
            double averageRating,
            int numberOfReviews
    ) {}
}
