package com.lao.myapplication.ui.dashboard

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.lao.myapplication.R
import com.lao.myapplication.ui.login.LoginActivity
import com.lao.myapplication.utils.TokenManager

class DashboardActivity : AppCompatActivity() {

    private lateinit var btnLogout: Button
    private lateinit var tvEmail: TextView
    private lateinit var tvRole: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        btnLogout = findViewById(R.id.btnLogout)
        tvEmail = findViewById(R.id.tvEmail)
        tvRole = findViewById(R.id.tvRole)

        // Show info passed from Login/Register
        val email = intent.getStringExtra("email") ?: "—"
        val role = intent.getStringExtra("role") ?: "STUDENT"

        tvEmail.text = email
        tvRole.text = role

        btnLogout.setOnClickListener {
            TokenManager.clearToken(this)
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}