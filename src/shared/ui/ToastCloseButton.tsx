import { FC } from 'react';
import { Button } from '@heroui/button';
import { TypeOptions } from 'react-toastify';

interface ToastCloseButtonProps {
  type: TypeOptions;
  closeToast: () => void;
}

export const ToastCloseButton: FC<ToastCloseButtonProps> = ({ type, closeToast }) => {
  return (
    type !== 'success' && (
      <Button
        isIconOnly
        onPress={closeToast}
        className="ms-1 h-6 w-6 min-w-0 flex-shrink-0 rounded-full bg-transparent"
      >
        {/* <CloseOutline2 color="#F0F0F0" strokeWidth="1.5" /> */}
      </Button>
    )
  );
};
