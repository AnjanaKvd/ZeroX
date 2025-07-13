package com.zerox.csm.controllers;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.model.Order;
import com.zerox.csm.dto.OrderDto;
import com.zerox.csm.dto.OrderDto.OrderResponse;
import com.zerox.csm.dto.OrderDto.OrderItemResponse;
import com.zerox.csm.model.OrderItem;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.dto.UserDto.AdminUserResponse;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;

//@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/report")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.zerox.csm.service.RepairService repairService;

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrdersReport(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        List<Order> orders = orderRepository.findAll();
        if (status != null) {
            orders = orders.stream()
                    .filter(o -> o.getStatus() != null && o.getStatus().name().equalsIgnoreCase(status))
                    .toList();
        }
        if (startDate != null && endDate != null) {
            java.time.LocalDateTime start = java.time.LocalDate.parse(startDate).atStartOfDay();
            java.time.LocalDateTime end = java.time.LocalDate.parse(endDate).atTime(23,59,59);
            orders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null &&
                        (o.getCreatedAt().isEqual(start) || o.getCreatedAt().isAfter(start)) &&
                        (o.getCreatedAt().isEqual(end) || o.getCreatedAt().isBefore(end)))
                    .toList();
        }
        // Map to DTOs to avoid recursion and sensitive fields
        List<OrderResponse> dtos = orders.stream().map(order ->
            new OrderResponse(
                order.getOrderId(),
                order.getUser() != null ? order.getUser().getEmail() : null,
                order.getItems() != null ? order.getItems().stream().map(item ->
                    new OrderItemResponse(
                        item.getProduct() != null ? item.getProduct().getName() : null,
                        item.getQuantity() != null ? item.getQuantity() : 0,
                        item.getPriceAtPurchase(),
                        item.getPriceAtPurchase() != null && item.getQuantity() != null ? item.getPriceAtPurchase().multiply(new java.math.BigDecimal(item.getQuantity())) : java.math.BigDecimal.ZERO
                    )
                ).collect(Collectors.toList()) : List.of(),
                order.getTotalAmount(),
                order.getDiscountAmount(),
                order.getFinalAmount(),
                order.getCouponCode(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentId(),
                order.getCreatedAt()
            )
        ).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<AdminUserResponse>> getAllCustomersReport() {
        List<AdminUserResponse> customers = userRepository.findAll().stream()
            .map(user -> new AdminUserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole() != null ? user.getRole() : null,
                user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0,
                user.getCreatedAt() != null ? user.getCreatedAt() : null,
                user.getLastLogin() != null ? user.getLastLogin() : null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/repairs")
    public ResponseEntity<List<com.zerox.csm.dto.RepairDto>> getAllRepairsReport() {
        List<com.zerox.csm.dto.RepairDto> repairs = repairService.getAllRepairs();
        return ResponseEntity.ok(repairs);
    }
}
