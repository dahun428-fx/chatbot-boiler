import { TIconProps } from '@/shared/types/icon.type';

const LocationIcon = ({ fill = '#000', width = 16, height = 16 }: TIconProps) => {
  return (
    <svg
      width={`${width}`}
      height={`${height}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00003 14.4C8.00003 14.4 13.0087 9.94783 13.0087 6.6087C13.0087 3.84248 10.7663 1.60001 8.00003 1.60001C5.2338 1.60001 2.99133 3.84248 2.99133 6.6087C2.99133 9.94783 8.00003 14.4 8.00003 14.4Z"
        stroke={fill}
      />
      <path
        d="M9.60023 6.40011C9.60023 7.28376 8.88389 8.00011 8.00023 8.00011C7.11658 8.00011 6.40023 7.28376 6.40023 6.40011C6.40023 5.51645 7.11658 4.80011 8.00023 4.80011C8.88389 4.80011 9.60023 5.51645 9.60023 6.40011Z"
        stroke={fill}
      />
    </svg>
  );
};

export default LocationIcon;
