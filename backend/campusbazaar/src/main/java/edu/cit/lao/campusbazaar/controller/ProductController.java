package edu.cit.lao.campusbazaar.controller;

import edu.cit.lao.campusbazaar.dto.AuthResponse;
import edu.cit.lao.campusbazaar.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<AuthResponse> getAllProducts(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getAllProducts(search));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<AuthResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/products/my")
    public ResponseEntity<AuthResponse> getMyProducts(Authentication auth) {
        return ResponseEntity.ok(productService.getMyProducts(auth.getName()));
    }

    @PostMapping(value = "/products", consumes = "multipart/form-data")
    public ResponseEntity<AuthResponse> createProduct(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) MultipartFile image,
            Authentication auth) {
        return ResponseEntity.ok(
                productService.createProduct(
                        name, description, price, stock,
                        category, image, auth.getName()));
    }

    @PutMapping(value = "/products/{id}", consumes = "multipart/form-data")
    public ResponseEntity<AuthResponse> updateProduct(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) MultipartFile image,
            Authentication auth) {
        return ResponseEntity.ok(
                productService.updateProduct(
                        id, name, description, price,
                        stock, category, image, auth.getName()));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<AuthResponse> deleteProduct(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(
                productService.deleteProduct(id, auth.getName()));
    }

    @PutMapping(value = "/products/{id}/resubmit", consumes = "multipart/form-data")
    public ResponseEntity<AuthResponse> resubmitProduct(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) MultipartFile image,
            Authentication auth) {
        return ResponseEntity.ok(
                productService.resubmitProduct(
                        id, name, description, price,
                        stock, category, image, auth.getName()));
    }

    // Admin endpoints
    @GetMapping("/admin/products/pending")
    public ResponseEntity<AuthResponse> getPendingProducts(Authentication auth) {
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @GetMapping("/admin/products/all")
    public ResponseEntity<AuthResponse> getAllProductsAdmin(Authentication auth) {
        return ResponseEntity.ok(productService.getAllProductsAdmin());
    }

    @PutMapping("/admin/products/{id}/approve")
    public ResponseEntity<AuthResponse> approveProduct(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(
                productService.approveProduct(id, auth.getName()));
    }

    @PutMapping("/admin/products/{id}/reject")
    public ResponseEntity<AuthResponse> rejectProduct(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(
                productService.rejectProduct(
                        id, body.get("reason"), auth.getName()));
    }

    @PutMapping("/admin/products/{id}/deactivate")
    public ResponseEntity<AuthResponse> deactivateProduct(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(
                productService.deactivateProduct(id, reason, auth.getName()));
    }
}