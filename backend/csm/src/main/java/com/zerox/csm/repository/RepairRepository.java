package com.zerox.csm.repository;

import com.zerox.csm.model.Repair;
import com.zerox.csm.model.RepairStatus;
import com.zerox.csm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepairRepository extends JpaRepository<Repair, UUID> {
    List<Repair> findByUser(User user);
    List<Repair> findByUserOrderByCreatedAtDesc(User user);
    List<Repair> findByStatus(RepairStatus status);
    List<Repair> findByTechnician(User technician);
    List<Repair> findByTechnicianAndStatus(User technician, RepairStatus status);
    List<Repair> findAllByOrderByCreatedAtDesc();
    
    @Modifying
    @Query("DELETE FROM Repair r WHERE r.user = :user")
    int deleteByUser(@Param("user") User user);
} 