import Foundation

struct DetectedIngredient: Identifiable, Hashable {
    enum Confidence: String, CaseIterable {
        case high
        case medium
        case low
    }

    enum Source: String {
        case vision
        case user
        case suggested
    }

    let id: UUID
    var name: String
    var confidence: Confidence
    var source: Source

    init(
        id: UUID = UUID(),
        name: String,
        confidence: Confidence = .high,
        source: Source = .vision
    ) {
        self.id = id
        self.name = name
        self.confidence = confidence
        self.source = source
    }
}

struct RecipeSuggestion: Identifiable, Hashable {
    let id: UUID
    var title: String
    var minutes: Int
    var servings: Int
    var difficulty: String
    var have: [String]
    var need: [String]
    var steps: [String]
    var whyThisWorks: String

    init(
        id: UUID = UUID(),
        title: String,
        minutes: Int,
        servings: Int,
        difficulty: String,
        have: [String],
        need: [String],
        steps: [String],
        whyThisWorks: String
    ) {
        self.id = id
        self.title = title
        self.minutes = minutes
        self.servings = servings
        self.difficulty = difficulty
        self.have = have
        self.need = need
        self.steps = steps
        self.whyThisWorks = whyThisWorks
    }
}

extension DetectedIngredient {
    static let sampleSet: [DetectedIngredient] = [
        .init(name: "eggs", confidence: .high),
        .init(name: "cooked rice", confidence: .high),
        .init(name: "carrots", confidence: .medium),
        .init(name: "spinach", confidence: .medium),
        .init(name: "cheddar", confidence: .low)
    ]
}

extension RecipeSuggestion {
    static let samples: [RecipeSuggestion] = [
        RecipeSuggestion(
            title: "Fridge Fried Rice",
            minutes: 20,
            servings: 2,
            difficulty: "easy",
            have: ["eggs", "cooked rice", "carrots", "spinach"],
            need: ["soy sauce", "scallions"],
            steps: [
                "Warm a skillet with a little oil over medium-high heat.",
                "Scramble the eggs, then move them to a plate.",
                "Stir-fry the carrots and rice until the rice crisps at the edges.",
                "Fold in spinach and eggs, then season with soy sauce."
            ],
            whyThisWorks: "Cooked rice and eggs make a fast base, while the vegetables add texture without needing a long cook."
        ),
        RecipeSuggestion(
            title: "Cheddar Spinach Omelet",
            minutes: 12,
            servings: 1,
            difficulty: "easy",
            have: ["eggs", "spinach", "cheddar"],
            need: ["bread"],
            steps: [
                "Wilt the spinach in a nonstick pan.",
                "Add beaten eggs and cook until just set.",
                "Scatter cheddar over one side, fold, and rest for one minute."
            ],
            whyThisWorks: "It turns the highest-confidence staples into a quick dinner with very little prep."
        ),
        RecipeSuggestion(
            title: "Carrot Rice Bowl",
            minutes: 18,
            servings: 2,
            difficulty: "easy",
            have: ["cooked rice", "carrots", "spinach"],
            need: ["sesame oil", "chili crisp"],
            steps: [
                "Saute carrots until lightly browned.",
                "Add rice and spinach, then cook until hot.",
                "Finish with sesame oil and chili crisp."
            ],
            whyThisWorks: "The bowl uses what is already ready to eat and only asks for pantry flavor boosters."
        )
    ]
}
