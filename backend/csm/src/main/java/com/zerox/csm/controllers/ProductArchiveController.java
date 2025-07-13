package com.zerox.csm.controllers;

import com.zerox.csm.dto.ProductDto;
import com.zerox.csm.service.ProductArchiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductArchiveController {

    private final ProductArchiveService productArchiveService;

    @PatchMapping("/{productId}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.ProductResponse> archiveProduct(
            @PathVariable UUID productId
    ) {
        return ResponseEntity.ok(productArchiveService.archiveProduct(productId));
    }

    @PatchMapping("/{productId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.ProductResponse> restoreProduct(
            @PathVariable UUID productId
    ) {
        return ResponseEntity.ok(productArchiveService.restoreProduct(productId));
    }
}
