package com.zerox.csm.service;

import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.exception.ValidationException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CartRepository cartRepository;
    
    @Mock
    private CouponUsageRepository couponUsageRepository;
    
    @Mock
    private RewardPointsRepository rewardPointsRepository;
    
    @Mock
    private ReviewRepository reviewRepository;
    
    @Mock
    private CustomerAddressRepository customerAddressRepository;
    
    @Mock
    private RepairRepository repairRepository;
    
    @Mock
    private OrderRepository orderRepository;
    
    @InjectMocks
    private UserManagementService userManagementService;
    
    private User testUser;
    private UUID testUserId;
    
    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = new User();
        testUser.setUserId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.CUSTOMER);
    }
    
    @Test
    void deleteUser_WithRelatedRecords_DeletesAllRelatedData() {
        // Arrange
        when(userRepository.findByIdIncludeDeleted(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.countByRole(UserRole.ADMIN)).thenReturn(2L); // Not the last admin
        
        // Mock related repositories
        when(cartRepository.deleteByUserUserId(testUserId)).thenReturn(1);
        when(couponUsageRepository.deleteByUser(testUser)).thenReturn(3);
        when(rewardPointsRepository.deleteByUserUserId(testUserId)).thenReturn(5);
        when(reviewRepository.deleteByUserUserId(testUserId)).thenReturn(2);
        when(customerAddressRepository.deleteByUserUserId(testUserId)).thenReturn(1);
        when(repairRepository.deleteByUser(testUser)).thenReturn(2);
        when(orderRepository.deleteByUserUserId(testUserId)).thenReturn(4);
        
        // Act
        userManagementService.deleteUser(testUserId);
        
        // Assert
        verify(userRepository).hardDelete(testUserId);
        verify(cartRepository).deleteByUserUserId(testUserId);
        verify(couponUsageRepository).deleteByUser(testUser);
        verify(rewardPointsRepository).deleteByUserUserId(testUserId);
        verify(reviewRepository).deleteByUserUserId(testUserId);
        verify(customerAddressRepository).deleteByUserUserId(testUserId);
        verify(repairRepository).deleteByUser(testUser);
        verify(orderRepository).deleteByUserUserId(testUserId);
    }
    
    @Test
    void deleteUser_LastAdmin_ThrowsException() {
        // Arrange
        testUser.setRole(UserRole.ADMIN);
        when(userRepository.findByIdIncludeDeleted(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.countByRole(UserRole.ADMIN)).thenReturn(1L); // Last admin
        
        // Act & Assert
        assertThrows(ValidationException.class, () -> userManagementService.deleteUser(testUserId));
        verify(userRepository, never()).hardDelete(any());
    }
    
    @Test
    void deleteUser_NonExistentUser_ThrowsException() {
        // Arrange
        when(userRepository.findByIdIncludeDeleted(testUserId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userManagementService.deleteUser(testUserId));
        verify(userRepository, never()).hardDelete(any());
    }
    
    @Test
    void deleteUser_WithDeletionFailure_ThrowsException() {
        // Arrange
        when(userRepository.findByIdIncludeDeleted(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.countByRole(UserRole.ADMIN)).thenReturn(2L);
        
        // Simulate failure during order deletion
        when(orderRepository.deleteByUserUserId(testUserId)).thenThrow(new RuntimeException("Database error"));
        
        // Act & Assert
        assertThrows(ValidationException.class, () -> userManagementService.deleteUser(testUserId));
        verify(userRepository, never()).hardDelete(any());
    }
}
