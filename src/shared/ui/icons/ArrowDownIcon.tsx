import { TIconProps } from '@/shared/types/icon.type';

const ArrowDownIcon = ({ fill = '#000', width = 24, height = 24 }: TIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill={fill}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99984 13.4163C9.86723 13.4163 9.74005 13.3637 9.64628 13.2699L3.81295 7.43656C3.61769 7.2413 3.61769 6.92472 3.81295 6.72946C4.00821 6.53419 4.3248 6.53419 4.52006 6.72946L9.99984 12.2092L15.4796 6.72945C15.6749 6.53419 15.9915 6.53419 16.1867 6.72945C16.382 6.92472 16.382 7.2413 16.1867 7.43656L10.3534 13.2699C10.2596 13.3637 10.1324 13.4163 9.99984 13.4163Z"
        fill={fill}
      />
    </svg>
  );
};

export default ArrowDownIcon;
