import { FC } from 'react';

import { cn } from '@/shared/lib/common';

interface SlideDotButtonProps {
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export const SlideDotButton: FC<SlideDotButtonProps> = ({
  index,
  isActive,
  onClick,
}) => {
  return (
    <button
      type="button"
      aria-label={`Go to slide ${index + 1}`}
      aria-current={isActive}
      className={cn(
        'h-2 w-2 rounded-md transition-colors',
        isActive ? 'bg-primary-1' : 'bg-gray-100'
      )}
      onClick={onClick}
    />
  );
};
