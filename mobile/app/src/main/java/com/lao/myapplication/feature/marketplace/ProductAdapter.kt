package com.lao.myapplication.feature.marketplace

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.lao.myapplication.R
import com.lao.myapplication.shared.model.Product
import com.bumptech.glide.Glide

class ProductAdapter(private val products: List<Product>) :
    RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

    inner class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivProduct: ImageView = view.findViewById(R.id.ivProduct)
        val tvName: TextView = view.findViewById(R.id.tvProductName)
        val tvPrice: TextView = view.findViewById(R.id.tvProductPrice)
        val tvSeller: TextView = view.findViewById(R.id.tvSeller)
        val tvStock: TextView = view.findViewById(R.id.tvStock)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_product, parent, false)
        return ProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        val product = products[position]
        holder.tvName.text = product.name
        holder.tvPrice.text = "₱${String.format("%.2f", product.price)}"
        holder.tvSeller.text = product.seller?.fullName ?: "Unknown seller"
        holder.tvStock.text = "${product.stock} left"

        if (!product.imageUrl.isNullOrEmpty()) {
            Glide.with(holder.itemView.context)
                .load(product.imageUrl)
                .placeholder(R.drawable.ic_product_placeholder)
                .into(holder.ivProduct)
        } else {
            holder.ivProduct.setImageResource(R.drawable.ic_product_placeholder)
        }
    }

    override fun getItemCount() = products.size
}