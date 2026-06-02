package com.lao.myapplication.shared.utils

import android.content.Context
import android.content.SharedPreferences

object TokenManager {
    private const val PREF_NAME = "campus_bazaar_prefs"
    private const val KEY_TOKEN = "auth_token"
    private const val KEY_ROLE = "user_role"
    private const val KEY_EMAIL = "user_email"
    private const val KEY_NAME = "user_name"

    private fun prefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    fun saveToken(context: Context, token: String) =
        prefs(context).edit().putString(KEY_TOKEN, token).apply()

    fun getToken(context: Context): String? =
        prefs(context).getString(KEY_TOKEN, null)

    fun saveUserInfo(context: Context, email: String, role: String, name: String) {
        prefs(context).edit()
            .putString(KEY_EMAIL, email)
            .putString(KEY_ROLE, role)
            .putString(KEY_NAME, name)
            .apply()
    }

    fun getRole(context: Context): String =
        prefs(context).getString(KEY_ROLE, "STUDENT") ?: "STUDENT"

    fun getEmail(context: Context): String =
        prefs(context).getString(KEY_EMAIL, "") ?: ""

    fun getName(context: Context): String =
        prefs(context).getString(KEY_NAME, "") ?: ""

    fun clearToken(context: Context) =
        prefs(context).edit().clear().apply()

    fun isLoggedIn(context: Context): Boolean = getToken(context) != null
}