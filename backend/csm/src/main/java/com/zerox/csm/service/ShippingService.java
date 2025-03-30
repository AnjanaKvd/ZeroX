package com.zerox.csm.service;

import com.zerox.csm.dto.ShippingDto.ShippingCreateRequest;
import com.zerox.csm.dto.ShippingDto.ShippingResponse;
import com.zerox.csm.dto.ShippingDto.ShippingUpdateRequest;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Order;
import com.zerox.csm.model.Shipping;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    
    @Transactional
    public ShippingResponse createShipping(ShippingCreateRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Check if shipping already exists for this order
        shippingRepository.findByOrderOrderId(order.getOrderId()).ifPresent(s -> {
            throw new IllegalStateException("Shipping already exists for this order");
        });
        
        Shipping shipping = Shipping.builder()
                .order(order)
                .carrier(request.carrier())
                .trackingNumber(request.trackingNumber())
                .status(Shipping.Status.PROCESSING)
                .estimatedDelivery(request.estimatedDelivery())
                .build();
        
        return mapToShippingResponse(shippingRepository.save(shipping));
    }
    
    public ShippingResponse getShippingByOrderId(UUID orderId) {
        Shipping shipping = shippingRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping not found for this order"));
        
        return mapToShippingResponse(shipping);
    }
    
    public ShippingResponse getShippingByTrackingNumber(String trackingNumber) {
        Shipping shipping = shippingRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping not found with this tracking number"));
        
        return mapToShippingResponse(shipping);
    }
    
    @Transactional
    public ShippingResponse updateShipping(UUID shippingId, ShippingUpdateRequest request) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping not found"));
        
        if (request.trackingNumber() != null) {
            shipping.setTrackingNumber(request.trackingNumber());
        }
        
        shipping.setStatus(request.status());
        
        if (request.estimatedDelivery() != null) {
            shipping.setEstimatedDelivery(request.estimatedDelivery());
        }
        
        return mapToShippingResponse(shippingRepository.save(shipping));
    }
    
    public List<ShippingResponse> getAllShippings() {
        return shippingRepository.findAll().stream()
                .map(this::mapToShippingResponse)
                .collect(Collectors.toList());
    }
    
    private ShippingResponse mapToShippingResponse(Shipping shipping) {
        return new ShippingResponse(
                shipping.getShippingId(),
                shipping.getOrder().getOrderId(),
                shipping.getTrackingNumber(),
                shipping.getCarrier(),
                shipping.getStatus(),
                shipping.getEstimatedDelivery()
        );
    }
} 