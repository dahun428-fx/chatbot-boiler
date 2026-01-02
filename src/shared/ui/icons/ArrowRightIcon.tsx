import { TIconProps } from '@/shared/types/icon.type';

const ArrowRightIcon = ({ fill = '#1F1F1F', width = 24, height = 24 }: TIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M12.6 12L8 7.4L9.4 6L15.4 12L9.4 18L8 16.6L12.6 12Z" fill={fill} />
    </svg>
  );
};

export default ArrowRightIcon;
