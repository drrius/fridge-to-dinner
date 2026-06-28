import SwiftUI
import UIKit

struct ScanProgressView: View {
    let image: UIImage
    let onFinished: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var progress: CGFloat = 0
    @State private var messageIndex = 0

    private let messages = [
        "Reading your shelves",
        "Sorting the maybes",
        "Matching dinner ideas",
        "Checking what you need"
    ]

    var body: some View {
        ZStack {
            Color.paper.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 26) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("ANALYZING")
                        .font(.mono(12, weight: .bold))
                        .foregroundStyle(Color.tomato)
                    Text("Turning shelves into dinner.")
                        .font(.display(34))
                        .foregroundStyle(Color.ink)
                    Text(messages[messageIndex])
                        .font(.sansSemiBold(16))
                        .foregroundStyle(Color.ink.opacity(0.68))
                }

                ZStack(alignment: .top) {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity)
                        .frame(height: 420)
                        .clipShape(RoundedRectangle(cornerRadius: Radius.xl))

                    if !reduceMotion {
                        Rectangle()
                            .fill(Color.tomato.opacity(0.26))
                            .frame(height: 4)
                            .offset(y: progress * 416)
                            .shadow(color: Color.tomato.opacity(0.4), radius: 12, x: 0, y: 0)
                            .clipShape(Capsule())
                            .padding(.horizontal, 18)
                    }
                }
                .overlay {
                    RoundedRectangle(cornerRadius: Radius.xl)
                        .stroke(Color.ink.opacity(0.08), lineWidth: 1)
                }
                .cardShadow()

                ProgressView(value: progress)
                    .tint(Color.tomato)

                Spacer()
            }
            .padding(24)
        }
        .task {
            await runMockScan()
        }
    }

    private func runMockScan() async {
        for step in 1...4 {
            if !reduceMotion {
                withAnimation(.easeInOut(duration: 0.55)) {
                    progress = CGFloat(step) / 4
                }
            } else {
                progress = CGFloat(step) / 4
            }

            messageIndex = min(step - 1, messages.count - 1)
            try? await Task.sleep(for: .milliseconds(650))
        }

        onFinished()
    }
}

#Preview {
    ScanProgressView(image: UIImage(systemName: "photo") ?? UIImage(), onFinished: {})
}
