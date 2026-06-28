//
//  Theme.swift
//  fridge-to-dinner
//
//  Brand design tokens translated from docs/design/design-tokens.css
//  (Claude Design export). These cover BRAND-SPECIFIC values only —
//  for structural colors (backgrounds, labels, separators, fills) prefer
//  SwiftUI's semantic system colors (.primary, .secondary, Color(.systemBackground),
//  Color(.secondaryLabel), …) so light/dark and accessibility adapt for free.
//

import SwiftUI

// MARK: - Hex helper

extension Color {
    /// Create a color from a 0xRRGGBB literal, e.g. `Color(hex: 0xE8542E)`.
    init(hex: UInt32, opacity: Double = 1) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}

// MARK: - Brand palette

/// Brand-specific colors. Anything not here should use a system semantic color.
extension Color {
    // Core accent palette
    static let tomato      = Color(hex: 0xE8542E)
    static let tomatoDeep  = Color(hex: 0xC8431F)
    static let leaf        = Color(hex: 0x2E9E5E)
    static let amber       = Color(hex: 0xE5A823)
    static let amberDeep   = Color(hex: 0xC98A13)

    // Warm foundation (the signature paper/ink identity that replaces white/black)
    static let paper       = Color(hex: 0xFBF6EE)  // app background
    static let ink         = Color(hex: 0x1E1B16)  // primary text on paper
    static let surface     = Color(hex: 0xFFFDF9)  // raised card surface

    // Status & decoration tints
    static let needTint        = Color(hex: 0xFBE9E2)
    static let needTintStrong  = Color(hex: 0xF6A98F)
    static let haveTint        = Color(hex: 0xE3F3E8)
    static let haveTintStrong  = Color(hex: 0x7DDBA3)
    static let amberTint       = Color(hex: 0xFBF1DD)
}

// MARK: - Typography

extension Font {
    /// System serif display face — headings, hero text.
    static func display(_ size: CGFloat, relativeTo style: TextStyle = .largeTitle) -> Font {
        .system(size: size, weight: .bold, design: .serif)
    }
    /// Italic system serif display face — emphasis in hero text.
    static func displayItalic(_ size: CGFloat, relativeTo style: TextStyle = .largeTitle) -> Font {
        .system(size: size, weight: .bold, design: .serif).italic()
    }
    /// System sans face.
    static func sans(_ size: CGFloat, relativeTo style: TextStyle = .body) -> Font {
        .system(size: size, weight: .regular, design: .default)
    }
    /// Semibold system sans face — buttons, compact emphasis.
    static func sansSemiBold(_ size: CGFloat, relativeTo style: TextStyle = .body) -> Font {
        .system(size: size, weight: .semibold, design: .default)
    }
    /// Bold system sans face — short labels that need stronger hierarchy.
    static func sansBold(_ size: CGFloat, relativeTo style: TextStyle = .body) -> Font {
        .system(size: size, weight: .bold, design: .default)
    }
    /// System mono face — quantities, codes.
    static func mono(
        _ size: CGFloat,
        weight: Font.Weight = .regular,
        relativeTo style: TextStyle = .body
    ) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }
}

// MARK: - Radius

enum Radius {
    static let sm:   CGFloat = 8
    static let md:   CGFloat = 12
    static let lg:   CGFloat = 18
    static let xl:   CGFloat = 24
    static let xxl:  CGFloat = 32
    static let pill: CGFloat = 999  // or prefer Capsule() for fully-rounded shapes
}

// MARK: - Shadows
//
// Approximations of the multi-layer CSS shadows — SwiftUI's single-layer
// `.shadow` can't reproduce them exactly, but these match the visual intent.

extension View {
    /// Subtle resting elevation for cards (≈ --shadow-card).
    func cardShadow() -> some View {
        shadow(color: .black.opacity(0.05), radius: 1.5, x: 0, y: 1)
    }
    /// Floating elevation for sheets / popovers (≈ --shadow-float).
    func floatShadow() -> some View {
        shadow(color: Color.ink.opacity(0.45), radius: 35, x: 0, y: 30)
    }
    /// Branded glow under primary CTAs (≈ --shadow-cta).
    func ctaShadow() -> some View {
        shadow(color: Color.tomato.opacity(0.7), radius: 9, x: 0, y: 8)
    }
}

// MARK: - Preview palette

#Preview("Brand palette") {
    let swatches: [(String, Color)] = [
        ("tomato", .tomato), ("tomatoDeep", .tomatoDeep),
        ("leaf", .leaf), ("amber", .amber), ("amberDeep", .amberDeep),
        ("paper", .paper), ("ink", .ink), ("surface", .surface),
        ("needTint", .needTint), ("needTintStrong", .needTintStrong),
        ("haveTint", .haveTint), ("haveTintStrong", .haveTintStrong),
        ("amberTint", .amberTint),
    ]
    return ScrollView {
        VStack(alignment: .leading, spacing: 8) {
            Text("Fridge to Dinner")
                .font(.display(34))
            ForEach(swatches, id: \.0) { name, color in
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: Radius.sm)
                        .fill(color)
                        .frame(width: 56, height: 36)
                        .overlay(RoundedRectangle(cornerRadius: Radius.sm)
                            .stroke(.black.opacity(0.08)))
                    Text(name).font(.sans(15))
                }
            }
        }
        .padding(24)
    }
    .background(Color.paper)
}
