import { cn } from '@/shared/lib/common';

import ArrowDownIcon from '../icons/ArrowDownIcon';

const Select = ({ value, options, onChange, disabled, className, placeholder }: TProps) => {
  return (
    <div
      className={cn(
        'relative flex h-10 items-center justify-between rounded-[12px] border border-gray-100 px-3 font-medium',
        className
      )}
    >
      <p className={cn('text-body', disabled ? 'text-gray-200' : 'text-gray-900')}>
        {value?.label || placeholder}
      </p>
      <ArrowDownIcon iconClassName={disabled ? 'text-gray-100' : 'text-black'} />
      <select
        value={value?.value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'absolute left-0 top-0 z-[1000] h-full w-full cursor-pointer opacity-0',
          className
        )}
      >
        <option value="" disabled hidden>
          {placeholder || 'Select an option'}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;

type TProps = {
  value: { label: string; value: string } | null;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};
