import React, { useState, useRef, useCallback, useEffect } from 'react';
import { uploadImage } from '../../services/firebase';
import { useLanguage } from '../LanguageContext';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  storagePath: string;
  aspectRatio?: number; // width/height, e.g. 16/9, 1 for square
  maxWidth?: number;
  quality?: number; // 0-1, JPEG quality
}

interface CropArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  storagePath,
  aspectRatio = 16 / 9,
  maxWidth = 1200,
  quality = 0.8,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, w: 100, h: 100 });
  const [dragging, setDragging] = useState<'move' | 'resize' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  // Display dimensions for the crop preview
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError(t.dashboard.image_invalid_type);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.dashboard.image_too_large);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // Initialize crop area when image loads
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    const container = cropContainerRef.current;
    if (!img || !container) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    setImgSize({ w: natW, h: natH });

    // Calculate display size (fit in 500px max)
    const maxDisplay = Math.min(500, window.innerWidth - 80);
    const scale = Math.min(maxDisplay / natW, maxDisplay / natH, 1);
    const dw = natW * scale;
    const dh = natH * scale;
    setDisplaySize({ w: dw, h: dh });

    // Calculate initial crop centered with aspect ratio
    let cropW: number, cropH: number;
    if (natW / natH > aspectRatio) {
      cropH = natH;
      cropW = natH * aspectRatio;
    } else {
      cropW = natW;
      cropH = natW / aspectRatio;
    }
    setCrop({
      x: (natW - cropW) / 2,
      y: (natH - cropH) / 2,
      w: cropW,
      h: cropH,
    });
  }, [aspectRatio]);

  // Mouse/touch handlers for crop drag
  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleCropMouseDown = (e: React.MouseEvent | React.TouchEvent, mode: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getEventPos(e);
    setDragging(mode);
    setDragStart({ x: pos.x, y: pos.y, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h });
  };

  useEffect(() => {
    if (!dragging) return;

    const scale = imgSize.w > 0 ? displaySize.w / imgSize.w : 1;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const pos = 'touches' in e
        ? { x: (e as TouchEvent).touches[0].clientX, y: (e as TouchEvent).touches[0].clientY }
        : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };

      const dx = (pos.x - dragStart.x) / scale;
      const dy = (pos.y - dragStart.y) / scale;

      if (dragging === 'move') {
        const nx = Math.max(0, Math.min(imgSize.w - dragStart.cw, dragStart.cx + dx));
        const ny = Math.max(0, Math.min(imgSize.h - dragStart.ch, dragStart.cy + dy));
        setCrop(prev => ({ ...prev, x: nx, y: ny }));
      } else if (dragging === 'resize') {
        let nw = Math.max(50, dragStart.cw + dx);
        let nh = nw / aspectRatio;
        // Clamp
        if (dragStart.cx + nw > imgSize.w) nw = imgSize.w - dragStart.cx;
        nh = nw / aspectRatio;
        if (dragStart.cy + nh > imgSize.h) {
          nh = imgSize.h - dragStart.cy;
          nw = nh * aspectRatio;
        }
        if (nw < 50) { nw = 50; nh = nw / aspectRatio; }
        setCrop(prev => ({ ...prev, w: nw, h: nh }));
      }
    };

    const handleUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, dragStart, imgSize, displaySize, aspectRatio]);

  // Crop + compress + upload
  const handleCropConfirm = async () => {
    if (!rawImage) return;
    setUploading(true);
    setError('');
    setCropModalOpen(false);

    try {
      // Load full-res image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = rawImage;
      });

      // Crop on canvas
      const outputW = Math.min(crop.w, maxWidth);
      const outputH = outputW / aspectRatio;

      const canvas = document.createElement('canvas');
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, outputW, outputH);

      // Convert to optimized blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
          'image/jpeg',
          quality
        );
      });

      // Try Firebase upload, fall back to data URL
      let url: string;
      try {
        const file = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });
        const path = `${storagePath}/${file.name}`;
        url = await uploadImage(file, path);
      } catch {
        // Firebase not configured — use optimized data URL instead
        url = canvas.toDataURL('image/jpeg', quality);
      }
      onChange(url);
    } catch (err) {
      console.error('Image processing failed:', err);
      setError(t.dashboard.image_upload_failed);
    } finally {
      setUploading(false);
      setRawImage(null);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setRawImage(null);
  };

  const scale = imgSize.w > 0 ? displaySize.w / imgSize.w : 1;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview + upload button */}
      <div className="flex items-center gap-3">
        {value && (
          <div className="relative group">
            <img
              src={value}
              alt="Preview"
              className="w-20 h-14 rounded-xl object-cover border border-slate-200"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-slate-50 border border-slate-200 border-dashed rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:border-teal-500 hover:text-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
              {t.dashboard.uploading}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t.dashboard.upload_image}
            </>
          )}
        </button>
      </div>

      {/* Or paste URL */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
      />

      {/* Error */}
      {error && (
        <p className="text-xs font-bold text-red-500 animate-[fadeSlideIn_0.2s_ease-out]">{error}</p>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Crop Modal */}
      {cropModalOpen && rawImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[560px] w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-black text-slate-900 mb-4">{t.dashboard.crop_title}</h4>

            {/* Crop area */}
            <div
              ref={cropContainerRef}
              className="relative mx-auto overflow-hidden rounded-xl bg-slate-100 select-none"
              style={{ width: displaySize.w || 'auto', height: displaySize.h || 'auto' }}
            >
              <img
                ref={imgRef}
                src={rawImage}
                onLoad={handleImageLoad}
                className="block"
                style={{ width: displaySize.w || 'auto', height: displaySize.h || 'auto' }}
                draggable={false}
              />
              {/* Dark overlay outside crop */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `linear-gradient(to right,
                  rgba(0,0,0,0.5) ${crop.x * scale}px,
                  transparent ${crop.x * scale}px,
                  transparent ${(crop.x + crop.w) * scale}px,
                  rgba(0,0,0,0.5) ${(crop.x + crop.w) * scale}px
                )`,
              }} />
              {/* Top/bottom overlay */}
              <div className="absolute pointer-events-none" style={{
                left: crop.x * scale,
                width: crop.w * scale,
                top: 0,
                height: crop.y * scale,
                background: 'rgba(0,0,0,0.5)',
              }} />
              <div className="absolute pointer-events-none" style={{
                left: crop.x * scale,
                width: crop.w * scale,
                top: (crop.y + crop.h) * scale,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
              }} />

              {/* Crop selection box */}
              <div
                className="absolute border-2 border-white cursor-move"
                style={{
                  left: crop.x * scale,
                  top: crop.y * scale,
                  width: crop.w * scale,
                  height: crop.h * scale,
                }}
                onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                onTouchStart={(e) => handleCropMouseDown(e, 'move')}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
                </div>
                {/* Resize handle */}
                <div
                  className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-teal-500 rounded-full cursor-se-resize shadow-md"
                  onMouseDown={(e) => handleCropMouseDown(e, 'resize')}
                  onTouchStart={(e) => handleCropMouseDown(e, 'resize')}
                />
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
              </div>
            </div>

            {/* Crop info */}
            <p className="text-xs text-slate-400 font-medium mt-3 text-center">
              {t.dashboard.crop_hint} &middot; {Math.round(crop.w)} x {Math.round(crop.h)}px
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                {t.dashboard.cancel}
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.dashboard.crop_confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
