import { TIconProps } from '@/shared/types/icon.type';

const StopIcon = ({ fill = '#B0B0B0', width = 32, height = 32 }: TIconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 32 32"
            fill={'currentColor'}
        >
            <rect width={width} height={height} rx="8" fill={'currentColor'} />
            <rect x="9" y="9" width="14" height="14" rx="3" fill="white" />
        </svg>
    );
};

export default StopIcon;
