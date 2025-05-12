package com.zerox.csm.repository;

import com.zerox.csm.model.Reward;
import com.zerox.csm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RewardRepository extends JpaRepository<Reward, UUID> {
    Optional<Reward> findByUserAndYear(User user, int year);

}
