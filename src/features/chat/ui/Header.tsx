import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';

import { headerHeightState } from '@/features/layout/atom/layout';
import { useBindHeightToAtom } from '@/features/layout/hooks/use-bind-height';

type Props = {
  toggleSideNav?: () => void;
};

const Header = ({ toggleSideNav }: Props) => {
  const { t } = useTranslation('chatHeader');
  const setHeaderHeight = useSetRecoilState(headerHeightState);
  const headerRef = useBindHeightToAtom<HTMLDivElement>(setHeaderHeight);

  return (
    <div
      ref={headerRef}
      className="header-container fixed left-0 top-0 z-10 flex h-[3.5rem] w-full items-center justify-center border-b border-b-gray-100 bg-white px-4"
    >
      <h1 className="text-lg font-semibold">
        {t('aiCoachTitle', 'AI 챗봇')}
      </h1>
    </div>
  );
};

export { Header };
