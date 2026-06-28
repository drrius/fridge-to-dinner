import SwiftUI
import PhotosUI
import UIKit
import ImageIO

struct OnboardingView: View {
    var onImageSelected: (UIImage) -> Void = { _ in }

    @State private var selectedImage: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var isLoadingPhoto = false
    @State private var isCameraPresented = false
    @State private var isCameraUnavailableAlertPresented = false

    private var isRunningInPreview: Bool {
        ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
    }
    
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
                
                OnboardingActions(
                    selectedPhotoItem: $selectedPhotoItem,
                    isLoadingPhoto: isLoadingPhoto,
                    isRunningInPreview: isRunningInPreview,
                    onCameraTap: {
                        if UIImagePickerController.isSourceTypeAvailable(.camera) {
                            isCameraPresented = true
                        } else {
                            isCameraUnavailableAlertPresented = true
                        }
                    },
                    onPreviewPhotoTap: {
                        selectedImage = Self.previewFridgeImage()
                    }
                )
                
                Spacer().frame(height: 20)
                
                PrivacyNote().frame(maxWidth: .infinity, alignment: .center)
            }
            .padding(.horizontal, 28)
            .padding(.top, 36)
            .padding(.bottom, 34)
        }
        .onChange(of: selectedPhotoItem, initial: false) {_, newItem in
            Task {
                await loadPhoto(from: newItem)
            }
        }
        .onChange(of: selectedImage, initial: false) { _, image in
            guard let image else {
                return
            }

            onImageSelected(image)
            selectedImage = nil
            selectedPhotoItem = nil
        }
        .fullScreenCover(isPresented: $isCameraPresented) {
            CameraPicker(selectedImage: $selectedImage)
        }
        .alert("Camera unavailable", isPresented: $isCameraUnavailableAlertPresented) {
            Button("OK", role: .cancel) {
            }
        } message: {
            Text("Use a physical iPhone to take a fridge photo.")
        }
    }

    @MainActor
    private func loadPhoto(from item: PhotosPickerItem?) async {
        guard let item else {
            return
        }

        isLoadingPhoto = true
        defer { isLoadingPhoto = false }

        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = Self.downsampledImage(from: data) else {
            selectedPhotoItem = nil
            return
        }

        selectedImage = image
    }

    private static func downsampledImage(from data: Data, maxPixelSize: CGFloat = 1_600) -> UIImage? {
        let options = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let source = CGImageSourceCreateWithData(data as CFData, options) else {
            return nil
        }

        let thumbnailOptions = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: maxPixelSize
        ] as CFDictionary

        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, thumbnailOptions) else {
            return nil
        }

        return UIImage(cgImage: cgImage)
    }

    private static func previewFridgeImage() -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 900, height: 1_200))
        return renderer.image { context in
            Color.paper.uiColor.setFill()
            context.fill(CGRect(x: 0, y: 0, width: 900, height: 1_200))

            UIColor.white.setFill()
            UIBezierPath(roundedRect: CGRect(x: 95, y: 95, width: 710, height: 1_010), cornerRadius: 44).fill()

            UIColor(red: 0.91, green: 0.94, blue: 0.94, alpha: 1).setFill()
            for y in [270, 510, 750] {
                UIBezierPath(roundedRect: CGRect(x: 150, y: y, width: 600, height: 18), cornerRadius: 9).fill()
            }

            let colors: [UIColor] = [
                UIColor(red: 0.18, green: 0.62, blue: 0.37, alpha: 1),
                UIColor(red: 0.91, green: 0.33, blue: 0.18, alpha: 1),
                UIColor(red: 0.90, green: 0.66, blue: 0.14, alpha: 1),
                UIColor(red: 0.55, green: 0.72, blue: 0.95, alpha: 1)
            ]

            let items = [
                CGRect(x: 170, y: 170, width: 170, height: 120),
                CGRect(x: 390, y: 150, width: 140, height: 150),
                CGRect(x: 575, y: 180, width: 135, height: 110),
                CGRect(x: 190, y: 390, width: 210, height: 120),
                CGRect(x: 455, y: 365, width: 235, height: 145),
                CGRect(x: 180, y: 620, width: 150, height: 130),
                CGRect(x: 405, y: 610, width: 290, height: 140),
                CGRect(x: 240, y: 850, width: 420, height: 120)
            ]

            for (index, rect) in items.enumerated() {
                colors[index % colors.count].setFill()
                UIBezierPath(roundedRect: rect, cornerRadius: 28).fill()
            }
        }
    }
}

private extension Color {
    var uiColor: UIColor {
        UIColor(self)
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
    @Binding var selectedPhotoItem: PhotosPickerItem?
    let isLoadingPhoto: Bool
    let isRunningInPreview: Bool
    let onCameraTap: () -> Void
    let onPreviewPhotoTap: () -> Void
    
    var body: some View {
        VStack(spacing: 14) {
            Button {
                onCameraTap()
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

            if isRunningInPreview {
                Button(action: onPreviewPhotoTap) {
                    Text("Use sample photo")
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
            } else {
                PhotosPicker(
                    selection: $selectedPhotoItem,
                    matching: .images,
                    photoLibrary: .shared()
                ) {
                    Label(
                        isLoadingPhoto ? "Preparing photo" : "Upload a photo instead",
                        systemImage: isLoadingPhoto ? "hourglass" : "photo.on.rectangle"
                    )
                    .font(.sansSemiBold(15))
                    .foregroundStyle(Color.ink)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                }
                .buttonStyle(.plain)
                .disabled(isLoadingPhoto)
                .background(Color.paper)
                .overlay {
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.ink.opacity(0.14), lineWidth: 1)
                }
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
    }
}

private struct PrivacyNote: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 14, weight: .semibold))
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
