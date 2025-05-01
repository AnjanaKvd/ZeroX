package com.zerox.csm.service;

import com.zerox.csm.dto.CustomerAddressDto.AddressRequest;
import com.zerox.csm.dto.CustomerAddressDto.AddressResponse;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.CustomerAddress;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.CustomerAddressRepository;
import com.zerox.csm.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAddressService {

    private final CustomerAddressRepository customerAddressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getUserAddresses(UUID userId) {
        return customerAddressRepository.findByUserUserId(userId).stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    public AddressResponse getAddress(UUID addressId) {
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        return mapToAddressResponse(address);
    }

    @Transactional
    public AddressResponse createAddress(UUID userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean setAsDefault = request.isDefault() != null && request.isDefault();

        // If this is the first address or marked as default, make it default
        if (setAsDefault || !customerAddressRepository.existsByUserUserIdAndIsDefaultTrue(userId)) {
            // If setting this as default, unset any existing default
            if (setAsDefault) {
                customerAddressRepository.findByUserUserIdAndIsDefaultTrue(userId)
                        .ifPresent(addr -> {
                            addr.setIsDefault(false);
                            customerAddressRepository.save(addr);
                        });
            }
            setAsDefault = true;
        }

        CustomerAddress address = CustomerAddress.builder()
                .user(user)
                .fullName(request.fullName())
                .addressLine1(request.addressLine1())
                .addressLine2(request.addressLine2())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .country(request.country())
                .isDefault(setAsDefault)
                .build();

        return mapToAddressResponse(customerAddressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(UUID addressId, AddressRequest request) {
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        boolean currentlyDefault = address.getIsDefault() != null && address.getIsDefault();
        boolean shouldBeDefault = request.isDefault() != null && request.isDefault();

        // If address is being set as default and it's not already default
        if (shouldBeDefault && !currentlyDefault) {
            // Find current default address and unset it
            customerAddressRepository.findByUserUserIdAndIsDefaultTrue(address.getUser().getUserId())
                    .ifPresent(defaultAddr -> {
                        defaultAddr.setIsDefault(false);
                        customerAddressRepository.save(defaultAddr);
                    });
        }

        address.setFullName(request.fullName());
        address.setAddressLine1(request.addressLine1());
        address.setAddressLine2(request.addressLine2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZipCode(request.zipCode());
        address.setCountry(request.country());
        address.setIsDefault(shouldBeDefault);

        return mapToAddressResponse(customerAddressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(UUID addressId) {
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        customerAddressRepository.delete(address);

        // If the deleted address was the default, set another address as default if available
        if (address.getIsDefault() != null && address.getIsDefault()) {
            customerAddressRepository.findByUserUserId(address.getUser().getUserId()).stream()
                    .findFirst()
                    .ifPresent(newDefault -> {
                        newDefault.setIsDefault(true);
                        customerAddressRepository.save(newDefault);
                    });
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        // Ensure the address exists and belongs to the user
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found for this user");
        }

        // Find current default address and unset it
        customerAddressRepository.findByUserUserIdAndIsDefaultTrue(userId)
                .ifPresent(currentDefault -> {
                    currentDefault.setIsDefault(false);
                    customerAddressRepository.save(currentDefault);
                });

        // Set new default
        address.setIsDefault(true);
        return mapToAddressResponse(customerAddressRepository.save(address));
    }

    private AddressResponse mapToAddressResponse(CustomerAddress address) {
        return new AddressResponse(
                address.getAddressId(),
                address.getFullName(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry(),
                address.getIsDefault()
        );
    }
}