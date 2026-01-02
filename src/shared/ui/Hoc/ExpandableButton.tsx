import { FC } from 'react';

import ArrowDownIcon from '../icons/ArrowDownIcon';
import ArrowUpIcon from '../icons/ArrowUpIcon';

interface ExpandableButtonProps {
  expanded: boolean;
  onClick: () => void;
}

export const ExpandableButton: FC<ExpandableButtonProps> = ({ expanded, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-[10px]"
      style={{ color: '#80858A' }}
    >
      더보기
      {expanded ? (
        <ArrowUpIcon width={8} height={8} fill="#80858A" />
      ) : (
        <ArrowDownIcon width={8} height={8} fill="#80858A" />
      )}
    </button>
  );
};
