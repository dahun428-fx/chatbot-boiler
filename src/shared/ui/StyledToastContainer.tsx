import React, { FC } from 'react';
import { IconProps, Icons, ToastContainer, TypeOptions, Zoom } from 'react-toastify';

import CheckIcon from '@/shared/ui/icons/CheckIcon';

import { cn } from '../lib/common';

import 'react-toastify/dist/ReactToastify.css';
import { ToastCloseButton } from './ToastCloseButton';

type CloseButtonProps = {
  type: TypeOptions;
  closeToast: () => void;
};

const extendsIcon = {
  ...Icons,
  warning: () => <div>o{/* <AlertCircle /> */}</div>,
  success: () => (
    <div className="mb-1 flex h-10 w-10 items-center justify-center py-2.5">
      <CheckIcon />
    </div>
  ),
  default: Icons.info,
};

const CustomIcon: React.FC<IconProps> = ({ type, theme }) => {
  const Icon = extendsIcon[type];
  return (
    <div className="flex items-center">
      <Icon type={type} theme={theme} />
    </div>
  );
};

const CustomCloseButton: React.FC<CloseButtonProps> = ({ type, closeToast }) =>
  type !== 'success' && (
    <ToastCloseButton type={type} closeToast={closeToast} />
  );

type Props = {
  containerId?: 'default-toast-container' | 'sidebar-delete-toast';
  variant?: 'global' | 'inside';
};

export const StyledToastContainer: FC<Props> = ({
  containerId = 'default-toast-container',
  variant = 'global',
}) => {
  const isInside = variant === 'inside';
  if (containerId === 'sidebar-delete-toast') {
    return (
      <ToastContainer
        containerId={containerId}
        newestOnTop={false} // 👈 false로 해야 밑으로 쌓임
        position="top-center"
        transition={Zoom}
        hideProgressBar
        icon={false}
        closeOnClick={false}
        pauseOnHover
        limit={1}
        // ✅ 컨테이너 자체 클래스 (여기에 absolute 적용)
        className={() =>
          cn(
            'z-[9999] flex justify-center',
            isInside
              ? // 🔥 스크롤 영역 내부 하단 고정
              'absolute bottom-20 left-0 right-0 !m-0 p-2'
              : // 기존 글로벌 중앙 고정
              'fixed inset-0 items-center'
          )
        }
        // ✅ 토스트 카드 스타일
        toastClassName={() =>
          cn(
            'w-full max-w-md',
            'bg-[#80858A] text-white text-sm rounded-lg shadow-lg',
            'p-3 min-h-10 cursor-pointer flex items-center justify-between'
          )
        }
      />
    );
  }
  return (
    <ToastContainer
      icon={CustomIcon}
      position="top-center"
      theme="dark"
      className={() =>
        cn(
          'fixed inset-0 z-[9999] flex items-center justify-center', // 🔥 정중앙 배치
          '!px-6 sm:!w-auto sm:!px-1'
        )
      }
      toastClassName={() =>
        cn(
          'bg-default-800/90',
          'relative p-7 text-sm text-white min-h-14 rounded-lg overflow-hidden cursor-pointer',
          'flex flex-col justify-between items-center',
          'shadow-lg'
        )
      }
      closeButton={CustomCloseButton}
      transition={Zoom}
      pauseOnHover
      closeOnClick
      hideProgressBar
    />
  );
};