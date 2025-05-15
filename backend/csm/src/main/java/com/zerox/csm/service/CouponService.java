package com.zerox.csm.service;

import com.zerox.csm.dto.CouponDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.exception.ValidationException;
import com.zerox.csm.model.Category;
import com.zerox.csm.model.Coupon;
import com.zerox.csm.model.CouponUsage;
import com.zerox.csm.model.Order;
import com.zerox.csm.model.Product;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.CategoryRepository;
import com.zerox.csm.repository.CouponRepository;
import com.zerox.csm.repository.CouponUsageRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {
    
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public CouponDto.CouponResponse createCoupon(CouponDto.CouponRequest request) {
        // Check if coupon code already exists
        if (couponRepository.findByCode(request.code()).isPresent()) {
            throw new ValidationException("Coupon code already exists");
        }
        
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }
        
        Product product = null;
        if (request.productId() != null) {
            product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        }
        
        Coupon coupon = Coupon.builder()
                .code(request.code())
                .description(request.description())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minimumOrderAmount(request.minimumOrderAmount())
                .maximumDiscountAmount(request.maximumDiscountAmount())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .maxUses(request.maxUses())
                .maxUsesPerUser(request.maxUsesPerUser())
                .currentUses(0)
                .isActive(request.isActive())
                .category(category)
                .product(product)
                .build();
        
        Coupon savedCoupon = couponRepository.save(coupon);
        return mapToCouponResponse(savedCoupon);
    }
    
    public CouponDto.CouponResponse getCoupon(UUID couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        return mapToCouponResponse(coupon);
    }
    
    public CouponDto.CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        return mapToCouponResponse(coupon);
    }
    
    public Page<CouponDto.CouponResponse> getAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable)
                .map(this::mapToCouponResponse);
    }
    
    public Page<CouponDto.CouponResponse> getActiveCoupons(Pageable pageable) {
        return couponRepository.findActiveCoupons(LocalDateTime.now(), pageable)
                .map(this::mapToCouponResponse);
    }
    
    public Page<CouponDto.CouponResponse> getValidCoupons(Pageable pageable) {
        return couponRepository.findValidCoupons(LocalDateTime.now(), pageable)
                .map(this::mapToCouponResponse);
    }
    
    public Page<CouponDto.CouponResponse> searchCoupons(String code, Boolean isActive, Pageable pageable) {
        return couponRepository.searchCoupons(code, isActive, pageable)
                .map(this::mapToCouponResponse);
    }
    
    @Transactional
    public CouponDto.CouponResponse updateCoupon(UUID couponId, CouponDto.CouponRequest request) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        
        // Check if new code conflicts with an existing coupon code
        if (!coupon.getCode().equals(request.code()) && 
            couponRepository.findByCode(request.code()).isPresent()) {
            throw new ValidationException("Coupon code already exists");
        }
        
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }
        
        Product product = null;
        if (request.productId() != null) {
            product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        }
        
        coupon.setCode(request.code());
        coupon.setDescription(request.description());
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinimumOrderAmount(request.minimumOrderAmount());
        coupon.setMaximumDiscountAmount(request.maximumDiscountAmount());
        coupon.setStartDate(request.startDate());
        coupon.setEndDate(request.endDate());
        coupon.setMaxUses(request.maxUses());
        coupon.setMaxUsesPerUser(request.maxUsesPerUser());
        coupon.setIsActive(request.isActive());
        coupon.setCategory(category);
        coupon.setProduct(product);
        
        Coupon updatedCoupon = couponRepository.save(coupon);
        return mapToCouponResponse(updatedCoupon);
    }
    
    @Transactional
    public void deleteCoupon(UUID couponId) {
        if (!couponRepository.existsById(couponId)) {
            throw new ResourceNotFoundException("Coupon not found");
        }
        couponRepository.deleteById(couponId);
    }
    
    @Transactional
    public CouponDto.CouponValidationResponse validateCoupon(CouponDto.CouponValidationRequest request) {
        // Get the coupon
        Coupon coupon = couponRepository.findByCode(request.code())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        
        // Get the user
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if coupon is active
        if (!coupon.getIsActive()) {
            return new CouponDto.CouponValidationResponse(false, "Coupon is not active", BigDecimal.ZERO);
        }
        
        // Check if coupon is within valid date range
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            return new CouponDto.CouponValidationResponse(false, "Coupon is not valid at this time", BigDecimal.ZERO);
        }
        
        // Check maximum uses
        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            return new CouponDto.CouponValidationResponse(false, "Coupon has reached maximum uses", BigDecimal.ZERO);
        }
        
        // Check maximum uses per user
        if (coupon.getMaxUsesPerUser() != null) {
            int userUsages = couponUsageRepository.countByCouponAndUser(coupon, user);
            if (userUsages >= coupon.getMaxUsesPerUser()) {
                return new CouponDto.CouponValidationResponse(
                        false, "You have reached the maximum uses for this coupon", BigDecimal.ZERO);
            }
        }
        
        // Check minimum order amount
        if (coupon.getMinimumOrderAmount() != null && 
            request.orderAmount().compareTo(coupon.getMinimumOrderAmount()) < 0) {
            return new CouponDto.CouponValidationResponse(
                    false, 
                    "Order amount does not meet the minimum required amount of " + coupon.getMinimumOrderAmount(), 
                    BigDecimal.ZERO);
        }
        
        // Calculate discount amount
        BigDecimal discountAmount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discountAmount = request.orderAmount()
                    .multiply(coupon.getDiscountValue().divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
            
            // Apply maximum discount if set
            if (coupon.getMaximumDiscountAmount() != null && 
                discountAmount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
                discountAmount = coupon.getMaximumDiscountAmount();
            }
        } else {
            discountAmount = coupon.getDiscountValue();
            
            // Ensure discount doesn't exceed order amount
            if (discountAmount.compareTo(request.orderAmount()) > 0) {
                discountAmount = request.orderAmount();
            }
        }
        
        return new CouponDto.CouponValidationResponse(true, "Coupon is valid", discountAmount);
    }
    
    @Transactional
    public CouponDto.CouponUsageResponse recordCouponUsage(Coupon coupon, User user, Order order, BigDecimal discountAmount) {
        // Increment coupon usage count
        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        couponRepository.save(coupon);
        
        // Create coupon usage record
        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .order(order)
                .discountAmount(discountAmount)
                .build();
        
        CouponUsage savedUsage = couponUsageRepository.save(usage);
        
        return new CouponDto.CouponUsageResponse(
                savedUsage.getUsageId(),
                savedUsage.getCoupon().getCode(),
                savedUsage.getUser().getFullName(),
                savedUsage.getOrder().getOrderId(),
                savedUsage.getDiscountAmount(),
                savedUsage.getUsedAt()
        );
    }
    
    public Page<CouponDto.CouponUsageResponse> getCouponUsages(UUID couponId, Pageable pageable) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        
        return couponUsageRepository.findByCoupon(coupon, pageable)
                .map(usage -> new CouponDto.CouponUsageResponse(
                        usage.getUsageId(),
                        usage.getCoupon().getCode(),
                        usage.getUser().getFullName(),
                        usage.getOrder().getOrderId(),
                        usage.getDiscountAmount(),
                        usage.getUsedAt()
                ));
    }
    
    public Page<CouponDto.CouponUsageResponse> getUserCouponUsages(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return couponUsageRepository.findByUser(user, pageable)
                .map(usage -> new CouponDto.CouponUsageResponse(
                        usage.getUsageId(),
                        usage.getCoupon().getCode(),
                        usage.getUser().getFullName(),
                        usage.getOrder().getOrderId(),
                        usage.getDiscountAmount(),
                        usage.getUsedAt()
                ));
    }
    
    private CouponDto.CouponResponse mapToCouponResponse(Coupon coupon) {
        return new CouponDto.CouponResponse(
                coupon.getCouponId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinimumOrderAmount(),
                coupon.getMaximumDiscountAmount(),
                coupon.getStartDate(),
                coupon.getEndDate(),
                coupon.getMaxUses(),
                coupon.getMaxUsesPerUser(),
                coupon.getCurrentUses(),
                coupon.getIsActive(),
                coupon.getCategory() != null ? coupon.getCategory().getName() : null,
                coupon.getProduct() != null ? coupon.getProduct().getName() : null,
                coupon.getCreatedAt(),
                coupon.isValid()
        );
    }
} 