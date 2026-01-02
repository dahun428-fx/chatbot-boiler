// src/components/chat/AnimatedQuestion.tsx
import { FC, MouseEvent, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/shared/lib/common';

type Ripple = { id: number; x: number; y: number; size: number };

type Props = {
  text: string;
  onClick: () => void;
  className?: string;
};

const AnimatedQuestion: FC<Props> = ({ text, onClick, className }) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const spawnRipple = (e: MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const rid = idRef.current++;

    setRipples((prev) => [...prev, { id: rid, x, y, size }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rid));
    }, 500);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    spawnRipple(e);
    onClick();
  };

  return (
    <motion.div
      ref={wrapRef}
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.4 }}
      className={cn(
        'relative w-full cursor-pointer select-none overflow-hidden rounded-lg border border-gray-150 bg-gray-50 p-[8px] text-left',
        'active:border-original-300 active:bg-original-300/20 hover:opacity-90',
        className
      )}
    >
      {/* Ripple 효과 */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {ripples.map(({ id, x, y, size }) => (
            <motion.span
              key={id}
              initial={{ opacity: 0.35, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                width: size,
                height: size,
                left: x,
                top: y,
              }}
              className="bg-original-300 absolute rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 내용 */}
      <p className="line-clamp-2 overflow-hidden text-ellipsis break-words">
        <span className="font-semibold text-gray-600">Q.&nbsp;</span>
        <span className="text-[15px] text-gray-800">{text}</span>
      </p>
    </motion.div>
  );
};

export default AnimatedQuestion;
