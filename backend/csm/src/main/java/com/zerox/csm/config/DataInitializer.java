package com.zerox.csm.config;

import com.zerox.csm.model.Category;
import com.zerox.csm.model.Product;
import com.zerox.csm.repository.CategoryRepository;
import com.zerox.csm.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    
    @Bean
    @Profile("dev")
    public CommandLineRunner initializeData() {
        return args -> {
            // Only run if categories table is empty
            if (categoryRepository.count() == 0) {
                // Create categories
                Category laptops = categoryRepository.save(Category.builder()
                        .name("Laptops")
                        .build());
                
                Category desktops = categoryRepository.save(Category.builder()
                        .name("Desktops")
                        .build());
                
                Category accessories = categoryRepository.save(Category.builder()
                        .name("Accessories")
                        .build());
                
                // Create products
                if (productRepository.count() == 0) {
                    // Create some sample products
                    Product laptop1 = Product.builder()
                            .sku(generateSku(laptops, UUID.randomUUID()))
                            .name("Dell XPS 15")
                            .description("15.6\" 4K UHD InfinityEdge, Intel Core i7, 32GB RAM, 1TB SSD")
                            .price(new BigDecimal("1799.99"))
                            .category(laptops)
                            .stockQuantity(10)
                            .lowStockThreshold(3)
                            .brand("Dell")
                            .warrantyPeriodMonths(12)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    Product laptop2 = Product.builder()
                            .sku(generateSku(laptops, UUID.randomUUID()))
                            .name("MacBook Pro 16")
                            .description("16\" Retina Display, Apple M1 Pro chip, 16GB RAM, 512GB SSD")
                            .price(new BigDecimal("2399.99"))
                            .category(laptops)
                            .stockQuantity(8)
                            .lowStockThreshold(2)
                            .brand("Apple")
                            .warrantyPeriodMonths(12)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    Product desktop1 = Product.builder()
                            .sku(generateSku(desktops, UUID.randomUUID()))
                            .name("HP Pavilion Gaming Desktop")
                            .description("AMD Ryzen 7, RTX 3060, 16GB RAM, 512GB SSD + 1TB HDD")
                            .price(new BigDecimal("1099.99"))
                            .category(desktops)
                            .stockQuantity(5)
                            .lowStockThreshold(2)
                            .brand("HP")
                            .warrantyPeriodMonths(12)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    Product accessory1 = Product.builder()
                            .sku(generateSku(accessories, UUID.randomUUID()))
                            .name("Logitech MX Master 3")
                            .description("Advanced Wireless Mouse")
                            .price(new BigDecimal("99.99"))
                            .category(accessories)
                            .stockQuantity(20)
                            .lowStockThreshold(5)
                            .brand("Logitech")
                            .warrantyPeriodMonths(12)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    Product accessory2 = Product.builder()
                            .sku(generateSku(accessories, UUID.randomUUID()))
                            .name("Keychron K2 Keyboard")
                            .description("Wireless Mechanical Keyboard with Gateron Brown Switches")
                            .price(new BigDecimal("89.99"))
                            .category(accessories)
                            .stockQuantity(15)
                            .lowStockThreshold(3)
                            .brand("Keychron")
                            .warrantyPeriodMonths(12)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    productRepository.saveAll(Arrays.asList(laptop1, laptop2, desktop1, accessory1, accessory2));
                }
            }
        };
    }
    
    private String generateSku(Category category, UUID uuid) {
        // Get the first 3 letters of category name, uppercase
        String categoryCode = category.getName().substring(0, Math.min(3, category.getName().length()))
                .toUpperCase();
        
        // Get the first 5 characters of the UUID
        String uuidPart = uuid.toString().substring(0, 5);
        
        // Combine them with a separator
        return categoryCode + "-" + uuidPart;
    }
} 