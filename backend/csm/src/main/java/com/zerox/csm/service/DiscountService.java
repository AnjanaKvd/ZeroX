package com.zerox.csm.service;

import com.zerox.csm.dto.DiscountDto.DiscountCreateRequest;
import com.zerox.csm.dto.DiscountDto.DiscountResponse;
import com.zerox.csm.dto.DiscountDto.DiscountUpdateRequest;
import com.zerox.csm.dto.DiscountDto.DiscountVerifyResponse;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Discount;
import com.zerox.csm.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;
    
    @Transactional
    public DiscountResponse createDiscount(DiscountCreateRequest request) {
        // Check if discount code already exists
        if (discountRepository.findByCode(request.code()).isPresent()) {
            throw new IllegalArgumentException("Discount code already exists");
        }
        
        Discount discount = Discount.builder()
                .code(request.code())
                .discountType(request.discountType())
                .value(request.value())
                .maxUses(request.maxUses())
                .validFrom(request.validFrom() != null ? request.validFrom() : LocalDateTime.now())
                .validUntil(request.validUntil())
                .build();
        
        return mapToDiscountResponse(discountRepository.save(discount));
    }
    
    public DiscountResponse getDiscount(UUID discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        
        return mapToDiscountResponse(discount);
    }
    
    public List<DiscountResponse> getAllDiscounts() {
        return discountRepository.findAll().stream()
                .map(this::mapToDiscountResponse)
                .collect(Collectors.toList());
    }
    
    public List<DiscountResponse> getActiveDiscounts() {
        return discountRepository.findActiveDiscounts(LocalDateTime.now()).stream()
                .map(this::mapToDiscountResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public DiscountResponse updateDiscount(UUID discountId, DiscountUpdateRequest request) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        
        discount.setDiscountType(request.discountType());
        discount.setValue(request.value());
        discount.setMaxUses(request.maxUses());
        
        if (request.validFrom() != null) {
            discount.setValidFrom(request.validFrom());
        }
        
        discount.setValidUntil(request.validUntil());
        
        return mapToDiscountResponse(discountRepository.save(discount));
    }
    
    @Transactional
    public void deleteDiscount(UUID discountId) {
        if (!discountRepository.existsById(discountId)) {
            throw new ResourceNotFoundException("Discount not found");
        }
        
        discountRepository.deleteById(discountId);
    }
    
    public DiscountVerifyResponse verifyDiscount(String code) {
        return discountRepository.findByCode(code)
                .map(discount -> {
                    LocalDateTime now = LocalDateTime.now();
                    boolean isValid = (discount.getValidFrom().isBefore(now) || discount.getValidFrom().isEqual(now)) &&
                            (discount.getValidUntil() == null || discount.getValidUntil().isAfter(now));
                    
                    String message = isValid ? "Discount is valid" : "Discount is not valid or has expired";
                    
                    return new DiscountVerifyResponse(
                            isValid,
                            discount.getCode(),
                            discount.getDiscountType(),
                            discount.getValue(),
                            message
                    );
                })
                .orElse(new DiscountVerifyResponse(
                        false,
                        code,
                        null,
                        null,
                        "Discount code not found"
                ));
    }
    
    private DiscountResponse mapToDiscountResponse(Discount discount) {
        return new DiscountResponse(
                discount.getDiscountId(),
                discount.getCode(),
                discount.getDiscountType(),
                discount.getValue(),
                discount.getMaxUses(),
                discount.getValidFrom(),
                discount.getValidUntil()
        );
    }
} 