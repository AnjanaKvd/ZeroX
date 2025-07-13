package com.zerox.csm.service;

import com.zerox.csm.dto.ProductDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Product;
import com.zerox.csm.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductArchiveService {

    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional
    public ProductDto.ProductResponse archiveProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setActive(false);
        Product savedProduct = productRepository.save(product);

        return mapToProductResponse(savedProduct);
    }

    @Transactional
    public ProductDto.ProductResponse restoreProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setActive(true);
        Product savedProduct = productRepository.save(product);

        return mapToProductResponse(savedProduct);
    }

    private ProductDto.ProductResponse mapToProductResponse(Product product) {
        return new ProductDto.ProductResponse(
                product.getProductId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory().getName(),
                product.getSku(),
                product.getBrand(),
                product.getStockQuantity(),
                product.getLowStockThreshold(),
                product.getWarrantyPeriodMonths(),
                product.getImageUrl(),
                product.getCreatedAt(),
                product.getKeywords()
        );
    }
}
