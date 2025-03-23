package com.zerox.csm.service;

import com.zerox.csm.dto.ReturnDto.ReturnCreateRequest;
import com.zerox.csm.dto.ReturnDto.ReturnResponse;
import com.zerox.csm.dto.ReturnDto.ReturnUpdateRequest;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Order;
import com.zerox.csm.model.Return;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.ReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;
    
    @Transactional
    public ReturnResponse createReturn(ReturnCreateRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        Return returnObj = Return.builder()
                .order(order)
                .reason(request.reason())
                .status(Return.Status.REQUESTED)
                .processedAt(LocalDateTime.now())
                .build();
        
        return mapToReturnResponse(returnRepository.save(returnObj));
    }
    
    public ReturnResponse getReturn(UUID returnId) {
        Return returnObj = returnRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found"));
        
        return mapToReturnResponse(returnObj);
    }
    
    public List<ReturnResponse> getReturnsByOrderId(UUID orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found");
        }
        
        return returnRepository.findByOrderOrderId(orderId).stream()
                .map(this::mapToReturnResponse)
                .collect(Collectors.toList());
    }
    
    public List<ReturnResponse> getUserReturns(UUID userId) {
        return returnRepository.findByOrderUserUserId(userId).stream()
                .map(this::mapToReturnResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ReturnResponse updateReturn(UUID returnId, ReturnUpdateRequest request) {
        Return returnObj = returnRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found"));
        
        returnObj.setStatus(request.status());
        
        // If the status is being updated to REFUNDED, set the processed date and refund amount
        if (request.status() == Return.Status.REFUNDED) {
            returnObj.setProcessedAt(LocalDateTime.now());
            returnObj.setRefundAmount(request.refundAmount());
        }
        
        return mapToReturnResponse(returnRepository.save(returnObj));
    }
    
    private ReturnResponse mapToReturnResponse(Return returnObj) {
        return new ReturnResponse(
                returnObj.getReturnId(),
                returnObj.getOrder().getOrderId(),
                returnObj.getReason(),
                returnObj.getStatus(),
                returnObj.getRefundAmount(),
                returnObj.getProcessedAt()
        );
    }
} 