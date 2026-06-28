import Image from "next/image";

type PhotoSurfaceProps = {
  photoUrl: string;
  alt: string;
};

export function PhotoSurface({ photoUrl, alt }: PhotoSurfaceProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-ink bg-surface shadow-hard">
      <Image
        src={photoUrl}
        alt={alt}
        width={960}
        height={1200}
        className="aspect-[4/5] w-full object-cover"
        unoptimized={photoUrl.startsWith("blob:")}
        priority
      />
      <div className="absolute top-4 right-4 rounded-pill bg-surface/92 px-3 py-2 font-machine text-[0.68rem] tracking-[0.12em] text-leaf uppercase">
        not saved
      </div>
    </div>
  );
}
