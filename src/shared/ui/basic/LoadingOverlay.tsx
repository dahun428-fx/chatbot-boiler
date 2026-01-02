// src/components/common/LoadingOverlay.tsx
import { FC, ReactNode, useEffect, useState } from 'react';

import LoadingIcon from '@/shared/ui/icons/LoadingIcon';

type LoadingOverlayProps = {
  isLoading?: boolean;
  duration?: number;
  withBackground?: boolean;
  children?: ReactNode;
  headerHeight?: number; // 헤더 높이
  bottomHeight?: number; // 바텀 높이
  width?: string | number; // ✅ 너비 조정용 prop 추가
  maxWidth?: string | number; // ✅ 최대 너비 제약 추가
  zIndex?: number; // z-index 조정용 prop 추가
};

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isLoading = false,
  duration,
  withBackground = true,
  children,
  headerHeight = 0,
  bottomHeight = 0,
  width = '100%', // 기본은 전체 화면 너비
  maxWidth, // 필요 시 제약 가능
  zIndex = 5000, // 기본 z-index
}) => {
  const [visible, setVisible] = useState(isLoading);
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      if (duration) {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [isLoading, duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed absolute left-0 right-0 flex items-center justify-center ${
        withBackground ? 'bg-black bg-opacity-50' : 'bg-white bg-opacity-0'
      }`}
      style={{
        pointerEvents: 'all',
        top: headerHeight,
        bottom: bottomHeight,
        zIndex,
      }}
    >
      <div
        style={{
          width,
          maxWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children ?? <LoadingIcon />}
      </div>
    </div>
  );
};
