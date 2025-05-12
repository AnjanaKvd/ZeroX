package com.zerox.csm.controllers;

import com.zerox.csm.dto.RepairRequestDto.RepairRequestCreateRequest;
import com.zerox.csm.dto.RepairRequestDto.RepairRequestResponse;
import com.zerox.csm.dto.RepairRequestDto.RepairRequestUpdateRequest;
import com.zerox.csm.model.RepairRequest.Status;
import com.zerox.csm.service.RepairService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repairs")
@RequiredArgsConstructor
public class RepairController {

    private final RepairService repairService;

    
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<RepairRequestResponse> createRepairRequest(
            @Valid @RequestBody RepairRequestCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // If request is made by customer, ensure they are creating a repair for themselves
        // You would need a method to extract userId from UserDetails
        return ResponseEntity.ok(repairService.createRepairRequest(request));
    }


    @GetMapping("/{repairId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairRequestResponse> getRepairRequest(
            @PathVariable UUID repairId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Additional authorization logic can be added here
        return ResponseEntity.ok(repairService.getRepairRequest(repairId));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<RepairRequestResponse>> getUserRepairRequests(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Ensure users can only see their own repairs unless they're admin
        return ResponseEntity.ok(repairService.getUserRepairRequests(userId));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Page<RepairRequestResponse>> getRepairRequestsByStatus(
            @RequestParam(required = false) Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                repairService.getRepairRequestsByStatus(status, PageRequest.of(page, size))
        );
    }
    
    @PutMapping("/{repairId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairRequestResponse> updateRepairRequest(
            @PathVariable UUID repairId,
            @Valid @RequestBody RepairRequestUpdateRequest request
    ) {
        return ResponseEntity.ok(repairService.updateRepairRequest(repairId, request));
    }

} 