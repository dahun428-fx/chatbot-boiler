import { FC } from 'react';

import HamburgerIcon from '@/shared/ui/icons/HambergerIcon';

interface HamburgerButtonProps {
  onClick?: () => void;
}

export const HamburgerButton: FC<HamburgerButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-2 hover:bg-gray-100"
      aria-label="사이드바 열기"
    >
      <HamburgerIcon />
    </button>
  );
};
