import ClosedIcon from '../icons/ClosedIcon';

const TabNavigation = ({ onClose }: TProps) => {
  return (
    <div className="fixed top-0 flex h-12 w-full items-center justify-center bg-white px-4 shadow">
      <div className="h-6 w-6" onClick={onClose}>
        <ClosedIcon />
      </div>
      <div className="flex-1" />
      <p className="body2 bg-gradient-to-r from-[rgba(255,133,0,1)] to-[rgba(99,207,232,1)] bg-clip-text text-transparent">
        AI Coach
      </p>
      <div className="flex-1" />
      <div className="h-6 w-6" />
    </div>
  );
};

export default TabNavigation;

type TProps = {
  onClose: () => void;
};
