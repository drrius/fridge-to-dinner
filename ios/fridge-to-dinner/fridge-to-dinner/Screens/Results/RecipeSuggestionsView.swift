import SwiftUI

struct RecipeSuggestionsView: View {
    @Binding var ingredients: [DetectedIngredient]
    let recipes: [RecipeSuggestion]
    let onRegenerate: () -> Void
    let onSnapAgain: () -> Void

    @State private var isEditingIngredients = false
    @State private var expandedRecipeID: RecipeSuggestion.ID?

    var body: some View {
        ZStack {
            Color.paper.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    header
                    ingredientsSection
                    recipesSection
                    footerActions
                }
                .padding(24)
            }
        }
        .sheet(isPresented: $isEditingIngredients, onDismiss: onRegenerate) {
            EditIngredientsView(ingredients: $ingredients)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 9) {
            Text("DINNER OPTIONS")
                .font(.mono(12, weight: .bold))
                .foregroundStyle(Color.tomato)
            Text("Here are three ways to eat tonight.")
                .font(.display(35))
                .foregroundStyle(Color.ink)
            Text("The backend is still a placeholder, so these recipes use sample data while the screens are wired.")
                .font(.sans(14))
                .foregroundStyle(Color.ink.opacity(0.62))
                .lineSpacing(4)
        }
    }

    private var ingredientsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Detected ingredients")
                    .font(.sansBold(18))
                    .foregroundStyle(Color.ink)

                Spacer()

                Button {
                    isEditingIngredients = true
                } label: {
                    Label("Edit", systemImage: "slider.horizontal.3")
                        .labelStyle(.iconOnly)
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(Color.ink)
                        .frame(width: 44, height: 44)
                }
                .accessibilityLabel("Edit ingredients")
            }

            FlowLayout(spacing: 8) {
                ForEach(ingredients) { ingredient in
                    IngredientChip(ingredient: ingredient) {
                        ingredients.removeAll { $0.id == ingredient.id }
                        onRegenerate()
                    }
                }
            }
        }
        .padding(18)
        .background(Color.surface, in: RoundedRectangle(cornerRadius: Radius.lg))
        .overlay {
            RoundedRectangle(cornerRadius: Radius.lg)
                .stroke(Color.ink.opacity(0.08), lineWidth: 1)
        }
        .cardShadow()
    }

    private var recipesSection: some View {
        VStack(spacing: 14) {
            ForEach(recipes) { recipe in
                RecipeCard(
                    recipe: recipe,
                    isExpanded: expandedRecipeID == recipe.id,
                    onToggle: {
                        withAnimation(.snappy) {
                            expandedRecipeID = expandedRecipeID == recipe.id ? nil : recipe.id
                        }
                    }
                )
            }
        }
    }

    private var footerActions: some View {
        VStack(spacing: 12) {
            ShareLink(
                item: "I turned my fridge photo into dinner ideas with Fridge to Dinner."
            ) {
                Label("Share ideas", systemImage: "square.and.arrow.up")
                    .font(.sansSemiBold(16))
                    .foregroundStyle(Color.ink)
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: 54)
            }
            .background(Color.surface, in: RoundedRectangle(cornerRadius: Radius.lg))
            .overlay {
                RoundedRectangle(cornerRadius: Radius.lg)
                    .stroke(Color.ink.opacity(0.12), lineWidth: 1)
            }

            Button(action: onSnapAgain) {
                Label("Snap again", systemImage: "camera.fill")
                    .font(.sansSemiBold(17))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: 58)
            }
            .buttonStyle(.plain)
            .background(Color.tomato, in: RoundedRectangle(cornerRadius: Radius.lg))
            .ctaShadow()
        }
    }
}

private struct IngredientChip: View {
    let ingredient: DetectedIngredient
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 7) {
            Text(ingredient.name)
                .font(.sansSemiBold(14))
            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 15, weight: .semibold))
            }
            .accessibilityLabel("Remove \(ingredient.name)")
        }
        .foregroundStyle(Color.ink)
        .padding(.leading, 12)
        .padding(.trailing, 8)
        .padding(.vertical, 9)
        .background(chipBackground, in: Capsule())
    }

    private var chipBackground: Color {
        switch ingredient.source {
        case .user:
            return .amberTint
        case .suggested:
            return .needTint
        case .vision:
            return ingredient.confidence == .low ? .needTint : .haveTint
        }
    }
}

private struct RecipeCard: View {
    let recipe: RecipeSuggestion
    let isExpanded: Bool
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 7) {
                        Text(recipe.title)
                            .font(.display(26))
                            .foregroundStyle(Color.ink)
                            .multilineTextAlignment(.leading)
                        Text("\(recipe.minutes) min · \(recipe.servings) servings · \(recipe.difficulty)")
                            .font(.mono(12, weight: .semibold))
                            .foregroundStyle(Color.ink.opacity(0.56))
                    }

                    Spacer()

                    Image(systemName: isExpanded ? "chevron.up.circle.fill" : "chevron.down.circle")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundStyle(Color.tomato)
                }

                HStack(alignment: .top, spacing: 10) {
                    MatchSummary(title: "You have", items: recipe.have, color: .leaf, background: .haveTint)
                    MatchSummary(title: "Grab", items: recipe.need, color: .tomato, background: .needTint)
                }

                if isExpanded {
                    VStack(alignment: .leading, spacing: 14) {
                        Text(recipe.whyThisWorks)
                            .font(.sans(14))
                            .foregroundStyle(Color.ink.opacity(0.68))
                            .lineSpacing(4)

                        VStack(alignment: .leading, spacing: 10) {
                            ForEach(Array(recipe.steps.enumerated()), id: \.offset) { index, step in
                                HStack(alignment: .top, spacing: 10) {
                                    Text("\(index + 1)")
                                        .font(.mono(12, weight: .bold))
                                        .foregroundStyle(.white)
                                        .frame(width: 24, height: 24)
                                        .background(Color.tomato, in: Circle())
                                    Text(step)
                                        .font(.sans(15))
                                        .foregroundStyle(Color.ink.opacity(0.76))
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }
                        }
                    }
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
            .padding(18)
            .background(Color.surface, in: RoundedRectangle(cornerRadius: Radius.lg))
            .overlay {
                RoundedRectangle(cornerRadius: Radius.lg)
                    .stroke(Color.ink.opacity(0.08), lineWidth: 1)
            }
            .cardShadow()
        }
        .buttonStyle(.plain)
    }
}

private struct MatchSummary: View {
    let title: String
    let items: [String]
    let color: Color
    let background: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title)
                .font(.sansBold(12))
                .foregroundStyle(color)
            Text(items.isEmpty ? "none" : items.joined(separator: ", "))
                .font(.sans(13))
                .foregroundStyle(Color.ink.opacity(0.7))
                .lineLimit(3)
                .multilineTextAlignment(.leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(background, in: RoundedRectangle(cornerRadius: Radius.md))
    }
}

private struct FlowLayout: Layout {
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrangeSubviews(proposal: proposal, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let arrangement = arrangeSubviews(proposal: proposal, subviews: subviews)
        for item in arrangement.items {
            subviews[item.index].place(
                at: CGPoint(x: bounds.minX + item.frame.minX, y: bounds.minY + item.frame.minY),
                proposal: ProposedViewSize(item.frame.size)
            )
        }
    }

    private func arrangeSubviews(proposal: ProposedViewSize, subviews: Subviews) -> Arrangement {
        let maxWidth = proposal.width ?? 320
        var items = [Arrangement.Item]()
        var origin = CGPoint.zero
        var rowHeight: CGFloat = 0

        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            if origin.x > 0, origin.x + size.width > maxWidth {
                origin.x = 0
                origin.y += rowHeight + spacing
                rowHeight = 0
            }

            items.append(.init(index: index, frame: CGRect(origin: origin, size: size)))
            origin.x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }

        return .init(items: items, size: CGSize(width: maxWidth, height: origin.y + rowHeight))
    }

    private struct Arrangement {
        struct Item {
            let index: Int
            let frame: CGRect
        }

        let items: [Item]
        let size: CGSize
    }
}

#Preview {
    @Previewable @State var ingredients = DetectedIngredient.sampleSet
    RecipeSuggestionsView(
        ingredients: $ingredients,
        recipes: RecipeSuggestion.samples,
        onRegenerate: {},
        onSnapAgain: {}
    )
}
