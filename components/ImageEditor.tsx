
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, RotateCw, Wand2, Check, X, Crop } from './Icons';

interface ImageEditorProps {
  imageBase64: string;
  onSave: (editedImageBase64: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageBase64, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageBase64;
    img.onload = () => {
      setImageObj(img);
      setPosition({ x: 0, y: 0 });
      
      // Auto-fit logic for large images (Mobile support)
      const canvasSize = 600; // Matches the width/height props of the canvas element
      
      // Calculate the scale needed to fit the image entirely within the canvas with padding
      const scaleX = canvasSize / img.width;
      const scaleY = canvasSize / img.height;
      const fitScale = Math.min(scaleX, scaleY) * 0.9; // 90% fill to leave margins
      
      // If the image is larger than the canvas or fits awkwardly, use the fitScale.
      // Otherwise, default to 1 (actual size) if it fits well.
      // For consistency, we mostly want "fit to screen" initial view.
      if (img.width > canvasSize || img.height > canvasSize) {
        setScale(fitScale);
      } else {
        // Even for smaller images, centering them nicely is often better than 100% scale if they are tiny
        // But usually, we just default to 1 for small images.
        setScale(1);
      }
    };
  }, [imageBase64]);

  useEffect(() => {
    draw();
  }, [imageObj, scale, rotation, brightness, contrast, position]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    
    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply panning (relative to screen)
    ctx.translate(position.x, position.y);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply scaling
    ctx.scale(scale, scale);
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // Draw image centered at the transformed origin
    ctx.drawImage(
      imageObj, 
      -imageObj.width / 2, 
      -imageObj.height / 2, 
      imageObj.width, 
      imageObj.height
    );

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(dataUrl);
    }
  };

  const autoEnhance = () => {
    setBrightness(110);
    setContrast(115);
    // Don't auto-zoom too much, maybe just a tiny bit or keep current scale
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Crop className="w-5 h-5" />
            עריכת תמונה
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 bg-slate-100 overflow-hidden flex items-center justify-center min-h-[300px]">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="w-full h-full max-w-[500px] max-h-[500px] shadow-2xl cursor-move bg-white"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-xs backdrop-blur-sm pointer-events-none">
            גרור להזזה • גלול לזום
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold w-16 text-slate-600">זום:</span>
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.05" 
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold w-16 text-slate-600">בהירות:</span>
            <input 
              type="range" 
              min="50" 
              max="150" 
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="flex-1 accent-blue-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold w-16 text-slate-600">ניגודיות:</span>
            <input 
              type="range" 
              min="50" 
              max="150" 
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="flex-1 accent-blue-600"
            />
          </div>

          <div className="flex justify-between pt-2">
             <div className="flex gap-2">
               <button 
                 onClick={autoEnhance}
                 className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold hover:bg-purple-200 transition text-sm"
               >
                 <Wand2 className="w-4 h-4" />
                 שיפור
               </button>
               <button 
                 onClick={rotate}
                 className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition text-sm"
                 title="סובב 90 מעלות"
               >
                 <RotateCw className="w-4 h-4" />
                 סובב
               </button>
             </div>

             <div className="flex gap-2">
               <button 
                 onClick={onCancel}
                 className="px-6 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
               >
                 ביטול
               </button>
               <button 
                 onClick={handleSave}
                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md"
               >
                 <Check className="w-4 h-4" />
                 שמור
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
