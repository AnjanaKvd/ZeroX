package com.zerox.csm.controllers;

import com.zerox.csm.dto.CartDto;
import com.zerox.csm.model.Cart;
import com.zerox.csm.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/carts")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping("/all")
    public ResponseEntity<List<CartDto>> getAllCartItems() {
        List<CartDto> cartItems = cartService.getAllCartItems();
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartDto cartDto) {
        cartService.addToCart(cartDto);
        return ResponseEntity.ok("Item added to cart successfully");
    }

    @PutMapping("/update/{cartId}")
    public ResponseEntity<String> updateCartItem(@PathVariable UUID cartId, @RequestBody CartDto cartDto) {
        cartService.updateCartItem(cartId, cartDto);
        return ResponseEntity.ok("Cart item updated successfully");
    }
    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeCartItem(@PathVariable UUID productId) {
        cartService.removeCartItem(productId);
        return ResponseEntity.ok("Item remove from cart");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok("Cart cleared");
    }

    //testing

//    @PostMapping("/test")
//    public String testCart() {
//        Cart cart = new Cart("Test Product", 1, 100.00);
//        cartService.save(cart);
//        return "Test item added successfully!";
//    }


}
