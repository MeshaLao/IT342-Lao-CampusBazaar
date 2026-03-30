package com.lao.myapplication.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import android.widget.EditText
import com.google.gson.Gson
import com.lao.myapplication.R
import com.lao.myapplication.api.RetrofitClient
import com.lao.myapplication.model.LoginRequest
import com.lao.myapplication.model.UserData
import com.lao.myapplication.ui.dashboard.DashboardActivity
import com.lao.myapplication.ui.register.RegisterActivity
import com.lao.myapplication.utils.TokenManager
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

        // Bind views
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvError = findViewById(R.id.tvError)
        tvRegisterLink = findViewById(R.id.tvRegisterLink)
        progressBar = findViewById(R.id.progressBar)

        // Go to Register
        tvRegisterLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }

        // Login button
        btnLogin.setOnClickListener {
            handleLogin()
        }
    }

    private fun handleLogin() {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()

        // Validate inputs
        if (email.isEmpty()) {
            showError("Email is required")
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showError("Invalid email format")
            return
        }
        if (password.isEmpty()) {
            showError("Password is required")
            return
        }

        // Show loading
        btnLogin.isEnabled = false
        btnLogin.text = "OPENING..."
        progressBar.visibility = View.VISIBLE
        hideError()

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.login(
                    LoginRequest(email, password)
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    // Parse token from response
                    val gson = Gson()
                    val dataJson = gson.toJson(response.body()?.data)
                    val userData = gson.fromJson(dataJson, UserData::class.java)

                    // Save token
                    TokenManager.saveToken(this@LoginActivity, userData.accessToken)

                    // Go to Dashboard with user info
                    val intent = Intent(this@LoginActivity, DashboardActivity::class.java)
                    intent.putExtra("email", userData.email)
                    intent.putExtra("role", userData.role)
                    startActivity(intent)
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