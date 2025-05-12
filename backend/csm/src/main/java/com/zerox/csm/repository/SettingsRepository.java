package com.zerox.csm.repository;

import com.zerox.csm.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, UUID> {
    Optional<Settings> findByKey(String key);
    List<Settings> findByIsPublicTrue();
} 