package com.zerox.csm.service;

import com.zerox.csm.dto.CouponDto;
import com.zerox.csm.dto.OrderDto.OrderItemRequest;
import com.zerox.csm.dto.OrderDto.OrderRequest;
import com.zerox.csm.dto.OrderDto.OrderResponse;
import com.zerox.csm.dto.OrderDto.OrderItemResponse;
import com.zerox.csm.dto.ProductDiscountDto;
import com.zerox.csm.exception.InsufficientStockException;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.exception.ValidationException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.CustomerAddressRepository;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.repository.CouponRepository;
import com.zerox.csm.service.ProductDiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final CustomerAddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final ProductDiscountService productDiscountService;
    private final EmailService emailService;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // 1. Get user
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Handle address
        CustomerAddress address;
        if (request.addressId() != null) {
            // Use existing address
            address = addressRepository.findById(request.addressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        } else if (request.shippingAddress() != null) {
            // Create new address for this order
            address = CustomerAddress.builder()
                    .user(user)
                    .fullName(request.shippingAddress().fullName())
                    .addressLine1(request.shippingAddress().addressLine1())
                    .addressLine2(request.shippingAddress().addressLine2())
                    .city(request.shippingAddress().city())
                    .state(request.shippingAddress().state())
                    .zipCode(request.shippingAddress().zipCode())
                    .country(request.shippingAddress().country())
                    .isDefault(false)
                    .build();

            address = addressRepository.save(address);
        } else {
            throw new IllegalArgumentException("Either addressId or shippingAddress must be provided");
        }

        // 3. Validate stock availability
        List<OrderItem> items = validateAndCreateItems(request.items());

        // 4. Calculate total
        BigDecimal total = calculateTotal(items);

        // 5. Handle coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalAmount = total;
        Coupon coupon = null;

        if (request.couponCode() != null && !request.couponCode().isEmpty()) {
            coupon = couponRepository.findByCode(request.couponCode())
                    .orElseThrow(() -> new ValidationException("Invalid coupon code"));

            // Validate coupon
            CouponDto.CouponValidationRequest validationRequest = new CouponDto.CouponValidationRequest(
                    request.couponCode(),
                    total,
                    user.getUserId()
            );

            CouponDto.CouponValidationResponse validationResponse =
                    couponService.validateCoupon(validationRequest);

            if (!validationResponse.valid()) {
                throw new ValidationException(validationResponse.message());
            }

            discountAmount = validationResponse.discountAmount();
            finalAmount = total.subtract(discountAmount);
        }

        // 6. Create order
        Order order = Order.builder()
                .user(user)
                .items(items)
                .totalAmount(total)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .coupon(coupon)
                .couponCode(request.couponCode())
                .status(OrderStatus.PENDING)
                .paymentMethod(request.paymentMethod())
                .createdAt(LocalDateTime.now())
                .shippingAddress(address)
                .build();

        // Set back-reference to order
        items.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);

        // 7. Send order confirmation email
        String orderDetails = "Items Ordered:\n";
        for (OrderItem item : savedOrder.getItems()) {
            orderDetails += "- " + item.getProduct().getName() + " x " + item.getQuantity() + "\n";
        }
        orderDetails += "\nTotal Amount: " + savedOrder.getTotalAmount() + "\n";
        if (savedOrder.getDiscountAmount() != null) {
            orderDetails += "Discount: " + savedOrder.getDiscountAmount() + "\n";
        }
        orderDetails += "Final Amount: " + savedOrder.getFinalAmount();

        emailService.sendOrderConfirmationEmail(user.getEmail(), savedOrder.getOrderId().toString(), orderDetails);

        // 8. Record coupon usage if used
        if (coupon != null) {
            couponService.recordCouponUsage(coupon, user, savedOrder, discountAmount);
        }

        return mapToOrderResponse(savedOrder);
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

            // Check for active discounts
            ProductDiscountDto.ActiveDiscountResponse activeDiscount = productDiscountService.getActiveDiscountForProduct(product.getProductId());
            BigDecimal discountedPrice = product.getPrice();
            
            if (activeDiscount != null) {
                discountedPrice = activeDiscount.discountPrice();
            }

            // Update stock
            product.setStockQuantity(product.getStockQuantity() - item.quantity());
            productRepository.save(product);

            return OrderItem.builder()
                    .product(product)
                    .quantity(item.quantity())
                    .priceAtPurchase(discountedPrice)
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

        // Handle potentially null user
        String userEmail = order.getUser() != null ? order.getUser().getEmail() : "Guest User";

        return new OrderResponse(
                order.getOrderId(),
                userEmail,
                itemResponses,
                order.getTotalAmount(),
                order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO,
                order.getFinalAmount(),
                order.getCouponCode(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentId(),
                order.getShippingAddress() != null ? order.getShippingAddress().getAddressId() : null,
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