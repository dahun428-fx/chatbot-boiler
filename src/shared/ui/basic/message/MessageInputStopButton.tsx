import StopIcon from '../../icons/StopIcon';

type Props = {
  onClick: () => void;
};

export const MessageInputStopButton = ({ onClick }: Props) => {
  return (
    <button
      type="button"
      className="self-end pl-[10px] text-gray-150 hover:text-primary-1 disabled:cursor-not-allowed"
      aria-label="메시지 전송 중지"
      onClick={onClick}
    >
      <StopIcon />
    </button>
  );
};
