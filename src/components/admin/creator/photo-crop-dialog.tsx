"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { uploadCreatorPhotoAction } from "@/server/actions/creators";

// One crop (a focal point + zoom level, in image-relative coordinates) is
// shared across every preview frame below, each with its own aspect
// ratio/size — this is what gives "see it as an avatar AND a card
// AND on mobile/desktop" without authoring a separate crop per context.
// The same math renders the on-screen preview <img>s and the final
// exported <canvas> images, so what's previewed is exactly what saves.
type Size = { w: number; h: number };
type Focal = { x: number; y: number }; // 0..1, fraction of image width/height

function computeDraw(img: Size, frame: Size, focal: Focal, zoom: number) {
  const baseScale = Math.max(frame.w / img.w, frame.h / img.h);
  const scale = baseScale * zoom;
  const drawW = img.w * scale;
  const drawH = img.h * scale;
  const offsetX = frame.w / 2 - focal.x * img.w * scale;
  const offsetY = frame.h / 2 - focal.y * img.h * scale;
  return { drawW, drawH, offsetX, offsetY };
}

function CropFrame({
  frame,
  shape,
  label,
  imgUrl,
  imgSize,
  focal,
  zoom,
  interactive,
  onDrag,
}: {
  frame: Size;
  shape: "circle" | "square";
  label: string;
  imgUrl: string;
  imgSize: Size;
  focal: Focal;
  zoom: number;
  interactive?: boolean;
  onDrag?: (dxFrac: number, dyFrac: number) => void;
}) {
  const { drawW, drawH, offsetX, offsetY } = computeDraw(imgSize, frame, focal, zoom);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !dragStart.current || !onDrag) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };
    const scale = Math.max(frame.w / imgSize.w, frame.h / imgSize.h) * zoom;
    onDrag(-dx / (imgSize.w * scale), -dy / (imgSize.h * scale));
  };
  const handlePointerUp = () => {
    dragStart.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        style={{ width: frame.w, height: frame.h }}
        className={`relative overflow-hidden bg-neutral-100 border border-neutral-200 ${shape === "circle" ? "rounded-full" : "rounded-lg"} ${interactive ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt=""
          draggable={false}
          style={{ position: "absolute", left: offsetX, top: offsetY, width: drawW, height: drawH, maxWidth: "none" }}
        />
      </div>
      <span className="text-[10px] text-neutral-400">{label}</span>
    </div>
  );
}

function drawToCanvas(img: HTMLImageElement, imgSize: Size, frame: Size, focal: Focal, zoom: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = frame.w;
  canvas.height = frame.h;
  const ctx = canvas.getContext("2d")!;
  const { drawW, drawH, offsetX, offsetY } = computeDraw(imgSize, frame, focal, zoom);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("canvas export failed"))), "image/jpeg", 0.9);
  });
}

export function PhotoCropDialog({ creatorId }: { creatorId: string }) {
  const [open, setOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<Size | null>(null);
  const [focal, setFocal] = useState<Focal>({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  const reset = useCallback(() => {
    setImgUrl(null);
    setImgSize(null);
    setFocal({ x: 0.5, y: 0.5 });
    setZoom(1);
    setError(undefined);
  }, []);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      setImgSize({ w: probe.naturalWidth, h: probe.naturalHeight });
      setImgUrl(url);
    };
    probe.src = url;
  }

  function handleDrag(dxFrac: number, dyFrac: number) {
    setFocal((f) => ({
      x: Math.min(1, Math.max(0, f.x + dxFrac)),
      y: Math.min(1, Math.max(0, f.y + dyFrac)),
    }));
  }

  async function handleSave() {
    if (!imgUrl || !imgSize) return;
    setPending(true);
    setError(undefined);
    try {
      const img = new Image();
      img.src = imgUrl;
      await img.decode();
      const avatarBlob = await drawToCanvas(img, imgSize, { w: 512, h: 512 }, focal, zoom);
      const cardBlob = await drawToCanvas(img, imgSize, { w: 480, h: 600 }, focal, zoom);

      const fd = new FormData();
      fd.set("avatar", avatarBlob, "avatar.jpg");
      fd.set("card", cardBlob, "card.jpg");
      const res = await uploadCreatorPhotoAction(creatorId, fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      setError("Could not process that image. Try a different file.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="absolute -bottom-1 -right-1 size-6 rounded-full bg-violet-600 text-white flex items-center justify-center ring-2 ring-white hover:bg-violet-500 transition-colors"
          title="Edit photo"
        >
          <Camera className="size-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Creator Photo</DialogTitle>
        </DialogHeader>

        {!imgUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              Choose a photo — drag to reposition and zoom to adjust before saving. It&rsquo;s used as the
              creator&rsquo;s avatar and card image everywhere on the site.
            </p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-center gap-6">
              <CropFrame
                frame={{ w: 220, h: 220 }}
                shape="circle"
                label="Avatar"
                imgUrl={imgUrl}
                imgSize={imgSize!}
                focal={focal}
                zoom={zoom}
                interactive
                onDrag={handleDrag}
              />
              <CropFrame
                frame={{ w: 128, h: 160 }}
                shape="square"
                label="Card"
                imgUrl={imgUrl}
                imgSize={imgSize!}
                focal={focal}
                zoom={zoom}
              />
            </div>
            <p className="text-xs text-neutral-400 text-center">Drag the avatar preview to reposition — the card preview updates with it.</p>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-500">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={reset}>Choose Another</Button>
              <Button type="button" onClick={handleSave} disabled={pending}>
                {pending ? "Saving…" : "Save Photo"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
