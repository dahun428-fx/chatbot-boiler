import { Skeleton as HeroSkeleton, SkeletonProps } from '@heroui/skeleton';

import { cn } from '../lib/common';

const Skeleton = ({ className, children, classNames, ...props }: SkeletonProps) => {
  return (
    <HeroSkeleton
      className={cn('bg-default-100', className)}
      classNames={{
        base: '!duration-1500 before:!duration-1500',
        ...classNames,
      }}
      {...props}
    >
      {children}
    </HeroSkeleton>
  );
};

export { Skeleton };
