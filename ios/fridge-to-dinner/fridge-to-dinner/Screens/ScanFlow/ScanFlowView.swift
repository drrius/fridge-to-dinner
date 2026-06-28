import SwiftUI
import UIKit

private enum ScanRoute: Hashable {
    case review
    case analyzing
    case results
}

struct ScanFlowView: View {
    @State private var path = [ScanRoute]()
    @State private var capturedImage: UIImage?
    @State private var ingredients = [DetectedIngredient]()
    @State private var recipes = [RecipeSuggestion]()

    var body: some View {
        NavigationStack(path: $path) {
            OnboardingView { image in
                capturedImage = image
                path = [.review]
            }
            .navigationDestination(for: ScanRoute.self) { route in
                destination(for: route)
            }
        }
    }

    @ViewBuilder
    private func destination(for route: ScanRoute) -> some View {
        switch route {
        case .review:
            if let capturedImage {
                PhotoReviewView(
                    image: capturedImage,
                    onRetake: resetToStart,
                    onUsePhoto: analyzePhoto
                )
                .navigationBarBackButtonHidden()
            }
        case .analyzing:
            if let capturedImage {
                ScanProgressView(image: capturedImage) {
                    finishMockAnalysis()
                }
                .navigationBarBackButtonHidden()
            }
        case .results:
            RecipeSuggestionsView(
                ingredients: $ingredients,
                recipes: recipes,
                onRegenerate: regenerateRecipes,
                onSnapAgain: resetToStart
            )
            .navigationBarBackButtonHidden()
        }
    }

    private func analyzePhoto() {
        path = [.analyzing]
    }

    private func finishMockAnalysis() {
        ingredients = DetectedIngredient.sampleSet
        recipes = RecipeSuggestion.samples
        path = [.results]
    }

    private func regenerateRecipes() {
        let names = ingredients.map(\.name)
        recipes = RecipeSuggestion.samples.map { recipe in
            var updated = recipe
            updated.have = recipe.have.filter { names.contains($0) }
            return updated
        }
    }

    private func resetToStart() {
        capturedImage = nil
        ingredients = []
        recipes = []
        path = []
    }
}

#Preview {
    ScanFlowView()
}
