package com.zerox.csm.service;

import com.zerox.csm.dto.SettingsDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Currency;
import com.zerox.csm.model.Settings;
import com.zerox.csm.repository.SettingsRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;
    
    // Default settings initialization
    @PostConstruct
    public void init() {
        // Initialize currency if not exists
        if (settingsRepository.findByKey("currency").isEmpty()) {
            Settings currencySetting = Settings.builder()
                    .key("currency")
                    .value(Currency.LKR.name())
                    .description("Default currency for the store")
                    .isPublic(true)
                    .build();
            settingsRepository.save(currencySetting);
        }
    }
    
    public List<SettingsDto.SettingsResponse> getAllSettings() {
        return settingsRepository.findAll().stream()
                .map(this::mapToSettingsResponse)
                .collect(Collectors.toList());
    }
    
    public SettingsDto.SettingsResponse getSettingById(UUID id) {
        Settings settings = settingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        return mapToSettingsResponse(settings);
    }
    
    public SettingsDto.SettingsResponse getSettingByKey(String key) {
        Settings settings = settingsRepository.findByKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
        return mapToSettingsResponse(settings);
    }
    
    public List<SettingsDto.PublicSettingsResponse> getPublicSettings() {
        return settingsRepository.findByIsPublicTrue().stream()
                .map(this::mapToPublicSettingsResponse)
                .collect(Collectors.toList());
    }
    
    public SettingsDto.CurrencySettingsResponse getCurrentCurrency() {
        Settings currencySetting = settingsRepository.findByKey("currency")
                .orElseThrow(() -> new ResourceNotFoundException("Currency setting not found"));
        
        return SettingsDto.CurrencySettingsResponse.builder()
                .currency(Currency.valueOf(currencySetting.getValue()))
                .build();
    }
    
    public SettingsDto.SettingsResponse createSetting(SettingsDto.CreateSettingsRequest request) {
        Settings settings = Settings.builder()
                .key(request.getKey())
                .value(request.getValue())
                .description(request.getDescription())
                .isPublic(request.getIsPublic())
                .build();
        
        Settings savedSettings = settingsRepository.save(settings);
        return mapToSettingsResponse(savedSettings);
    }
    
    public SettingsDto.SettingsResponse updateSetting(String key, SettingsDto.UpdateSettingsRequest request) {
        Settings settings = settingsRepository.findByKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
        
        settings.setValue(request.getValue());
        
        if (request.getDescription() != null) {
            settings.setDescription(request.getDescription());
        }
        
        if (request.getIsPublic() != null) {
            settings.setPublic(request.getIsPublic());
        }
        
        Settings updatedSettings = settingsRepository.save(settings);
        return mapToSettingsResponse(updatedSettings);
    }
    
    public void deleteSetting(UUID id) {
        if (!settingsRepository.existsById(id)) {
            throw new ResourceNotFoundException("Setting not found with id: " + id);
        }
        settingsRepository.deleteById(id);
    }
    
    private SettingsDto.SettingsResponse mapToSettingsResponse(Settings settings) {
        return SettingsDto.SettingsResponse.builder()
                .id(settings.getId())
                .key(settings.getKey())
                .value(settings.getValue())
                .description(settings.getDescription())
                .isPublic(settings.isPublic())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
    
    private SettingsDto.PublicSettingsResponse mapToPublicSettingsResponse(Settings settings) {
        return SettingsDto.PublicSettingsResponse.builder()
                .key(settings.getKey())
                .value(settings.getValue())
                .description(settings.getDescription())
                .build();
    }
} 