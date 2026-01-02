import { TIconProps } from '@/shared/types/icon.type';

const ClosedIcon = ({ fill = '#000', width = 24, height = 24, iconClassName }: TIconProps) => {
  return (
    <svg
      width={`${width}`}
      height={`${height}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
    >
      <path d="M6 6L18 18" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke={fill} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
};

export default ClosedIcon;
