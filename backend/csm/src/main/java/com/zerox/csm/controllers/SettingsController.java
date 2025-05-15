package com.zerox.csm.controllers;

import com.zerox.csm.dto.SettingsDto;
import com.zerox.csm.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;
    
    @GetMapping("/public")
    public ResponseEntity<List<SettingsDto.PublicSettingsResponse>> getPublicSettings() {
        return ResponseEntity.ok(settingsService.getPublicSettings());
    }
    
    @GetMapping("/currency")
    public ResponseEntity<SettingsDto.CurrencySettingsResponse> getCurrentCurrency() {
        return ResponseEntity.ok(settingsService.getCurrentCurrency());
    }
} 