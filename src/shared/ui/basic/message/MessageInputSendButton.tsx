import { FC } from 'react';

import SendIcon from '@/shared/ui/icons/SendIcon';

interface MessageInputSendButtonProps {
  isValid: boolean;
  isLoading: boolean;
  isOpenAddressSelect: boolean;
  onClick: () => void;
}

export const MessageInputSendButton: FC<MessageInputSendButtonProps> = ({
  isValid,
  isLoading,
  isOpenAddressSelect,
  onClick,
}) => {
  return (
    <button
      type="submit"
      disabled={!isValid || isLoading || isOpenAddressSelect}
      className="self-end pl-[10px] disabled:cursor-not-allowed"
      aria-label="메시지 전송"
      onClick={onClick}
    >
      <SendIcon fill={isValid && !isLoading && !isOpenAddressSelect ? '#0F75BD' : '#c4c4c4'} />
    </button>
  );
};
