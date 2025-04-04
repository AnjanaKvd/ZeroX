package com.zerox.csm.controllers;

import com.zerox.csm.dto.SearchDto;
import com.zerox.csm.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/productssearch")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @GetMapping("/item")
    public ResponseEntity<List<SearchDto>> searchProducts(
            @RequestParam(name = "q", required = false) String query) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        List<SearchDto> results = searchService.searchProducts(query.trim());
        return ResponseEntity.ok(results);
    }

}
