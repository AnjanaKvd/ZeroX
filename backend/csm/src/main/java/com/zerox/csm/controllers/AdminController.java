package com.zerox.csm.controllers;

import com.zerox.csm.dto.ProductDto;
import com.zerox.csm.service.CategoryService;
import com.zerox.csm.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final ProductService productService;
    private final CategoryService categoryService;

    @GetMapping
    public String adminDashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/products")
    public String listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model
    ) {
        Page<ProductDto.ProductResponse> products = productService.searchProducts(
                null, null, null, null, null, "name", "asc", page, size
        );
        model.addAttribute("products", products);
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/products/list";
    }

    @GetMapping("/products/new")
    public String showCreateProductForm(Model model) {
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/products/create";
    }

    @GetMapping("/products/{id}/edit")
    public String showEditProductForm(@PathVariable UUID id, Model model) {
        model.addAttribute("product", productService.getProduct(id));
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/products/edit";
    }
} 