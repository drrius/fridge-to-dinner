import SwiftUI

struct OnboardingView: View {
    var body: some View {
        ZStack {
            Color.paper
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                OnboardingHeader()

                Spacer()

                OnboardingHero()

                Spacer().frame(height: 24)
                
                OnboardingIntroText()
                
                Spacer()
                
                OnboardingActions()
                
                Spacer().frame(height: 20)
                
                PrivacyNote().frame(maxWidth: .infinity, alignment: .center)
            }
            .padding(.horizontal, 28)
            .padding(.top, 36)
            .padding(.bottom, 34)
        }
    }
}

private struct OnboardingHeader: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("NO LOGIN · ~15 SEC")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundStyle(Color.tomato)
                .tracking(2)

            Text("Fridge to Dinner")
                .font(.mono(14))
                .foregroundStyle(Color.ink.opacity(0.65))
        }
    }
}

private struct OnboardingHero: View {
    var body: some View {
        VStack(alignment: .leading, spacing: -10) {
            Text("Your fridge")
            Text("already knows")
            Text("what's for")
            Text("dinner.")
                .font(.displayItalic(44))
                .foregroundStyle(Color.tomato)
        }
        .font(.display(44))
        .foregroundStyle(Color.ink)
    }
    
}

private struct OnboardingIntroText: View {
    var body: some View {
        Text("Snap a photo of your shelves. Get three dinners you can make tonight — plus the few things you'd grab.")
            .font(.sansSemiBold(16)).cardShadow()
            .foregroundStyle(Color.ink.opacity(0.72))
            .lineSpacing(5)
    }
}

private struct OnboardingActions: View {
    var body: some View {
        VStack(spacing: 14) {
            Button {
                // TODO: open camera
            } label: {
                Label("Snap your fridge", systemImage: "camera.fill")
                    .font(.sansSemiBold(18))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 68)
            }
            .buttonStyle(.plain)
            .background(Color.tomato)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            
            Button {
                // TODO: open photo picker
            } label: {
                Text("Upload a photo instead")
                    .font(.sansSemiBold(15))
                    .foregroundStyle(Color.ink)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
            }
            .buttonStyle(.plain)
            .background(Color.paper)
            .overlay {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.ink.opacity(0.14), lineWidth: 1)
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}

private struct PrivacyNote: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 14, weight:. semibold))
                .foregroundStyle(Color.leaf)
            
            Text("Photos are processed once, never saved.")
                            .font(.sans(12))
                            .foregroundStyle(Color.ink.opacity(0.65))
        }
    }
}

#Preview {
    OnboardingView()
}
