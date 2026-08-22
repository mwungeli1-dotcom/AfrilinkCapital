"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name, video }: { images: string[]; name: string; video?: string }) {
  const [selected, setSelected] = useState(0);
  const activeImage = images[selected];

  return <div className="flex gap-3">
    {images.length > 1 && <div className="flex w-16 shrink-0 flex-col gap-2">{images.map((url, index) => <button type="button" key={url} onClick={() => setSelected(index)} className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-slate-50 ${selected === index ? "border-orange-500" : "border-transparent hover:border-slate-300"}`} aria-label={`View picture ${index + 1}`}><Image unoptimized fill sizes="64px" src={url} alt={`${name} thumbnail ${index + 1}`} className="object-contain" /></button>)}{video && <a href="#product-video" className="flex aspect-square items-center justify-center rounded-lg border bg-slate-950 text-xs font-black text-white">▶ Video</a>}</div>}
    <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-50">{activeImage ? <Image unoptimized fill preload sizes="(max-width:1024px) 100vw, 45vw" src={activeImage} alt={`${name} picture ${selected + 1}`} className="object-contain" /> : <div className="flex h-full items-center justify-center text-7xl text-slate-300">▦</div>}<span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-2 text-[10px] font-bold shadow">Picture {Math.min(selected + 1, Math.max(images.length, 1))} of {Math.max(images.length, 1)}</span></div>
  </div>;
}
