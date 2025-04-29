package com.zerox.csm.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchDto {
    private String productId;
    private Integer score;
    private String name;
    private BigDecimal price;
    private String imageUrl;

    public SearchDto(String productId, int score, String name, BigDecimal price,String imageUrl){
        this.productId = productId;
        this.name = name;
        this.score = score;
        this.price = price;
    }

    public String getProductId() {return productId;}

    public Integer getScore() {return score;}

    public String getName() {return name;}

    public BigDecimal getPrice() {return price;}

    public String getimageUrl() {return imageUrl;}
}
