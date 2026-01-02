import { TIconProps } from '@/shared/types/icon.type';

const LogoIcon = ({ width = 25, height = 25 }: TIconProps) => {
  return (
    <svg
      width={`${width}`}
      height={`${height}`}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12.0898" cy="12.2686" r="12" fill="#66A8D0" />
      <path
        d="M14.2636 12.2683C14.9617 12.2683 15.5276 11.7024 15.5276 11.0043C15.5276 10.3062 14.9617 9.74023 14.2636 9.74023C13.5655 9.74023 12.9995 10.3062 12.9995 11.0043C12.9995 11.7024 13.5655 12.2683 14.2636 12.2683Z"
        fill="white"
      />
      <path
        d="M9.91833 12.2683C10.6164 12.2683 11.1824 11.7024 11.1824 11.0043C11.1824 10.3062 10.6164 9.74023 9.91833 9.74023C9.22022 9.74023 8.6543 10.3062 8.6543 11.0043C8.6543 11.7024 9.22022 12.2683 9.91833 12.2683Z"
        fill="white"
      />
    </svg>
  );
};

export default LogoIcon;
