import SwiftUI
import UIKit

struct PhotoReviewView: View {
    let image: UIImage
    let onRetake: () -> Void
    let onUsePhoto: () -> Void

    var body: some View {
        ZStack {
            Color.paper.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("PHOTO READY")
                        .font(.mono(12, weight: .bold))
                        .foregroundStyle(Color.tomato)
                    Text("Use this fridge photo?")
                        .font(.display(36))
                        .foregroundStyle(Color.ink)
                    Text("A clear shelf shot helps the app spot ingredients and avoid wild dinner ideas.")
                        .font(.sans(15))
                        .foregroundStyle(Color.ink.opacity(0.68))
                        .lineSpacing(4)
                }

                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(maxWidth: .infinity)
                    .frame(height: 390)
                    .clipShape(RoundedRectangle(cornerRadius: Radius.xl))
                    .overlay(alignment: .topTrailing) {
                        Label("Not saved", systemImage: "checkmark.shield.fill")
                            .font(.sansSemiBold(12))
                            .foregroundStyle(Color.leaf)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color.surface.opacity(0.9), in: Capsule())
                            .padding(14)
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: Radius.xl)
                            .stroke(Color.ink.opacity(0.08), lineWidth: 1)
                    }
                    .cardShadow()

                Spacer()

                VStack(spacing: 12) {
                    Button(action: onUsePhoto) {
                        Label("Use this photo", systemImage: "sparkles")
                            .font(.sansSemiBold(17))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(minHeight: 58)
                    }
                    .buttonStyle(.plain)
                    .background(Color.tomato, in: RoundedRectangle(cornerRadius: Radius.lg))
                    .ctaShadow()

                    Button(action: onRetake) {
                        Label("Retake", systemImage: "camera.rotate")
                            .font(.sansSemiBold(16))
                            .foregroundStyle(Color.ink)
                            .frame(maxWidth: .infinity)
                            .frame(minHeight: 54)
                    }
                    .buttonStyle(.plain)
                    .background(Color.surface, in: RoundedRectangle(cornerRadius: Radius.lg))
                    .overlay {
                        RoundedRectangle(cornerRadius: Radius.lg)
                            .stroke(Color.ink.opacity(0.12), lineWidth: 1)
                    }
                }
            }
            .padding(24)
        }
    }
}

#Preview {
    PhotoReviewView(
        image: UIImage(systemName: "photo") ?? UIImage(),
        onRetake: {},
        onUsePhoto: {}
    )
}
