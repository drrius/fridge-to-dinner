import { ErrorScreen } from "./screens/error-screen";
import { HomeScreen } from "./screens/home-screen";
import { ManualScreen } from "./screens/manual-screen";
import { PrivacyScreen } from "./screens/privacy-screen";
import { RecipeDetailScreen } from "./screens/recipe-detail-screen";
import { ResultsScreen } from "./screens/results-screen";
import { ReviewScreen } from "./screens/review-screen";
import { ShareScreen } from "./screens/share-screen";
import { AnalyzingScreen } from "./screens/analyzing-screen";
import type { FridgeToDinnerFlow } from "./use-fridge-to-dinner-flow";

type RenderScreenProps = {
  flow: FridgeToDinnerFlow;
};

export function RenderScreen({ flow }: RenderScreenProps) {
  switch (flow.screen) {
    case "home":
      return (
        <HomeScreen
          fileInputRef={flow.fileInputRef}
          onChoosePhoto={flow.choosePhoto}
          onFileChange={flow.handleFileChange}
          onManual={() => flow.setScreen("manual")}
          onPrivacy={() => flow.setScreen("privacy")}
        />
      );
    case "manual":
      return (
        <ManualScreen
          manualText={flow.manualText}
          preferences={flow.preferences}
          onBack={() => flow.setScreen("home")}
          onManualTextChange={flow.setManualText}
          onPreferencesChange={flow.updatePreferences}
          onSubmit={flow.submitManualIngredients}
        />
      );
    case "review":
      if (!flow.currentPhoto) {
        return <PhotoMissingError flow={flow} />;
      }

      return (
        <ReviewScreen
          photoUrl={flow.currentPhoto}
          onBack={() => flow.setScreen("home")}
          onRetake={flow.choosePhoto}
          onUsePhoto={flow.startAnalysis}
        />
      );
    case "analyzing":
      if (!flow.currentPhoto) {
        return <PhotoMissingError flow={flow} />;
      }

      return (
        <AnalyzingScreen
          photoUrl={flow.currentPhoto}
          progress={flow.progress}
          status={flow.status}
          onCancel={flow.resetFlow}
        />
      );
    case "generating":
      return (
        <AnalyzingScreen
          progress={flow.progress}
          status={flow.status}
          onCancel={flow.resetFlow}
        />
      );
    case "results":
      return (
        <ResultsScreen
          ingredients={flow.ingredients}
          newIngredient={flow.newIngredient}
          preferences={flow.preferences}
          recipes={flow.recipes}
          isRegenerating={flow.isRegenerating}
          onAddIngredient={flow.addIngredient}
          onNewIngredientChange={flow.setNewIngredient}
          onOpenRecipe={flow.openRecipe}
          onPreferencesChange={flow.updatePreferences}
          onRegenerate={flow.regenerateRecipes}
          onRemoveIngredient={flow.removeIngredient}
          onShowPrivacy={() => flow.setScreen("privacy")}
          onSnapAgain={flow.resetFlow}
        />
      );
    case "detail":
      if (!flow.selectedRecipe) {
        return (
          <MissingResultError
            flow={flow}
            message="Scan or type ingredients before opening a recipe."
          />
        );
      }

      return (
        <RecipeDetailScreen
          recipe={flow.selectedRecipe}
          onBack={() => flow.setScreen("results")}
          onShare={() => flow.setScreen("share")}
          onStartCooking={flow.startCooking}
        />
      );
    case "privacy":
      return (
        <PrivacyScreen
          onBack={() => flow.setScreen("home")}
          onStart={flow.choosePhoto}
        />
      );
    case "error":
      return (
        <ErrorScreen
          message={flow.errorMessage}
          onManual={() => flow.setScreen("manual")}
          onRetake={flow.choosePhoto}
          onRetry={() => flow.setScreen(flow.selectedFile ? "review" : "home")}
        />
      );
    case "share":
      if (!flow.selectedRecipe) {
        return (
          <MissingResultError
            flow={flow}
            message="Scan or type ingredients before sharing a recipe."
          />
        );
      }

      return (
        <ShareScreen
          recipe={flow.selectedRecipe}
          onBack={() => flow.setScreen("detail")}
          onCopy={flow.copyRecipe}
          onShare={flow.shareRecipe}
          onSnapAgain={flow.resetFlow}
        />
      );
  }
}

function PhotoMissingError({ flow }: RenderScreenProps) {
  return (
    <ErrorScreen
      message="Choose a fridge photo before starting the scan."
      onManual={() => flow.setScreen("manual")}
      onRetake={flow.choosePhoto}
      onRetry={() => flow.setScreen("home")}
    />
  );
}

function MissingResultError({
  flow,
  message,
}: RenderScreenProps & { message: string }) {
  return (
    <ErrorScreen
      message={message}
      onManual={() => flow.setScreen("manual")}
      onRetake={flow.choosePhoto}
      onRetry={() => flow.setScreen("home")}
    />
  );
}
