import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Sparkles } from 'lucide-react';

export interface FlyingProjectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageUrl?: string;
  productName?: string;
}

interface FlyToCartOverlayProps {
  projectiles: FlyingProjectile[];
  onComplete: (id: string) => void;
}

export const FlyToCartOverlay: React.FC<FlyToCartOverlayProps> = ({ projectiles, onComplete }) => {
  if (typeof document === 'undefined' || projectiles.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {projectiles.map((p) => {
        const deltaX = p.targetX - p.startX;
        const deltaY = p.targetY - p.startY;
        // Calculate arc curve: curve slightly outwards and arc above
        const midX = p.startX + deltaX * 0.45 - (deltaX > 0 ? 18 : -18);
        const midY = Math.min(p.startY, p.targetY) - Math.max(45, Math.abs(deltaY) * 0.18);

        return (
          <motion.div
            key={p.id}
            initial={{
              left: p.startX,
              top: p.startY,
              x: '-50%',
              y: '-50%',
              scale: 0.7,
              opacity: 0.95,
              rotate: 0,
            }}
            animate={{
              left: [p.startX, midX, p.targetX],
              top: [p.startY, midY, p.targetY],
              scale: [0.7, 1.25, 0.22],
              opacity: [1, 1, 0.9, 0],
              rotate: [0, -22, 26, 0],
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1], // smooth projectile curve
              times: [0, 0.45, 1],
            }}
            onAnimationComplete={() => {
              onComplete(p.id);
            }}
            className="fixed pointer-events-none drop-shadow-2xl"
          >
            {/* Projectile Container with Golden Aura */}
            <div className="relative flex items-center justify-center">
              {/* Outer Golden Glow & Ripple */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400/60 to-yellow-300/40 blur-md animate-pulse" />

              {/* Main Circular Token */}
              <div className="relative w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 shadow-xl shadow-amber-500/70 flex items-center justify-center ring-2 ring-amber-300/80">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              </div>

              {/* Badge +1 */}
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-md ring-1 ring-slate-950">
                +1
              </span>

              {/* Trail sparkles */}
              <div className="absolute -bottom-1 -left-1 text-amber-300 animate-ping opacity-75">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>,
    document.body
  );
};
