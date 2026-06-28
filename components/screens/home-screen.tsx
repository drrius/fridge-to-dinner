import Image from "next/image";
import { CameraIcon, ImageIcon, KeyboardIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PrivacyNote } from "../privacy-note";
import { ScreenFrame } from "../screen-frame";
import { illustrationImage } from "../constants";

type HomeScreenProps = {
  albumInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  onChooseAlbumPhoto: () => void;
  onChooseCameraPhoto: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onManual: () => void;
  onPrivacy: () => void;
};

export function HomeScreen({
  albumInputRef,
  cameraInputRef,
  onChooseAlbumPhoto,
  onChooseCameraPhoto,
  onFileChange,
  onManual,
  onPrivacy,
}: HomeScreenProps) {
  return (
    <ScreenFrame footer={<PrivacyNote onClick={onPrivacy} />}>
      <input
        ref={cameraInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
      />
      <input
        ref={albumInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={onFileChange}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-2 pt-2">
          <p className="font-machine text-xs font-medium tracking-[0.16em] text-tomato uppercase">
            No login / ~15 sec
          </p>
          <p className="font-machine text-sm text-text-muted">
            Fridge to Dinner
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-7 py-10">
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
              Your fridge already knows what&apos;s for{" "}
              <span className="italic text-tomato">dinner.</span>
            </h1>
            <p className="max-w-[31ch] text-base leading-7 font-semibold text-ink/75">
              Snap a photo of your shelves. Get three dinners you can make
              tonight plus the few things you would grab.
            </p>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[250px] sm:block lg:hidden">
            <Image
              src={illustrationImage}
              alt="Illustrated fridge shelves"
              width={960}
              height={1200}
              className="aspect-[4/5] w-full rounded-2xl border border-border object-cover shadow-hard-sm"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={onChooseCameraPhoto}>
            <CameraIcon data-icon="inline-start" />
            Snap your fridge
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={onChooseAlbumPhoto}>
              <ImageIcon data-icon="inline-start" />
              Album
            </Button>
            <Button variant="outline" size="lg" onClick={onManual}>
              <KeyboardIcon data-icon="inline-start" />
              Type
            </Button>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
