package com.zerox.csm.service;

import com.zerox.csm.dto.OrderDto.OrderItemRequest;
import com.zerox.csm.dto.OrderDto.OrderRequest;
import com.zerox.csm.dto.OrderDto.OrderResponse;
import com.zerox.csm.dto.OrderDto.OrderItemResponse;
import com.zerox.csm.exception.InsufficientStockException;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// OrderService.java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // 1. Get user
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Validate stock availability
        List<OrderItem> items = validateAndCreateItems(request.items());

        // 3. Calculate total
        BigDecimal total = calculateTotal(items);

        // 4. Create order
        Order order = Order.builder()
                .user(user)
                .items(items)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // Set back-reference to order
        items.forEach(item -> item.setOrder(order));

        return mapToOrderResponse(orderRepository.save(order));
    }

    private List<OrderItem> validateAndCreateItems(List<OrderItemRequest> itemsRequest) {
        return itemsRequest.stream().map(item -> {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if(product.getStockQuantity() < item.quantity()) {
                throw new InsufficientStockException(
                        "Not enough stock for product: " + product.getName()
                );
            }

            // Update stock
            product.setStockQuantity(product.getStockQuantity() - item.quantity());
            productRepository.save(product);

            return OrderItem.builder()
                    .product(product)
                    .quantity(item.quantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
        }).collect(Collectors.toList());
    }

    private BigDecimal calculateTotal(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getPriceAtPurchase().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase(),
                        item.getPriceAtPurchase().multiply(new BigDecimal(item.getQuantity()))
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getOrderId(),
                order.getUser().getEmail(),
                itemResponses,
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentId(),
                order.getCreatedAt()
        );
    }

    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return mapToOrderResponse(order);
    }

    public Page<OrderResponse> getUserOrders(UUID userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        return orderRepository.findByUserUserId(userId, pageable)
                .map(this::mapToOrderResponse);
    }

    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatus(status, pageable)
                    .map(this::mapToOrderResponse);
        }
        return orderRepository.findAll(pageable)
                .map(this::mapToOrderResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        order.setStatus(status);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Ensure order can be canceled - only PENDING or PROCESSING orders can be canceled
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Only pending or processing orders can be canceled");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Optionally, restore inventory quantities
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }
}
