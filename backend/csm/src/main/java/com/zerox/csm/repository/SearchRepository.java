package com.zerox.csm.repository;

import com.zerox.csm.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SearchRepository extends JpaRepository<Product, UUID> {

    @Query(value = """
                              SELECT\s
                              BIN_TO_UUID(p.product_id) AS productIdStr,
                              COUNT(*) AS score
                          FROM products p
                          CROSS JOIN JSON_TABLE(
                              CONCAT('["', REPLACE(p.keywords, ' ', '","'), '"]'),
                              '$[*]' COLUMNS(keyword VARCHAR(255) PATH '$')
                          ) AS jt
                          WHERE LOWER(jt.keyword) IN :terms
                          GROUP BY p.product_id
                          ORDER BY score DESC
                          """, nativeQuery = true)
    List<Object[]> findProductsByKeywordMatches(@Param("terms")List<String> terms);
}
