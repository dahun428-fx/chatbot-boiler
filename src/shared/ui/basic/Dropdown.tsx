// components/basic/Dropdown.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

import { cn } from '@/shared/lib/common';

import { DropdownOptionButton } from './DropdownOptionButton';
import { DropdownTriggerButton } from './DropdownTriggerButton';

type Option = { label: string; value: string; disabled?: boolean };

type Props = {
  value: Option | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  startIndex?: number; // 시작 인덱스 (기본값: -1 → 미선택)
  title?: string; // 모달 상단 제목 (ex. "동/읍/면")
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn('h-5 w-5', className)}>
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Dropdown = ({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  disabled,
  className,
  startIndex = -1,
  title = '',
}: Props) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(startIndex);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value?.value),
    [options, value]
  );

  /** 리스트 내 특정 인덱스로 스크롤 (기본 중앙 정렬) */
  const scrollIntoView = useCallback(
    (idx: number, align: 'start' | 'center' | 'end' = 'center') => {
      const root = listRef.current;
      const item = root?.querySelector<HTMLButtonElement>(`[data-idx="${idx}"]`);
      if (!root || !item) return;

      const rTop = root.scrollTop;
      const rH = root.clientHeight;
      const iTop = item.offsetTop;
      const iH = item.offsetHeight;

      let nextTop = iTop; // start
      if (align === 'center') nextTop = iTop - (rH - iH) / 2;
      if (align === 'end') nextTop = iTop - (rH - iH);

      // 클램핑
      nextTop = Math.max(0, Math.min(nextTop, root.scrollHeight - rH));

      // 이미 화면 안에 있으면 스킵
      const rBot = rTop + rH;
      const iBot = iTop + iH;
      const alreadyVisible = iTop >= rTop && iBot <= rBot;
      if (!alreadyVisible) root.scrollTop = nextTop;
    },
    []
  );

  /** 모달이 열릴 때 선택값(또는 시작 인덱스)으로 포커스/스크롤 이동 */
  useEffect(() => {
    if (!open) return;
    let initial = -1;

    if (selectedIndex >= 0) {
      initial = selectedIndex;
    } else if (startIndex >= 0) {
      initial = startIndex;
    }

    setActiveIndex(initial);

    // 렌더 다음 프레임에 포커스 및 스크롤
    requestAnimationFrame(() => {
      listRef.current?.focus({ preventScroll: true });
      if (initial >= 0) scrollIntoView(initial, 'center');
    });
  }, [open, selectedIndex, startIndex, scrollIntoView]);

  /** 키보드 네비게이션 */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => {
          const next = Math.min((i < 0 ? -1 : i) + 1, options.length - 1);
          scrollIntoView(next);
          return next;
        });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => {
          const prev = Math.max((i < 0 ? 1 : i) - 1, 0);
          scrollIntoView(prev);
          return prev;
        });
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        const opt = options[activeIndex];
        if (!opt?.disabled) {
          onChange(opt.value);
          setOpen(false);
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, options.length, activeIndex, onChange, scrollIntoView, options]);

  const handleSelect = (opt: Option) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <>
      {/* 트리거 버튼 */}
      <DropdownTriggerButton
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onClick={() => setOpen(true)}
        open={open}
        className={className}
      />

      {/* 모달(포털) */}
      {open &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[1000]"
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Panel */}
            <div
              className="fixed inset-x-3 left-1/2 top-1/2 z-50 max-h-[70vh] w-[calc(100vw-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-75 px-4 py-4">
                {activeIndex < 0 && <CheckIcon className="text-gray-900" />}
                <span className="text-[18px] font-semibold text-gray-900">{title}</span>
              </div>

              {/* List */}
              <div
                ref={listRef}
                tabIndex={-1} // 포커스 가능: 키보드 탐색 편의
                className="max-h-[calc(70vh-56px)] overflow-y-auto py-2"
                role="listbox"
                aria-activedescendant={activeIndex >= 0 ? `opt-${activeIndex}` : undefined}
              >
                {options.map((opt, idx) => {
                  const selected = opt.value === value?.value;
                  const active = idx === activeIndex;
                  return (
                    <DropdownOptionButton
                      key={opt.value}
                      option={opt}
                      idx={idx}
                      selected={selected}
                      active={active}
                      onClick={handleSelect}
                      onMouseEnter={setActiveIndex}
                    />
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Dropdown;
