package com.handycan.domain.model

data class Product(
    val sku: String,
    val name: String,
    val description: String,
    val category: String,
    val price: Double,
    val availability: Boolean,
    val storeLocation: String? = null,
    val imageUrl: String? = null,
    val compatibility: List<String> = emptyList()
)