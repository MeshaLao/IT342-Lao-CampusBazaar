package com.lao.myapplication.ui.register

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
import com.lao.myapplication.model.RegisterRequest
import com.lao.myapplication.model.UserData
import com.lao.myapplication.ui.dashboard.DashboardActivity
import com.lao.myapplication.ui.login.LoginActivity
import com.lao.myapplication.utils.TokenManager
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var tvError: TextView
    private lateinit var tvLoginLink: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Bind views
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnRegister = findViewById(R.id.btnRegister)
        tvError = findViewById(R.id.tvError)
        tvLoginLink = findViewById(R.id.tvLoginLink)
        progressBar = findViewById(R.id.progressBar)

        // Go to Login
        tvLoginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // Register button
        btnRegister.setOnClickListener {
            handleRegister()
        }
    }

    private fun handleRegister() {
        val firstName = etFirstName.text.toString().trim()
        val lastName = etLastName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()

        // Validate inputs
        if (firstName.isEmpty()) {
            showError("First name is required")
            return
        }
        if (lastName.isEmpty()) {
            showError("Last name is required")
            return
        }
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
        if (password.length < 8) {
            showError("Password must be at least 8 characters")
            return
        }
        if (password != confirmPassword) {
            showError("Passwords do not match")
            return
        }

        // Show loading
        btnRegister.isEnabled = false
        btnRegister.text = "JOINING..."
        progressBar.visibility = View.VISIBLE
        hideError()

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.register(
                    RegisterRequest(firstName, lastName, email, password)
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    // Parse token from response
                    val gson = Gson()
                    val dataJson = gson.toJson(response.body()?.data)
                    val userData = gson.fromJson(dataJson, UserData::class.java)

                    // Save token
                    TokenManager.saveToken(this@RegisterActivity, userData.accessToken)

                    // Go to Dashboard with user info
                    val intent = Intent(this@RegisterActivity, DashboardActivity::class.java)
                    intent.putExtra("email", userData.email)
                    intent.putExtra("role", userData.role)
                    startActivity(intent)
                    finish()

                } else {
                    val errorMsg = response.body()?.data?.toString() ?: "Registration failed"
                    showError(errorMsg)
                }

            } catch (e: Exception) {
                showError("Cannot connect to server. Make sure backend is running.")
            } finally {
                btnRegister.isEnabled = true
                btnRegister.text = "START JOURNEY"
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