import PlusIcon from '@/shared/ui/icons/PlusIcon';

import Button from '../Button';

interface AttachmentButtonProps {
  onClick: () => void;
}

export const AttachmentButton = ({ onClick }: AttachmentButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={null}
      className="min-h-fit min-w-fit rounded-full bg-white p-0"
    >
      <PlusIcon />
    </Button>
  );
};
