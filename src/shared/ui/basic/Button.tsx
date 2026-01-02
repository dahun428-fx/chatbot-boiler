import { ButtonHTMLAttributes } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/common';

export const ButtonVariants = cva(
  `
  flex justify-center items-center body1 p-2
  `,
  {
    variants: {
      variant: {
        primary:
          'bg-primary-2 text-white rounded-[12px] shadow disabled:bg-gray-200 disabled:text-gray-300',
        white: 'bg-white text-gray-700 rounded-[20px]',
      },
      size: {
        default: 'h-fit w-fit',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof ButtonVariants>, 'variant'> {
  variant?: 'primary' | 'white' | null;
  children?: React.ReactElement | string | string[] | number;
}

const Button = ({ variant, size, children, className, ...props }: ButtonProps) => {
  return (
    <button type="button" className={cn([ButtonVariants({ variant, size }), className])} {...props}>
      {children}
    </button>
  );
};

export default Button;