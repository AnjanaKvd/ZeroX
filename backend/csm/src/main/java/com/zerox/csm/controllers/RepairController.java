package com.zerox.csm.controllers;

import com.zerox.csm.dto.RepairDto;
import com.zerox.csm.model.RepairStatus;
import com.zerox.csm.model.UserRole;
import com.zerox.csm.service.RepairService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairService repairService;

    @Autowired
    public RepairController(RepairService repairService) {
        this.repairService = repairService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RepairDto> createRepairRequest(
            @RequestBody RepairDto repairDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Extract user email from userDetails
        String userEmail = userDetails.getUsername();
        RepairDto createdRepair = repairService.createRepairRequest(repairDto, userEmail);
        return new ResponseEntity<>(createdRepair, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RepairDto>> getUserRepairs(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Extract user email from userDetails
        String userEmail = userDetails.getUsername();
        List<RepairDto> repairs = repairService.getUserRepairsByEmail(userEmail);
        return ResponseEntity.ok(repairs);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairDto>> getAllRepairs() {
        List<RepairDto> repairs = repairService.getAllRepairs();
        return ResponseEntity.ok(repairs);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairDto>> getRepairsByStatus(@PathVariable RepairStatus status) {
        List<RepairDto> repairs = repairService.getRepairsByStatus(status);
        return ResponseEntity.ok(repairs);
    }

    @GetMapping("/technician")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<RepairDto>> getTechnicianRepairs(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Extract user email from userDetails
        String technicianEmail = userDetails.getUsername();
        List<RepairDto> repairs = repairService.getTechnicianRepairsByEmail(technicianEmail);
        return ResponseEntity.ok(repairs);
    }

    @GetMapping("/{repairId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<RepairDto> getRepairById(
            @PathVariable UUID repairId,
            @AuthenticationPrincipal UserDetails userDetails) {
        RepairDto repair = repairService.getRepairById(repairId);
        
        // Check if user can access this repair
        boolean isAuthorized = repairService.canUserAccessRepair(repair, userDetails.getUsername());
        if (!isAuthorized) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return ResponseEntity.ok(repair);
    }

    @PatchMapping("/{repairId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairDto> updateRepairStatus(
            @PathVariable UUID repairId,
            @RequestParam RepairStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Extract user email from userDetails
        String userEmail = userDetails.getUsername();
        RepairDto updatedRepair = repairService.updateRepairStatus(repairId, status, userEmail);
        return ResponseEntity.ok(updatedRepair);
    }

    @PutMapping("/{repairId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairDto> updateRepairDetails(
            @PathVariable UUID repairId,
            @RequestBody RepairDto repairDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Extract user email from userDetails
        String userEmail = userDetails.getUsername();
        RepairDto updatedRepair = repairService.updateRepairDetails(repairId, repairDto, userEmail);
        return ResponseEntity.ok(updatedRepair);
    }

    @DeleteMapping("/{repairId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRepair(@PathVariable UUID repairId) {
        repairService.deleteRepair(repairId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/count/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairDto>> getRepairCountByStatus() {
        List<RepairDto> repairs = repairService.getAllRepairs();
        return ResponseEntity.ok(repairs);
    }
} 