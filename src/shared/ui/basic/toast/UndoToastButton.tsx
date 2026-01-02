import { FC } from 'react';

interface UndoToastButtonProps {
  onClick: () => void;
  label: string;
}

export const UndoToastButton: FC<UndoToastButtonProps> = ({ onClick, label }) => {
  return (
    <button onClick={onClick}>{label}</button>
  );
};
