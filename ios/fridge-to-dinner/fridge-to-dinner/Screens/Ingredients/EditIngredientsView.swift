import SwiftUI

struct EditIngredientsView: View {
    @Binding var ingredients: [DetectedIngredient]
    @Environment(\.dismiss) private var dismiss
    @State private var newIngredient = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Detected") {
                    ForEach($ingredients) { $ingredient in
                        HStack(spacing: 12) {
                            TextField("Ingredient", text: $ingredient.name)
                                .font(.sans(16))

                            ConfidenceBadge(confidence: ingredient.confidence)
                        }
                    }
                    .onDelete { offsets in
                        ingredients.remove(atOffsets: offsets)
                    }
                }

                Section("Add missing item") {
                    HStack {
                        TextField("e.g. chicken thighs", text: $newIngredient)
                            .font(.sans(16))
                        Button("Add") {
                            addIngredient()
                        }
                        .font(.sansSemiBold(15))
                        .disabled(newIngredient.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Color.paper)
            .navigationTitle("Edit ingredients")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                    .font(.sansSemiBold(15))
                }
            }
        }
    }

    private func addIngredient() {
        let trimmed = newIngredient.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return
        }

        ingredients.append(.init(name: trimmed, confidence: .high, source: .user))
        newIngredient = ""
    }
}

private struct ConfidenceBadge: View {
    let confidence: DetectedIngredient.Confidence

    var body: some View {
        Text(confidence.rawValue.uppercased())
            .font(.mono(10, weight: .bold))
            .foregroundStyle(foreground)
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(background, in: Capsule())
    }

    private var foreground: Color {
        switch confidence {
        case .high:
            return .leaf
        case .medium:
            return .amberDeep
        case .low:
            return .tomatoDeep
        }
    }

    private var background: Color {
        switch confidence {
        case .high:
            return .haveTint
        case .medium:
            return .amberTint
        case .low:
            return .needTint
        }
    }
}

#Preview {
    @Previewable @State var ingredients = DetectedIngredient.sampleSet
    EditIngredientsView(ingredients: $ingredients)
}
