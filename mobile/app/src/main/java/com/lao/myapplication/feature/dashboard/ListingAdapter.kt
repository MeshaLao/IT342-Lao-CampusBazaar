package com.lao.myapplication.feature.dashboard

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.lao.myapplication.R
import com.lao.myapplication.shared.model.Product

class ListingAdapter(private val products: List<Product>) :
    RecyclerView.Adapter<ListingAdapter.ListingViewHolder>() {

    inner class ListingViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivImage: ImageView = view.findViewById(R.id.ivProduct)
        val tvName: TextView = view.findViewById(R.id.tvProductName)
        val tvPrice: TextView = view.findViewById(R.id.tvProductPrice)
        val tvSeller: TextView = view.findViewById(R.id.tvSeller)
        val tvStock: TextView = view.findViewById(R.id.tvStock)
        val tvCategory: TextView = view.findViewById(R.id.tvCategory)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ListingViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_listing, parent, false)
        return ListingViewHolder(view)
    }

    override fun onBindViewHolder(holder: ListingViewHolder, position: Int) {
        val p = products[position]
        holder.tvName.text = p.name
        holder.tvPrice.text = "₱${String.format("%.2f", p.price)}"
        holder.tvSeller.text = p.status ?: "PENDING"
        holder.tvStock.text = "Stock: ${p.stock}"
        holder.tvCategory.text = p.category ?: "General"

        val statusColor = when (p.status) {
            "ACTIVE" -> 0xFF6F803C.toInt()
            "PENDING_APPROVAL" -> 0xFFB28E3A.toInt()
            "REJECTED" -> 0xFFA3464D.toInt()
            else -> 0xFF6b7280.toInt()
        }
        holder.tvSeller.setTextColor(statusColor)

        if (!p.imageUrl.isNullOrEmpty()) {
            holder.ivImage.visibility = View.VISIBLE
            Glide.with(holder.itemView.context).load(p.imageUrl).centerCrop().into(holder.ivImage)
        } else {
            holder.ivImage.visibility = View.GONE
        }
    }

    override fun getItemCount() = products.size
}