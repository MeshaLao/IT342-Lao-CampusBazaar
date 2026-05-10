package com.lao.myapplication.shared.file.api

import com.lao.myapplication.shared.file.model.AuthResponse
import com.lao.myapplication.shared.file.model.LoginRequest
import com.lao.myapplication.shared.file.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}