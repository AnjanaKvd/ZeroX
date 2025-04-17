package com.zerox.csm.service;

import com.zerox.csm.dto.ProductDiscountDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.exception.ValidationException;
import com.zerox.csm.model.Product;
import com.zerox.csm.model.ProductDiscount;
import com.zerox.csm.repository.ProductDiscountRepository;
import com.zerox.csm.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductDiscountService {
    private final ProductDiscountRepository discountRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ProductDiscountDto.DiscountResponse createDiscount(ProductDiscountDto.DiscountRequest request) {
        // Validate the request
        if (request.discountPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Discount price must be positive");
        }

        if (request.startDate().isAfter(request.endDate())) {
            throw new ValidationException("Start date must be before end date");
        }

        // Get the product
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Validate discount price is less than original price
        if (request.discountPrice().compareTo(product.getPrice()) >= 0) {
            throw new ValidationException("Discount price must be less than the product's original price");
        }

        // Check for overlapping discounts
        List<ProductDiscount> overlappingDiscounts = discountRepository.findOverlappingDiscounts(
                request.productId(), request.startDate(), request.endDate());

        if (!overlappingDiscounts.isEmpty()) {
            throw new ValidationException("There is already a discount for this product during the specified period");
        }

        // Create and save the discount
        ProductDiscount discount = ProductDiscount.builder()
                .product(product)
                .discountPrice(request.discountPrice())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .active(true)
                .build();

        ProductDiscount savedDiscount = discountRepository.save(discount);

        return mapToDiscountResponse(savedDiscount);
    }

    @Transactional(readOnly = true)
    public Page<ProductDiscountDto.DiscountResponse> getAllDiscounts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return discountRepository.findAll(pageable)
                .map(this::mapToDiscountResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductDiscountDto.ActiveDiscountResponse> getActiveDiscounts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        LocalDateTime now = LocalDateTime.now();
        
        return discountRepository.findAllActiveDiscounts(now, pageable)
                .map(this::mapToActiveDiscountResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductDiscountDto.ActiveDiscountResponse> getAllActiveDiscounts() {
        LocalDateTime now = LocalDateTime.now();
        return discountRepository.findAllActiveDiscounts(now)
                .stream()
                .map(this::mapToActiveDiscountResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDiscountDto.DiscountResponse getDiscountById(UUID discountId) {
        ProductDiscount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        
        return mapToDiscountResponse(discount);
    }

    @Transactional(readOnly = true)
    public List<ProductDiscountDto.DiscountResponse> getDiscountsByProductId(UUID productId) {
        List<ProductDiscount> discounts = discountRepository.findByProductProductIdAndActiveTrue(productId);
        
        return discounts.stream()
                .map(this::mapToDiscountResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDiscountDto.DiscountResponse updateDiscount(
            UUID discountId, ProductDiscountDto.DiscountRequest request) {
        
        ProductDiscount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Validate discount price is less than original price
        if (request.discountPrice().compareTo(product.getPrice()) >= 0) {
            throw new ValidationException("Discount price must be less than the product's original price");
        }

        // Check for overlapping discounts (excluding the current one)
        List<ProductDiscount> overlappingDiscounts = discountRepository.findOverlappingDiscounts(
                request.productId(), request.startDate(), request.endDate())
                .stream()
                .filter(d -> !d.getDiscountId().equals(discountId))
                .collect(Collectors.toList());

        if (!overlappingDiscounts.isEmpty()) {
            throw new ValidationException("There is already another discount for this product during the specified period");
        }

        // Update the discount
        discount.setProduct(product);
        discount.setDiscountPrice(request.discountPrice());
        discount.setStartDate(request.startDate());
        discount.setEndDate(request.endDate());

        ProductDiscount updatedDiscount = discountRepository.save(discount);
        
        return mapToDiscountResponse(updatedDiscount);
    }

    @Transactional
    public void deleteDiscount(UUID discountId) {
        ProductDiscount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        
        // Soft delete by setting active to false
        discount.setActive(false);
        discountRepository.save(discount);
    }

    @Transactional(readOnly = true)
    public ProductDiscountDto.ActiveDiscountResponse getActiveDiscountForProduct(UUID productId) {
        LocalDateTime now = LocalDateTime.now();
        return discountRepository.findActiveDiscountForProduct(productId, now)
                .map(this::mapToActiveDiscountResponse)
                .orElse(null);
    }

    private ProductDiscountDto.DiscountResponse mapToDiscountResponse(ProductDiscount discount) {
        return new ProductDiscountDto.DiscountResponse(
                discount.getDiscountId(),
                discount.getProduct().getProductId(),
                discount.getProduct().getName(),
                discount.getProduct().getSku(),
                discount.getProduct().getPrice(),
                discount.getDiscountPrice(),
                discount.getStartDate(),
                discount.getEndDate(),
                discount.getActive()
        );
    }

    private ProductDiscountDto.ActiveDiscountResponse mapToActiveDiscountResponse(ProductDiscount discount) {
        BigDecimal originalPrice = discount.getProduct().getPrice();
        BigDecimal discountPrice = discount.getDiscountPrice();
        BigDecimal savingsAmount = originalPrice.subtract(discountPrice);
        
        // Calculate savings percentage
        double savingsPercentage = savingsAmount.divide(originalPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        
        return new ProductDiscountDto.ActiveDiscountResponse(
                discount.getDiscountId(),
                discount.getProduct().getProductId(),
                discount.getProduct().getName(),
                discount.getProduct().getSku(),
                originalPrice,
                discountPrice,
                savingsAmount,
                savingsPercentage,
                discount.getEndDate()
        );
    }
} 