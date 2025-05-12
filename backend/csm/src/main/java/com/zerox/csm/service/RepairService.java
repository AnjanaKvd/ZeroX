package com.zerox.csm.service;

import com.zerox.csm.dto.RepairRequestDto;
import com.zerox.csm.dto.RepairRequestDto.RepairRequestCreateRequest;
import com.zerox.csm.dto.RepairRequestDto.RepairRequestResponse;
import com.zerox.csm.dto.RepairRequestDto.RepairRequestUpdateRequest;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.RepairRequest;
import com.zerox.csm.model.RepairRequest.Status;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.RepairRequestRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairService {

    private final RepairRequestRepository repairRequestRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public RepairRequestResponse createRepairRequest(RepairRequestCreateRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RepairRequest repairRequest = RepairRequest.builder()
                .user(user)
                .deviceType(request.deviceType())
                .deviceBrand(request.deviceBrand())
                .deviceModel(request.deviceModel())
                .issueDetails(request.issueDetails())
                .status(Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToRepairResponse(repairRequestRepository.save(repairRequest));
    }

    

    public RepairRequestResponse getRepairRequest(UUID repairId) {
        RepairRequest repairRequest = repairRequestRepository.findById(repairId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair request not found"));
        
        return mapToRepairResponse(repairRequest);
    }
    
    public List<RepairRequestResponse> getUserRepairRequests(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return repairRequestRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToRepairResponse)
                .collect(Collectors.toList());
    }
    
    public Page<RepairRequestResponse> getRepairRequestsByStatus(Status status, Pageable pageable) {
        return repairRequestRepository.findByStatus(status, pageable)
                .map(this::mapToRepairResponse);
    }
    
    @Transactional
    public RepairRequestResponse updateRepairRequest(UUID repairId, RepairRequestUpdateRequest request) {
        RepairRequest repairRequest = repairRequestRepository.findById(repairId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair request not found"));
        
        repairRequest.setStatus(request.status());
        repairRequest.setTechnicianNotes(request.technicianNotes());
        repairRequest.setEstimatedCost(request.estimatedCost());
        repairRequest.setServiceFee(request.serviceFee());
        
        return mapToRepairResponse(repairRequestRepository.save(repairRequest));
    }
    
    private RepairRequestResponse mapToRepairResponse(RepairRequest repairRequest) {
        return new RepairRequestResponse(
                repairRequest.getRepairId(),
                repairRequest.getUser().getUserId(),
                repairRequest.getUser().getFullName(),
                repairRequest.getDeviceType(),
                repairRequest.getDeviceBrand(),
                repairRequest.getDeviceModel(),
                repairRequest.getIssueDetails(),
                repairRequest.getStatus(),
                repairRequest.getTechnicianNotes(),
                repairRequest.getEstimatedCost(),
                repairRequest.getServiceFee(),
                repairRequest.getCreatedAt(),
                repairRequest.getUpdatedAt()
        );
    }
} 