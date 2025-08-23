package com.handycan.domain.model

data class ProjectGuide(
    val id: String,
    val title: String,
    val description: String,
    val steps: List<ProjectStep>,
    val requiredTools: List<String>,
    val requiredMaterials: List<Product>,
    val difficulty: Difficulty,
    val estimatedTime: String
)

data class ProjectStep(
    val stepNumber: Int,
    val title: String,
    val description: String,
    val tips: List<String> = emptyList(),
    val warnings: List<String> = emptyList()
)

enum class Difficulty {
    BEGINNER, INTERMEDIATE, ADVANCED
}