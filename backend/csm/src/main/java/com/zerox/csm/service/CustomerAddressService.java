package com.zerox.csm.service;

import com.zerox.csm.dto.CustomerAddressDto;
import com.zerox.csm.dto.CustomerAddressDto.AddressCreateRequest;
import com.zerox.csm.dto.CustomerAddressDto.AddressResponse;
import com.zerox.csm.dto.CustomerAddressDto.AddressUpdateRequest;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.CustomerAddress;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.CustomerAddressRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAddressService {

    private final CustomerAddressRepository addressRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AddressResponse createAddress(AddressCreateRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // If this is the first address or marked as primary, set it as primary
        boolean isPrimary = request.isPrimary() != null && request.isPrimary();
        if (!isPrimary) {
            // Check if this is the first address
            isPrimary = addressRepository.findByUserUserId(user.getUserId()).isEmpty();
        } else {
            // Reset any other primary address
            resetPrimaryAddress(user.getUserId());
        }
        
        CustomerAddress address = CustomerAddress.builder()
                .user(user)
                .street(request.street())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .isPrimary(isPrimary)
                .build();
        
        return mapToAddressResponse(addressRepository.save(address));
    }
    
    public List<AddressResponse> getUserAddresses(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return addressRepository.findByUserUserId(userId)
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }
    
    public AddressResponse getAddress(UUID addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        return mapToAddressResponse(address);
    }
    
    @Transactional
    public AddressResponse updateAddress(UUID addressId, AddressUpdateRequest request) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        // If setting as primary, reset other primary addresses
        if (request.isPrimary() != null && request.isPrimary() && !address.getIsPrimary()) {
            resetPrimaryAddress(address.getUser().getUserId());
        }
        
        address.setStreet(request.street());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZipCode(request.zipCode());
        address.setIsPrimary(request.isPrimary() != null ? request.isPrimary() : address.getIsPrimary());
        
        return mapToAddressResponse(addressRepository.save(address));
    }
    
    @Transactional
    public void deleteAddress(UUID addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        addressRepository.delete(address);
        
        // If this was the primary address, make another address primary if available
        if (address.getIsPrimary()) {
            List<CustomerAddress> remainingAddresses = addressRepository.findByUserUserId(address.getUser().getUserId());
            if (!remainingAddresses.isEmpty()) {
                CustomerAddress newPrimary = remainingAddresses.get(0);
                newPrimary.setIsPrimary(true);
                addressRepository.save(newPrimary);
            }
        }
    }
    
    private void resetPrimaryAddress(UUID userId) {
        Optional<CustomerAddress> currentPrimary = addressRepository.findByUserUserIdAndIsPrimaryTrue(userId);
        currentPrimary.ifPresent(address -> {
            address.setIsPrimary(false);
            addressRepository.save(address);
        });
    }
    
    private AddressResponse mapToAddressResponse(CustomerAddress address) {
        return new AddressResponse(
                address.getAddressId(),
                address.getUser().getUserId(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getIsPrimary()
        );
    }
} 