package com.zerox.csm.service;

import com.zerox.csm.dto.SearchDto;
import com.zerox.csm.repository.SearchRepository;
import jakarta.transaction.Transactional;
//import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Array;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SearchService {
    @Autowired
    private SearchRepository searchRepository;

    public List<SearchDto> searchProducts(String keyword) {
        List<String> terms = Arrays.stream(keyword.trim().toLowerCase().split("\\s+"))
                .filter(term -> !term.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (terms.isEmpty()) {
            return Collections.emptyList();
        }
        List<Object[]> results = searchRepository.findProductsByKeywordMatches(terms);
        if (results.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, Integer> scores = new LinkedHashMap<>();
        results.forEach(result -> {
            try {
                UUID prductId = UUID.fromString((String) result[0]);
                scores.put(prductId, ((Number) result[1]).intValue());
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid UUID Format: " + result[0]);
            }
        });

        return searchRepository.findAllById(scores.keySet()).stream()
                .map(product -> new SearchDto(
                        product.getProductId().toString(),
                        scores.get(product.getProductId()),
                        product.getName(),
                        product.getPrice(),
                        product.getImageUrl()
                ))
                .sorted(Comparator.comparingInt(SearchDto::getScore).reversed())
                .collect(Collectors.toList());

    }
}

