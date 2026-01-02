import { TIconProps } from '@/shared/types/icon.type';

const HamburgerIcon = ({ width = 24, height = 24 }: TIconProps) => {
  return (
    <svg
      width={`${width}`}
      height={`${height}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 'none' }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};

export default HamburgerIcon;
