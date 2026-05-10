package com.lao.myapplication

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.lao.myapplication.feature.auth.LoginActivity
import com.lao.myapplication.feature.dashboard.DashboardActivity
import com.lao.myapplication.shared.shared.utils.TokenManager

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // If already logged in, go straight to Dashboard
        if (TokenManager.getToken(this) != null) {
            startActivity(Intent(this,
                DashboardActivity::class.java))
        } else {
            startActivity(Intent(this, LoginActivity::class.java))
        }
        finish()
    }
}