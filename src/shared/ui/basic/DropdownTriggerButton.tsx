import { FC } from 'react';

import { cn } from '@/shared/lib/common';

import ArrowDownIcon from '../icons/ArrowDownIcon';

type Option = { label: string; value: string; disabled?: boolean };

interface DropdownTriggerButtonProps {
  value: Option | null;
  placeholder?: string;
  disabled?: boolean;
  onClick: () => void;
  open: boolean;
  className?: string;
}

export const DropdownTriggerButton: FC<DropdownTriggerButtonProps> = ({
  value,
  placeholder = '선택하세요',
  disabled,
  onClick,
  open,
  className,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative flex h-10 w-full items-center justify-between rounded-[12px] border border-gray-100 px-3 font-medium',
        disabled ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-900',
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <span className={cn('text-body truncate', disabled ? 'text-gray-300' : 'text-gray-900')}>
        {value?.label || placeholder}
      </span>
      <ArrowDownIcon
        width={20}
        height={20}
        iconClassName={disabled ? 'text-gray-200' : 'text-black'}
      />
    </button>
  );
};
