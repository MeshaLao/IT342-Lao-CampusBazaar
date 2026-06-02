package com.lao.myapplication.feature.dashboard

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.lao.myapplication.R
import com.lao.myapplication.feature.auth.LoginActivity
import com.lao.myapplication.feature.marketplace.MarketplaceActivity
import com.lao.myapplication.feature.orders.MyOrdersActivity
import com.lao.myapplication.shared.api.RetrofitClient
import com.lao.myapplication.shared.model.Order
import com.lao.myapplication.shared.model.Product
import com.lao.myapplication.shared.utils.TokenManager
import com.lao.myapplication.feature.orders.OrderAdapter
import kotlinx.coroutines.launch

class DashboardActivity : AppCompatActivity() {

    // Tabs
    private lateinit var tabListings: TextView
    private lateinit var tabRejected: TextView
    private lateinit var tabOrders: TextView
    private lateinit var tabAdminStats: TextView

    // Content panels
    private lateinit var contentListings: LinearLayout
    private lateinit var contentRejected: LinearLayout
    private lateinit var contentOrders: LinearLayout
    private lateinit var contentAdminStats: androidx.core.widget.NestedScrollView

    // Listings
    private lateinit var rvListings: RecyclerView
    private lateinit var tvListingsEmpty: TextView
    private lateinit var btnNewListing: Button

    // Rejected
    private lateinit var rvRejected: RecyclerView
    private lateinit var tvRejectedEmpty: TextView

    // Orders
    private lateinit var rvOrders: RecyclerView
    private lateinit var tvOrdersEmpty: TextView

    // Admin stats
    private lateinit var tvTotalOrders: TextView
    private lateinit var tvTotalUsers: TextView
    private lateinit var tvTotalProducts: TextView

    // Navbar
    private lateinit var navBrowse: TextView
    private lateinit var navOrders: TextView
    private lateinit var navLogout: TextView
    private lateinit var navUserInitial: TextView

    private lateinit var progressBar: ProgressBar

    private val listings = mutableListOf<Product>()
    private val rejected = mutableListOf<Product>()
    private val orders = mutableListOf<Order>()

    private lateinit var listingsAdapter: ListingAdapter
    private lateinit var rejectedAdapter: ListingAdapter
    private lateinit var ordersAdapter: OrderAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Tabs
        tabListings = findViewById(R.id.tabListings)
        tabRejected = findViewById(R.id.tabRejected)
        tabOrders = findViewById(R.id.tabOrders)
        tabAdminStats = findViewById(R.id.tabAdminStats)

        // Content
        contentListings = findViewById(R.id.contentListings)
        contentRejected = findViewById(R.id.contentRejected)
        contentOrders = findViewById(R.id.contentOrders)
        contentAdminStats = findViewById(R.id.contentAdminStats)

        // Listings
        rvListings = findViewById(R.id.rvListings)
        tvListingsEmpty = findViewById(R.id.tvListingsEmpty)
        btnNewListing = findViewById(R.id.btnNewListing)

        // Rejected
        rvRejected = findViewById(R.id.rvRejected)
        tvRejectedEmpty = findViewById(R.id.tvRejectedEmpty)

        // Orders
        rvOrders = findViewById(R.id.rvOrders)
        tvOrdersEmpty = findViewById(R.id.tvOrdersEmpty)

        // Stats
        tvTotalOrders = findViewById(R.id.tvTotalOrders)
        tvTotalUsers = findViewById(R.id.tvTotalUsers)
        tvTotalProducts = findViewById(R.id.tvTotalProducts)

        progressBar = findViewById(R.id.progressBar)

        // Navbar
        navBrowse = findViewById(R.id.navBrowse)
        navOrders = findViewById(R.id.navOrders)
        navLogout = findViewById(R.id.navLogout)
        navUserInitial = findViewById(R.id.navUserInitial)

        val name = TokenManager.getName(this)
        val role = TokenManager.getRole(this)
        navUserInitial.text = if (name.isNotEmpty()) name.first().uppercaseChar().toString() else "U"

        // Setup adapters
        listingsAdapter = ListingAdapter(listings)
        rejectedAdapter = ListingAdapter(rejected)
        ordersAdapter = OrderAdapter(orders)

        rvListings.layoutManager = LinearLayoutManager(this)
        rvListings.adapter = listingsAdapter

        rvRejected.layoutManager = LinearLayoutManager(this)
        rvRejected.adapter = rejectedAdapter

        rvOrders.layoutManager = LinearLayoutManager(this)
        rvOrders.adapter = ordersAdapter

        // Role-based tabs
        if (role == "ADMIN") {
            tabAdminStats.visibility = View.VISIBLE
            tabListings.text = "All Orders"
            tabRejected.visibility = View.GONE
            tabOrders.visibility = View.GONE
            showTab("admin")
            loadAdminStats()
        } else {
            tabAdminStats.visibility = View.GONE
            showTab("listings")
            loadMyListings()
        }

        // Tab clicks
        tabListings.setOnClickListener {
            if (role == "ADMIN") showTab("admin")
            else { showTab("listings"); loadMyListings() }
        }
        tabRejected.setOnClickListener { showTab("rejected"); loadMyListings() }
        tabOrders.setOnClickListener { showTab("orders"); loadSellerOrders() }
        tabAdminStats.setOnClickListener { showTab("admin"); loadAdminStats() }

        btnNewListing.setOnClickListener {
            Toast.makeText(this, "Open sell screen on web to create listings", Toast.LENGTH_SHORT).show()
        }

        // Navbar
        navBrowse.setOnClickListener { startActivity(Intent(this, MarketplaceActivity::class.java)) }
        navOrders.setOnClickListener { startActivity(Intent(this, MyOrdersActivity::class.java)) }
        navLogout.setOnClickListener {
            TokenManager.clearToken(this)
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun showTab(tab: String) {
        contentListings.visibility = if (tab == "listings") View.VISIBLE else View.GONE
        contentRejected.visibility = if (tab == "rejected") View.VISIBLE else View.GONE
        contentOrders.visibility = if (tab == "orders") View.VISIBLE else View.GONE
        contentAdminStats.visibility = if (tab == "admin") View.VISIBLE else View.GONE

        // Highlight active tab
        val activeColor = "#1D5D5D"
        val inactiveColor = "#E8E4C9"
        tabListings.setBackgroundColor(android.graphics.Color.parseColor(
            if (tab == "listings" || tab == "admin") activeColor else inactiveColor))
        tabListings.setTextColor(android.graphics.Color.parseColor(
            if (tab == "listings" || tab == "admin") "#E8E4C9" else "#421C3B"))
        tabOrders.setBackgroundColor(android.graphics.Color.parseColor(
            if (tab == "orders") activeColor else inactiveColor))
        tabOrders.setTextColor(android.graphics.Color.parseColor(
            if (tab == "orders") "#E8E4C9" else "#421C3B"))
        tabAdminStats.setBackgroundColor(android.graphics.Color.parseColor(
            if (tab == "admin") activeColor else inactiveColor))
        tabAdminStats.setTextColor(android.graphics.Color.parseColor(
            if (tab == "admin") "#E8E4C9" else "#421C3B"))
    }

    private fun loadMyListings() {
        val token = "Bearer ${TokenManager.getToken(this)}"
        lifecycleScope.launch {
            try {
                val res = RetrofitClient.instance.getMyProducts(token)
                if (res.isSuccessful && res.body()?.success == true) {
                    val all = res.body()?.data?.products ?: emptyList()
                    listings.clear()
                    listings.addAll(all.filter { it.status != "REJECTED" })
                    rejected.clear()
                    rejected.addAll(all.filter { it.status == "REJECTED" })
                    listingsAdapter.notifyDataSetChanged()
                    rejectedAdapter.notifyDataSetChanged()
                    tvListingsEmpty.visibility = if (listings.isEmpty()) View.VISIBLE else View.GONE
                    tvRejectedEmpty.visibility = if (rejected.isEmpty()) View.VISIBLE else View.GONE
                }
            } catch (e: Exception) { /* ignore */ }
        }
    }

    private fun loadSellerOrders() {
        val token = "Bearer ${TokenManager.getToken(this)}"
        lifecycleScope.launch {
            try {
                val res = RetrofitClient.instance.getSellerOrders(token)
                if (res.isSuccessful && res.body()?.success == true) {
                    val newOrders = res.body()?.data?.orders ?: emptyList()
                    orders.clear()
                    orders.addAll(newOrders)
                    ordersAdapter.notifyDataSetChanged()
                    tvOrdersEmpty.visibility = if (orders.isEmpty()) View.VISIBLE else View.GONE
                }
            } catch (e: Exception) { /* ignore */ }
        }
    }

    private fun loadAdminStats() {
        progressBar.visibility = View.VISIBLE
        val token = "Bearer ${TokenManager.getToken(this)}"
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getAdminStats(token)
                if (response.isSuccessful && response.body()?.success == true) {
                    val gson = Gson()
                    val dataJson = gson.toJson(response.body()?.data)
                    val data = gson.fromJson(dataJson, Map::class.java)
                    tvTotalOrders.text = data["totalOrders"]?.toString()?.toBigDecimal()?.toInt()?.toString() ?: "0"
                    tvTotalUsers.text = data["totalUsers"]?.toString()?.toBigDecimal()?.toInt()?.toString() ?: "0"
                    tvTotalProducts.text = data["totalProducts"]?.toString()?.toBigDecimal()?.toInt()?.toString() ?: "0"
                }
            } catch (e: Exception) { /* ignore */ }
            finally { progressBar.visibility = View.GONE }
        }
    }
}