package com.lao.myapplication.feature.orders

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.lao.myapplication.R
import com.lao.myapplication.shared.model.Order

class OrderAdapter(private val orders: List<Order>) :
    RecyclerView.Adapter<OrderAdapter.OrderViewHolder>() {

    inner class OrderViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvOrderNumber: TextView = view.findViewById(R.id.tvOrderNumber)
        val tvStatus: TextView = view.findViewById(R.id.tvStatus)
        val tvPayment: TextView = view.findViewById(R.id.tvPayment)
        val tvTotal: TextView = view.findViewById(R.id.tvTotal)
        val tvItems: TextView = view.findViewById(R.id.tvItems)
        val tvMeetup: TextView = view.findViewById(R.id.tvMeetup)
        val layoutMeetup: LinearLayout = view.findViewById(R.id.layoutMeetup)
        val layoutQr: LinearLayout = view.findViewById(R.id.layoutQr)
        val ivQr: ImageView = view.findViewById(R.id.ivQr)
        val tvDate: TextView = view.findViewById(R.id.tvDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_order, parent, false)
        return OrderViewHolder(view)
    }

    override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
        val order = orders[position]

        holder.tvOrderNumber.text = order.orderNumber
        holder.tvTotal.text = "₱${String.format("%.2f", order.totalAmount)}"
        holder.tvPayment.text = if (order.paymentMethod == "MEETUP")
            "Campus Meet-up (Cash)" else "Online Payment"
        holder.tvDate.text = order.createdAt?.take(10) ?: ""

        // Status with color
        holder.tvStatus.text = order.status
        val statusColor = when (order.status) {
            "PENDING"   -> 0xFFB28E3A.toInt()
            "PAID"      -> 0xFF1D5D5D.toInt()
            "FULFILLED" -> 0xFF6F803C.toInt()
            "COMPLETED" -> 0xFF6F803C.toInt()
            "CANCELLED" -> 0xFFA3464D.toInt()
            else        -> 0xFF6b7280.toInt()
        }
        holder.tvStatus.setTextColor(statusColor)

        // Items summary
        holder.tvItems.text = order.items?.joinToString(", ") {
            "${it.productName} ×${it.quantity}"
        } ?: "—"

        // Meet-up details
        val hasMeetup = !order.meetupLocation.isNullOrEmpty() || !order.meetupTime.isNullOrEmpty()
        if (hasMeetup) {
            holder.layoutMeetup.visibility = View.VISIBLE
            val meetupText = buildString {
                if (!order.meetupLocation.isNullOrEmpty()) append("📍 ${order.meetupLocation}")
                if (!order.meetupTime.isNullOrEmpty()) {
                    if (isNotEmpty()) append("\n")
                    append("🕐 ${order.meetupTime.take(16).replace("T", " ")}")
                }
            }
            holder.tvMeetup.text = meetupText
        } else {
            holder.layoutMeetup.visibility = View.GONE
        }

        // QR Code
        if (!order.qrCodeUrl.isNullOrEmpty()) {
            holder.layoutQr.visibility = View.VISIBLE
            Glide.with(holder.itemView.context)
                .load(order.qrCodeUrl)
                .into(holder.ivQr)
        } else {
            holder.layoutQr.visibility = View.GONE
        }
    }

    override fun getItemCount() = orders.size
}