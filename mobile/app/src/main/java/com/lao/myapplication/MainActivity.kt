package com.lao.myapplication

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.lao.myapplication.ui.login.LoginActivity
import com.lao.myapplication.utils.TokenManager

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // If already logged in, go straight to Dashboard
        if (TokenManager.getToken(this) != null) {
            startActivity(Intent(this,
                com.lao.myapplication.ui.dashboard.DashboardActivity::class.java))
        } else {
            startActivity(Intent(this, LoginActivity::class.java))
        }
        finish()
    }
}