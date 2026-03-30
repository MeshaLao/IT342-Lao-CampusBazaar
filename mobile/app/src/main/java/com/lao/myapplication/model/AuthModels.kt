package com.lao.myapplication.model

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val success: Boolean,
    val data: Any?,
    val timestamp: String?
)

data class UserData(
    val id: Long,
    val email: String,
    val fullName: String,
    val role: String,
    val accessToken: String
)