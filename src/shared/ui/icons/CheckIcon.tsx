import { TIconProps } from '@/shared/types/icon.type';

const CheckIcon = ({ width = 30, height = 21, iconClassName }: TIconProps) => {
  return (
    <svg
      width={`${width}`}
      height={`${height}`}
      viewBox="0 0 30 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.3351 1.37685C29.8883 1.93009 29.8883 2.82707 29.3351 3.38032L12.4462 20.2692C11.8929 20.8224 10.996 20.8224 10.4427 20.2692L0.664932 10.4914C0.111689 9.93818 0.111689 9.04119 0.664932 8.48795C1.21818 7.93471 2.11516 7.93471 2.6684 8.48795L11.4444 17.264L27.3316 1.37685C27.8848 0.823603 28.7818 0.823603 29.3351 1.37685Z"
        fill="white"
      />
    </svg>
  );
};

export default CheckIcon;
