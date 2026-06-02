package com.lao.myapplication.feature.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.lao.myapplication.R
import com.lao.myapplication.feature.dashboard.DashboardActivity
import com.lao.myapplication.shared.api.RetrofitClient
import com.lao.myapplication.shared.model.LoginRequest
import com.lao.myapplication.shared.model.UserData
import com.lao.myapplication.shared.utils.TokenManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvError: TextView
    private lateinit var tvRegisterLink: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvError = findViewById(R.id.tvError)
        tvRegisterLink = findViewById(R.id.tvRegisterLink)
        progressBar = findViewById(R.id.progressBar)

        tvRegisterLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }

        btnLogin.setOnClickListener { handleLogin() }
    }

    private fun handleLogin() {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()

        if (email.isEmpty()) { showError("Email is required"); return }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showError("Invalid email format"); return
        }
        if (password.isEmpty()) { showError("Password is required"); return }

        btnLogin.isEnabled = false
        btnLogin.text = "OPENING..."
        progressBar.visibility = View.VISIBLE
        hideError()

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.login(LoginRequest(email, password))

                if (response.isSuccessful && response.body()?.success == true) {
                    val gson = Gson()
                    val dataJson = gson.toJson(response.body()?.data)
                    val userData = gson.fromJson(dataJson, UserData::class.java)

                    TokenManager.saveToken(this@LoginActivity, userData.accessToken ?: "")
                    TokenManager.saveUserInfo(
                        this@LoginActivity,
                        userData.email ?: "",
                        userData.role ?: "STUDENT",
                        userData.fullName ?: ""
                    )

                    startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    showError("Invalid email or password")
                }
            } catch (e: Exception) {
                showError("Cannot connect to server. Make sure backend is running.")
            } finally {
                btnLogin.isEnabled = true
                btnLogin.text = "OPEN GATES"
                progressBar.visibility = View.GONE
            }
        }
    }

    private fun showError(message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun hideError() {
        tvError.visibility = View.GONE
    }
}