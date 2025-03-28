package com.zerox.csm.repository;

import com.zerox.csm.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findAllByUserId(Integer userId);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.userId = :userId AND c.productId = :productId")
    void deleteByUserIdAndProductId(@Param("userId") Integer userId,
                                    @Param("productId") Integer productId);

    Optional<Cart> findByUserIdAndProductId(Integer userId, Integer productId);

    <CartItemView> List<CartItemView> findAllProjectedByUserId(Integer userId);
}