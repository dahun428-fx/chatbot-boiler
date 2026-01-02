import { TIconProps } from '@/shared/types/icon.type';

const ArrowUpIcon = ({ fill = '#000', width = 24, height = 24 }: TIconProps) => {
    return (
        <svg
            width={`${width}`}
            height={`${height}`}
            viewBox="0 0 13 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.38607 0.250161C6.51868 0.250161 6.64585 0.302839 6.73962 0.396613L12.573 6.22994C12.7682 6.4252 12.7682 6.74179 12.573 6.93705C12.3777 7.13231 12.0611 7.13231 11.8658 6.93705L6.38607 1.45727L0.906288 6.93705C0.711026 7.13231 0.394443 7.13231 0.199181 6.93705C0.00391895 6.74179 0.00391898 6.4252 0.199181 6.22994L6.03251 0.396613C6.12628 0.302839 6.25346 0.250161 6.38607 0.250161Z"
                fill={fill}
            />
        </svg>
    );
};

export default ArrowUpIcon;
