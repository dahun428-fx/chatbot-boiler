import { TIconProps } from '@/shared/types/icon.type';

const DetailIcon = ({ fill = '#000', width = 24, height = 24, iconClassName }: TIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill={fill}
    >
      <path
        d="M3.33333 14.9741C2.96667 14.9741 2.65278 14.8436 2.39167 14.5825C2.13056 14.3213 2 14.0075 2 13.6408V4.30745C2 3.94079 2.13056 3.6269 2.39167 3.36579C2.65278 3.10468 2.96667 2.97412 3.33333 2.97412H8V4.30745H3.33333V13.6408H12.6667V8.97412H14V13.6408C14 14.0075 13.8694 14.3213 13.6083 14.5825C13.3472 14.8436 13.0333 14.9741 12.6667 14.9741H3.33333ZM6.46667 11.4408L5.53333 10.5075L11.7333 4.30745H9.33333V2.97412H14V7.64079H12.6667V5.24079L6.46667 11.4408Z"
        fill="black"
      />
    </svg>
  );
};

export default DetailIcon;
