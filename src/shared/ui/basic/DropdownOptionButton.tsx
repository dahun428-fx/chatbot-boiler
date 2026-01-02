import { FC } from 'react';

import { cn } from '@/shared/lib/common';

type Option = { label: string; value: string; disabled?: boolean };

const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn('h-5 w-5', className)}>
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface DropdownOptionButtonProps {
  option: Option;
  idx: number;
  selected: boolean;
  active: boolean;
  onClick: (opt: Option) => void;
  onMouseEnter: (idx: number) => void;
}

export const DropdownOptionButton: FC<DropdownOptionButtonProps> = ({
  option,
  idx,
  selected,
  active,
  onClick,
  onMouseEnter,
}) => {
  return (
    <button
      key={option.value}
      id={`opt-${idx}`}
      data-idx={idx}
      role="option"
      aria-selected={selected}
      onMouseEnter={() => onMouseEnter(idx)}
      onClick={() => onClick(option)}
      disabled={option.disabled}
      className={cn(
        'block w-full px-5 py-4 text-left text-[18px] leading-6 transition-colors',
        active ? 'bg-gray-50' : 'bg-white',
        selected ? 'font-semibold text-gray-900' : 'text-gray-800',
        option.disabled && 'cursor-not-allowed text-gray-300'
      )}
    >
      <span className="flex items-center gap-2 text-[16px]">
        {selected && (active || !option.disabled) && <CheckIcon className="text-gray-900" />}
        {option.label}
      </span>
    </button>
  );
};
