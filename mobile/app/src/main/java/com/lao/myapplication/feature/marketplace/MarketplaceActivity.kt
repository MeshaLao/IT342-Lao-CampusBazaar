package com.lao.myapplication.feature.marketplace

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.lao.myapplication.R
import com.lao.myapplication.feature.auth.LoginActivity
import com.lao.myapplication.feature.orders.MyOrdersActivity
import com.lao.myapplication.shared.api.RetrofitClient
import com.lao.myapplication.shared.model.Product
import com.lao.myapplication.shared.utils.TokenManager
import kotlinx.coroutines.launch

class MarketplaceActivity : AppCompatActivity() {

    private lateinit var rvProducts: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var tvError: TextView
    private lateinit var etSearch: EditText
    private lateinit var btnSearch: Button

    // Navbar
    private lateinit var navBrowse: TextView
    private lateinit var navOrders: TextView
    private lateinit var navLogout: TextView
    private lateinit var navUserInitial: TextView

    private val products = mutableListOf<Product>()
    private lateinit var adapter: ProductAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_marketplace)

        rvProducts = findViewById(R.id.rvProducts)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmpty)
        tvError = findViewById(R.id.tvError)
        etSearch = findViewById(R.id.etSearch)
        btnSearch = findViewById(R.id.btnSearch)

        navBrowse = findViewById(R.id.navBrowse)
        navOrders = findViewById(R.id.navOrders)
        navLogout = findViewById(R.id.navLogout)
        navUserInitial = findViewById(R.id.navUserInitial)

        val name = TokenManager.getName(this)
        navUserInitial.text = if (name.isNotEmpty()) name.first().uppercaseChar().toString() else "U"

        adapter = ProductAdapter(products)
        rvProducts.layoutManager = GridLayoutManager(this, 2)
        rvProducts.adapter = adapter

        btnSearch.setOnClickListener { loadProducts(etSearch.text.toString().trim()) }
        navOrders.setOnClickListener { startActivity(Intent(this, MyOrdersActivity::class.java)) }
        navLogout.setOnClickListener {
            TokenManager.clearToken(this)
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
        navBrowse.setOnClickListener { loadProducts() }

        loadProducts()
    }

    private fun loadProducts(search: String? = null) {
        progressBar.visibility = View.VISIBLE
        tvEmpty.visibility = View.GONE
        tvError.visibility = View.GONE

        val token = "Bearer ${TokenManager.getToken(this)}"

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getProducts(token, search)
                if (response.isSuccessful && response.body()?.success == true) {
                    val newProducts = response.body()?.data?.products ?: emptyList()
                    products.clear()
                    products.addAll(newProducts)
                    adapter.notifyDataSetChanged()
                    if (products.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        tvEmpty.text = if (search.isNullOrEmpty())
                            "No products available yet." else "No results for \"$search\"."
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