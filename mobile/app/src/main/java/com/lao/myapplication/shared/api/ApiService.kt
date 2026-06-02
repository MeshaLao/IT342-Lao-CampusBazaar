package com.lao.myapplication.shared.api

import com.lao.myapplication.shared.model.AuthResponse
import com.lao.myapplication.shared.model.LoginRequest
import com.lao.myapplication.shared.model.OrdersResponse
import com.lao.myapplication.shared.model.ProductsResponse
import com.lao.myapplication.shared.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────────────
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    // ── Products ──────────────────────────────────────────────────────────────
    @GET("products")
    suspend fun getProducts(
        @Header("Authorization") token: String,
        @Query("search") search: String? = null,
        @Query("category") category: String? = null
    ): Response<ProductsResponse>

    @GET("products/my")
    suspend fun getMyProducts(
        @Header("Authorization") token: String
    ): Response<ProductsResponse>

    // ── Orders ────────────────────────────────────────────────────────────────
    @GET("orders/my")
    suspend fun getMyOrders(
        @Header("Authorization") token: String
    ): Response<OrdersResponse>

    @GET("orders/seller")
    suspend fun getSellerOrders(
        @Header("Authorization") token: String
    ): Response<OrdersResponse>

    // ── Admin ─────────────────────────────────────────────────────────────────
    @GET("admin/orders")
    suspend fun getAdminOrders(
        @Header("Authorization") token: String,
        @Query("status") status: String = "ALL"
    ): Response<OrdersResponse>

    @GET("admin/stats")
    suspend fun getAdminStats(
        @Header("Authorization") token: String
    ): Response<AuthResponse>
}