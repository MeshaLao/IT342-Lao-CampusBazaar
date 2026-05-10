package edu.cit.lao.campusbazaar.feature.product;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import edu.cit.lao.campusbazaar.feature.product.model.Product;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.feature.product.model.ProductImage;
import edu.cit.lao.campusbazaar.shared.config.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductImageRepository productImageRepository;    // ─── CREATE ────────────────────────────────────────────────────────────
    public AuthResponse createProduct(String name, String description,
                                      BigDecimal price, Integer stock, String category,
                                      List<MultipartFile> images, String sellerEmail) {

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stock(stock)
                .category(category)
                .seller(seller)
                .status(Product.ProductStatus.PENDING_APPROVAL)
                .isActive(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Set first image as main imageUrl for backward compatibility
        if (images != null && !images.isEmpty()) {
            String firstUrl = cloudinaryService.uploadImage(images.get(0));
            product.setImageUrl(firstUrl);
        }

        productRepository.save(product);

        // Save all images to product_images table
        if (images != null) {
            for (int i = 0; i < images.size(); i++) {
                String url = i == 0
                        ? product.getImageUrl()
                        : cloudinaryService.uploadImage(images.get(i));

                ProductImage pi = ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .displayOrder(i)
                        .build();
                productImageRepository.save(pi);
            }
        }

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

    // ─── GET ALL (public - ACTIVE only) ────────────────────────────────────
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

    // ─── GET BY ID ─────────────────────────────────────────────────────────
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

    // ─── GET MY PRODUCTS (seller) ───────────────────────────────────────────
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

    // ─── GET ALL (admin) ───────────────────────────────────────────────────
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

    // ─── GET PENDING (admin) ───────────────────────────────────────────────
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

    // ─── APPROVE (admin) ───────────────────────────────────────────────────
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

    // ─── REJECT (admin) ────────────────────────────────────────────────────
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

    // ─── DEACTIVATE (admin) ────────────────────────────────────────────────
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

    // ─── UPDATE ────────────────────────────────────────────────────────────
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
            // Delete old image from Cloudinary if exists
            if (product.getImageUrl() != null) {
                cloudinaryService.deleteImage(product.getImageUrl());
            }
            product.setImageUrl(cloudinaryService.uploadImage(image));
        }

        productRepository.save(product);

        return AuthResponse.builder()
                .success(true)
                .data(mapProduct(product))
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    // ─── RESUBMIT ──────────────────────────────────────────────────────────
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
            if (product.getImageUrl() != null) {
                cloudinaryService.deleteImage(product.getImageUrl());
            }
            product.setImageUrl(cloudinaryService.uploadImage(image));
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

    // ─── DELETE ────────────────────────────────────────────────────────────
    public AuthResponse deleteProduct(Long id, String sellerEmail) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        // Delete image from Cloudinary
        if (product.getImageUrl() != null) {
            cloudinaryService.deleteImage(product.getImageUrl());
        }

        productRepository.delete(product);

        return AuthResponse.builder()
                .success(true)
                .data(null)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    // ─── PRIVATE MAPPERS ───────────────────────────────────────────────────
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
                fullName = p.getSeller().getFirstName() + " "
                        + p.getSeller().getLastName();
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
                fullName = p.getSeller().getFirstName() + " "
                        + p.getSeller().getLastName();
            }
            sellerMap.put("fullName", fullName);
            sellerMap.put("email", p.getSeller().getEmail());
        } catch (Exception e) {
            sellerMap.put("id", 0);
            sellerMap.put("fullName", "Unknown");
        }

        // Get all images from product_images table
        List<String> imageUrls = productImageRepository
                .findByProductIdOrderByDisplayOrderAsc(p.getId())
                .stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());

        // Fallback to single imageUrl if no images in table
        if (imageUrls.isEmpty() && p.getImageUrl() != null
                && !p.getImageUrl().isBlank()) {
            imageUrls.add(p.getImageUrl());
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription() != null ? p.getDescription() : "");
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "");
        map.put("imageUrls", imageUrls);
        map.put("category", p.getCategory() != null ? p.getCategory() : "");
        map.put("status", p.getStatus().name());
        map.put("seller", sellerMap);
        map.put("createdAt", p.getCreatedAt() != null
                ? p.getCreatedAt().toString() : "");
        return map;
    }
}