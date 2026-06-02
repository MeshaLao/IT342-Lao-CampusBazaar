package com.lao.myapplication.shared.model

// ── Request models ────────────────────────────────────────────────────────────

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String
)

// ── Response models ───────────────────────────────────────────────────────────

data class AuthResponse(
    val success: Boolean,
    val data: Any?,
    val error: ErrorData?,
    val timestamp: String?
)

data class ErrorData(
    val code: String?,
    val message: String?,
    val details: Any?
)

data class UserData(
    val id: Long?,
    val email: String?,
    val fullName: String?,
    val role: String?,
    val accessToken: String?,
    val refreshToken: String?
)

// ── Product models ────────────────────────────────────────────────────────────

data class ProductsResponse(
    val success: Boolean,
    val data: ProductsData?
)

data class ProductsData(
    val products: List<Product>?,
    val total: Int?
)

data class Product(
    val id: Long,
    val name: String,
    val description: String?,
    val price: Double,
    val stock: Int,
    val imageUrl: String?,
    val category: String?,
    val status: String?,
    val seller: SellerInfo?
)

data class SellerInfo(
    val id: Long?,
    val fullName: String?,
    val email: String?
)

// ── Order models ──────────────────────────────────────────────────────────────

data class OrdersResponse(
    val success: Boolean,
    val data: OrdersData?
)

data class OrdersData(
    val orders: List<Order>?,
    val total: Int?
)

data class Order(
    val orderId: Long,
    val orderNumber: String,
    val status: String,
    val paymentMethod: String,
    val totalAmount: Double,
    val createdAt: String?,
    val meetupLocation: String?,
    val meetupTime: String?,
    val qrCodeUrl: String?,
    val buyer: BuyerInfo?,
    val items: List<OrderItem>?
)

data class BuyerInfo(
    val id: Long?,
    val fullName: String?,
    val email: String?
)

data class OrderItem(
    val id: Long?,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double,
    val imageUrl: String?,
    val seller: SellerInfo?
)