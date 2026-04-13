package edu.cit.lao.campusbazaar.service;

import edu.cit.lao.campusbazaar.dto.AuthResponse;
import edu.cit.lao.campusbazaar.model.Product;
import edu.cit.lao.campusbazaar.model.User;
import edu.cit.lao.campusbazaar.repository.ProductRepository;
import edu.cit.lao.campusbazaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AuthResponse createProduct(String name, String description,
                                      BigDecimal price, Integer stock, String category,
                                      MultipartFile image, String sellerEmail) {

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stock(stock)
                .category(category)
                .imageUrl(imageUrl)
                .seller(seller)
                .status(Product.ProductStatus.PENDING_APPROVAL)
                .isActive(false)
                .createdAt(LocalDateTime.now())
                .build();

        productRepository.save(product);

        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", product.getId());
        productMap.put("name", product.getName());
        productMap.put("price", product.getPrice());
        productMap.put("stock", product.getStock());
        productMap.put("imageUrl", product.getImageUrl() != null ? product.getImageUrl() : "");
        productMap.put("category", product.getCategory() != null ? product.getCategory() : "");
        productMap.put("status", product.getStatus().name());

        Map<String, Object> response = new HashMap<>();
        response.put("product", productMap);

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getAllProducts(String search) {
        List<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productRepository
                    .findByStatusAndNameContainingIgnoreCase(
                            Product.ProductStatus.ACTIVE, search);
        } else {
            products = productRepository
                    .findByStatus(Product.ProductStatus.ACTIVE);
        }

        List<Map<String, Object>> productList = products.stream()
                .map(this::mapProduct)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("products", productList);

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("product", mapProductDetail(product));

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getMyProducts(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> productList = productRepository
                .findBySeller(seller)
                .stream()
                .map(this::mapProduct)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("products", productList);

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getAllProductsAdmin() {
        List<Product> products = productRepository.findAllWithSeller();

        List<Map<String, Object>> productList = products.stream()
                .map(this::mapProductWithSeller)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("products", productList);
        response.put("total", productList.size());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getPendingProducts() {
        List<Product> products = productRepository
                .findByStatus(Product.ProductStatus.PENDING_APPROVAL);

        List<Map<String, Object>> productList = products.stream()
                .map(this::mapProductWithSeller)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("products", productList);
        response.put("total", productList.size());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse approveProduct(Long id, String adminEmail) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(Product.ProductStatus.ACTIVE);
        product.setIsActive(true);
        productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("id", product.getId());
        response.put("status", "ACTIVE");
        response.put("reviewedAt", LocalDateTime.now().toString());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse rejectProduct(Long id, String reason, String adminEmail) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(Product.ProductStatus.REJECTED);
        product.setIsActive(false);
        productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("id", product.getId());
        response.put("status", "REJECTED");
        response.put("reason", reason);
        response.put("reviewedAt", LocalDateTime.now().toString());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse deactivateProduct(Long id, String reason, String adminEmail) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(Product.ProductStatus.DEACTIVATED);
        product.setIsActive(false);
        productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("id", product.getId());
        response.put("status", "DEACTIVATED");

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse updateProduct(Long id, String name, String description,
                                      BigDecimal price, Integer stock, String category,
                                      MultipartFile image, String sellerEmail) {

        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);
        if (price != null) product.setPrice(price);
        if (stock != null) product.setStock(stock);
        if (category != null) product.setCategory(category);
        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveImage(image));
        }

        productRepository.save(product);

        return AuthResponse.builder()
                .success(true)
                .data(mapProduct(product))
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse resubmitProduct(Long id, String name, String description,
                                        BigDecimal price, Integer stock, String category,
                                        MultipartFile image, String sellerEmail) {

        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        if (product.getStatus() != Product.ProductStatus.REJECTED) {
            throw new RuntimeException("Only rejected products can be resubmitted");
        }

        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);
        if (price != null) product.setPrice(price);
        if (stock != null) product.setStock(stock);
        if (category != null) product.setCategory(category);
        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveImage(image));
        }

        product.setStatus(Product.ProductStatus.PENDING_APPROVAL);
        productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("id", product.getId());
        response.put("status", "PENDING_APPROVAL");
        response.put("updatedAt", LocalDateTime.now().toString());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse deleteProduct(Long id, String sellerEmail) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        productRepository.delete(product);

        return AuthResponse.builder()
                .success(true)
                .data(null)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    private String saveImage(MultipartFile image) {
        try {
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path path = Paths.get(uploadDir + filename);
            Files.write(path, image.getBytes());
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image");
        }
    }

    private Map<String, Object> mapProduct(Product p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "");
        map.put("category", p.getCategory() != null ? p.getCategory() : "");
        map.put("status", p.getStatus().name());
        map.put("description", p.getDescription() != null ? p.getDescription() : "");
        map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
        return map;
    }

    private Map<String, Object> mapProductWithSeller(Product p) {
        Map<String, Object> sellerMap = new HashMap<>();
        try {
            sellerMap.put("id", p.getSeller().getId());
            String fullName = p.getSeller().getFullName();
            if (fullName == null || fullName.isBlank()) {
                fullName = p.getSeller().getFirstName() + " " + p.getSeller().getLastName();
            }
            sellerMap.put("fullName", fullName);
        } catch (Exception e) {
            sellerMap.put("id", 0);
            sellerMap.put("fullName", "Unknown");
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "");
        map.put("category", p.getCategory() != null ? p.getCategory() : "");
        map.put("status", p.getStatus().name());
        map.put("description", p.getDescription() != null ? p.getDescription() : "");
        map.put("seller", sellerMap);
        map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
        return map;
    }

    private Map<String, Object> mapProductDetail(Product p) {
        Map<String, Object> sellerMap = new HashMap<>();
        try {
            sellerMap.put("id", p.getSeller().getId());
            String fullName = p.getSeller().getFullName();
            if (fullName == null || fullName.isBlank()) {
                fullName = p.getSeller().getFirstName() + " " + p.getSeller().getLastName();
            }
            sellerMap.put("fullName", fullName);
        } catch (Exception e) {
            sellerMap.put("id", 0);
            sellerMap.put("fullName", "Unknown");
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription() != null ? p.getDescription() : "");
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "");
        map.put("category", p.getCategory() != null ? p.getCategory() : "");
        map.put("status", p.getStatus().name());
        map.put("seller", sellerMap);
        map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
        return map;
    }
}