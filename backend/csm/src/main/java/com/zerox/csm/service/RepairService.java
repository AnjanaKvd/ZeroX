package com.zerox.csm.service;

import com.zerox.csm.dto.RepairDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Repair;
import com.zerox.csm.model.RepairStatus;
import com.zerox.csm.model.User;
import com.zerox.csm.model.UserRole;
import com.zerox.csm.repository.RepairRepository;
import com.zerox.csm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RepairService {

    private final RepairRepository repairRepository;
    private final UserRepository userRepository;

    @Autowired
    public RepairService(RepairRepository repairRepository, UserRepository userRepository) {
        this.repairRepository = repairRepository;
        this.userRepository = userRepository;
    }

    public RepairDto createRepairRequest(RepairDto repairDto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Repair repair = Repair.builder()
                .user(user)
                .deviceType(repairDto.getDeviceType())
                .deviceModel(repairDto.getDeviceModel())
                .serialNumber(repairDto.getSerialNumber())
                .problemDescription(repairDto.getProblemDescription())
                .additionalNotes(repairDto.getAdditionalNotes())
                .status(RepairStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Repair savedRepair = repairRepository.save(repair);
        return mapToDto(savedRepair);
    }

    public List<RepairDto> getUserRepairsByEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Repair> repairs = repairRepository.findByUserOrderByCreatedAtDesc(user);
        return repairs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<RepairDto> getAllRepairs() {
        List<Repair> repairs = repairRepository.findAllByOrderByCreatedAtDesc();
        return repairs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<RepairDto> getRepairsByStatus(RepairStatus status) {
        List<Repair> repairs = repairRepository.findByStatus(status);
        return repairs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<RepairDto> getTechnicianRepairsByEmail(String technicianEmail) {
        User technician = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        
        if (technician.getRole() != UserRole.TECHNICIAN && technician.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("User is not a technician or admin");
        }
        
        List<Repair> repairs = repairRepository.findByTechnician(technician);
        return repairs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RepairDto getRepairById(UUID repairId) {
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found"));
        return mapToDto(repair);
    }

    public boolean canUserAccessRepair(RepairDto repairDto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Admin and technicians can access all repairs
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN) {
            return true;
        }
        
        // Customers can only access their own repairs
        if (user.getRole() == UserRole.CUSTOMER) {
            return repairDto.getUserEmail().equals(userEmail);
        }
        
        return false;
    }

    public RepairDto updateRepairStatus(UUID repairId, RepairStatus status, String userEmail) {
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getRole() != UserRole.TECHNICIAN && user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to update repair status");
        }
        
        repair.setStatus(status);
        repair.setUpdatedAt(LocalDateTime.now());
        
        // Assign repair to technician if not already assigned
        if (repair.getTechnician() == null && user.getRole() == UserRole.TECHNICIAN) {
            repair.setTechnician(user);
        }
        
        if (status == RepairStatus.COMPLETED) {
            repair.setActualCompletionDate(LocalDateTime.now());
        }
        
        Repair updatedRepair = repairRepository.save(repair);
        return mapToDto(updatedRepair);
    }

    public RepairDto updateRepairDetails(UUID repairId, RepairDto repairDto, String userEmail) {
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getRole() != UserRole.TECHNICIAN && user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to update repair details");
        }
        
        if (repairDto.getStatus() != null) {
            repair.setStatus(repairDto.getStatus());
            if (repairDto.getStatus() == RepairStatus.COMPLETED) {
                repair.setActualCompletionDate(LocalDateTime.now());
            }
        }
        
        if (repairDto.getDiagnosticNotes() != null) {
            repair.setDiagnosticNotes(repairDto.getDiagnosticNotes());
        }
        
        if (repairDto.getEstimatedCompletionDate() != null) {
            repair.setEstimatedCompletionDate(repairDto.getEstimatedCompletionDate());
        }
        
        if (repairDto.getRepairCost() != null) {
            repair.setRepairCost(repairDto.getRepairCost());
        }
        
        if (repairDto.getIsPaid() != null) {
            repair.setIsPaid(repairDto.getIsPaid());
        }
        
        // Assign repair to technician if not already assigned
        if (repair.getTechnician() == null && user.getRole() == UserRole.TECHNICIAN) {
            repair.setTechnician(user);
        }
        
        repair.setUpdatedAt(LocalDateTime.now());
        Repair updatedRepair = repairRepository.save(repair);
        return mapToDto(updatedRepair);
    }

    public void deleteRepair(UUID repairId) {
        if (!repairRepository.existsById(repairId)) {
            throw new ResourceNotFoundException("Repair not found");
        }
        repairRepository.deleteById(repairId);
    }

    private RepairDto mapToDto(Repair repair) {
        RepairDto dto = new RepairDto();
        dto.setRepairId(repair.getRepairId());
        dto.setUserId(repair.getUser().getUserId());
        dto.setUserFullName(repair.getUser().getFullName());
        dto.setUserEmail(repair.getUser().getEmail());
        dto.setDeviceType(repair.getDeviceType());
        dto.setDeviceModel(repair.getDeviceModel());
        dto.setSerialNumber(repair.getSerialNumber());
        dto.setProblemDescription(repair.getProblemDescription());
        dto.setAdditionalNotes(repair.getAdditionalNotes());
        dto.setStatus(repair.getStatus());
        
        if (repair.getTechnician() != null) {
            dto.setTechnicianId(repair.getTechnician().getUserId());
            dto.setTechnicianName(repair.getTechnician().getFullName());
        }
        
        dto.setEstimatedCompletionDate(repair.getEstimatedCompletionDate());
        dto.setActualCompletionDate(repair.getActualCompletionDate());
        dto.setDiagnosticNotes(repair.getDiagnosticNotes());
        dto.setRepairCost(repair.getRepairCost());
        dto.setIsPaid(repair.getIsPaid());
        dto.setCreatedAt(repair.getCreatedAt());
        dto.setUpdatedAt(repair.getUpdatedAt());
        
        return dto;
    }
} 