package com.zerox.csm.controllers;

import com.zerox.csm.dto.SettingsDto;
import com.zerox.csm.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SettingsService settingsService;
    
    @GetMapping
    public ResponseEntity<List<SettingsDto.SettingsResponse>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SettingsDto.SettingsResponse> getSettingById(@PathVariable UUID id) {
        return ResponseEntity.ok(settingsService.getSettingById(id));
    }
    
    @GetMapping("/key/{key}")
    public ResponseEntity<SettingsDto.SettingsResponse> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(settingsService.getSettingByKey(key));
    }
    
    @PostMapping
    public ResponseEntity<SettingsDto.SettingsResponse> createSetting(
            @Valid @RequestBody SettingsDto.CreateSettingsRequest request) {
        return new ResponseEntity<>(settingsService.createSetting(request), HttpStatus.CREATED);
    }
    
    @PutMapping("/{key}")
    public ResponseEntity<SettingsDto.SettingsResponse> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody SettingsDto.UpdateSettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSetting(key, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSetting(@PathVariable UUID id) {
        settingsService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }
} 