import HistoryCloseIcon from '@/shared/ui/icons/HistoryCloseIcon';

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md hover:bg-gray-200"
      aria-label="대화이력 닫기"
    >
      <HistoryCloseIcon />
    </button>
  );
};

export { CloseButton };
