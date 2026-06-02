package com.lao.myapplication.feature.orders

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.lao.myapplication.R
import com.lao.myapplication.feature.auth.LoginActivity
import com.lao.myapplication.feature.marketplace.MarketplaceActivity
import com.lao.myapplication.shared.api.RetrofitClient
import com.lao.myapplication.shared.model.Order
import com.lao.myapplication.shared.utils.TokenManager
import kotlinx.coroutines.launch

class MyOrdersActivity : AppCompatActivity() {

    private lateinit var rvOrders: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var tvError: TextView
    private lateinit var tvTitle: TextView

    // Navbar
    private lateinit var navBrowse: TextView
    private lateinit var navOrders: TextView
    private lateinit var navLogout: TextView
    private lateinit var navUserInitial: TextView

    private val orders = mutableListOf<Order>()
    private lateinit var adapter: OrderAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_my_orders)

        rvOrders = findViewById(R.id.rvOrders)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmpty)
        tvError = findViewById(R.id.tvError)
        tvTitle = findViewById(R.id.tvTitle)

        navBrowse = findViewById(R.id.navBrowse)
        navOrders = findViewById(R.id.navOrders)
        navLogout = findViewById(R.id.navLogout)
        navUserInitial = findViewById(R.id.navUserInitial)

        val name = TokenManager.getName(this)
        val role = TokenManager.getRole(this)

        navUserInitial.text = if (name.isNotEmpty()) name.first().uppercaseChar().toString() else "U"
        tvTitle.text = if (role == "ADMIN") "All Orders" else "My Orders"

        adapter = OrderAdapter(orders)
        rvOrders.layoutManager = LinearLayoutManager(this)
        rvOrders.adapter = adapter

        navBrowse.setOnClickListener { startActivity(Intent(this, MarketplaceActivity::class.java)) }
        navLogout.setOnClickListener {
            TokenManager.clearToken(this)
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        loadOrders(role)
    }

    private fun loadOrders(role: String) {
        progressBar.visibility = View.VISIBLE
        tvEmpty.visibility = View.GONE
        tvError.visibility = View.GONE

        val token = "Bearer ${TokenManager.getToken(this)}"

        lifecycleScope.launch {
            try {
                val response = when (role) {
                    "ADMIN" -> RetrofitClient.instance.getAdminOrders(token)
                    else -> RetrofitClient.instance.getMyOrders(token)
                }
                if (response.isSuccessful && response.body()?.success == true) {
                    val newOrders = response.body()?.data?.orders ?: emptyList()
                    orders.clear()
                    orders.addAll(newOrders)
                    adapter.notifyDataSetChanged()
                    if (orders.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                    }
                } else {
                    tvError.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                tvError.visibility = View.VISIBLE
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
}