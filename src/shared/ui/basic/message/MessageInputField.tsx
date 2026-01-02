import { useCallback, useEffect, useRef } from 'react';
import { UseFormRegister } from 'react-hook-form';

import { cn, isMobile } from '@/shared/lib/common';

import { MessageInputSendButton } from './MessageInputSendButton';
import { MessageInputStopButton } from './MessageInputStopButton';

interface MessageInputFieldProps {
  register: UseFormRegister<{ message: string }>;
  isValid: boolean;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  isOpenAddressSelect: boolean;
  /** 엔터키로 전송 여부 (기본: 데스크톱=true, 모바일=false) */
  submitOnEnter?: boolean;
  /** 최대 표시 줄 수 (기본 2줄) */
  maxLines?: number;
  onStop: () => void; // 추가: 중지 핸들러
  isShowStopButton: boolean; // 추가: 중지 버튼 표시 여부
}

const INPUT_MAX_HEIGHT = 34;

export const MessageInputField = ({
  register,
  isValid,
  isLoading,
  disabled,
  placeholder,
  isOpenAddressSelect,
  submitOnEnter,
  maxLines = 2,
  onStop,
  isShowStopButton,
}: MessageInputFieldProps) => {
  // 모바일에서는 Enter가 줄바꿈, 데스크톱에서는 전송
  const shouldSubmitOnEnter = submitOnEnter ?? !isMobile();

  const { ref: rhfRef, onChange, ...field } = register('message');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    rhfRef(el);
  };

  const getMaxHeight = useCallback(
    (el: HTMLTextAreaElement) => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '22'); // leading과 일치
      return lineHeight * maxLines;
    },
    [maxLines]
  );

  const resizeUpToMax = useCallback(
    (el: HTMLTextAreaElement) => {
      const maxH = getMaxHeight(el);
      el.style.height = `${INPUT_MAX_HEIGHT}px`;
      const next = Math.min(el.scrollHeight, maxH);
      el.style.height = `${next}px`;
      el.style.maxHeight = `${maxH}px`;
      // 내부 스크롤은 유지하되, 스크롤바는 CSS로 숨김
      el.scrollTop = el.scrollHeight; // caret 항상 보이게
    },
    [getMaxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) resizeUpToMax(textareaRef.current);
  }, [resizeUpToMax]);

  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
    const el = e.currentTarget;
    resizeUpToMax(el);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange(e as any);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (!shouldSubmitOnEnter) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement | undefined)?.requestSubmit();
    }
  };
  // React 인라인 스타일 (Firefox/IE-Edge 대응 + 동작 유지)
  const noScrollbarStyle: React.CSSProperties = {
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge(레거시)
  };

  useEffect(() => {
    const form = textareaRef.current?.form;
    if (!form) return;

    const onFormSubmit = () => {
      const el = textareaRef.current;
      if (!el) return;
      // ✅ 제출 직후 사이즈 초기화
      el.style.height = `${INPUT_MAX_HEIGHT}px`;
      const maxH = getMaxHeight(el);
      el.style.maxHeight = `${maxH}px`;
      el.scrollTop = 0; // 내부 스크롤도 원복
    };

    form.addEventListener('submit', onFormSubmit);
    return () => form.removeEventListener('submit', onFormSubmit);
  }, [getMaxHeight]);

  return (
    <div
      className={cn(
        // ✅ 하단 정렬 유지 → 커질 때 위로만 확장되는 시각 효과
        'relative top-[6px] flex min-h-[44px] flex-1 items-end gap-2 rounded-[12px] border border-gray-200 bg-white px-4 py-2',
        { 'border-1.5 border-original-500': isValid && !isLoading && !isOpenAddressSelect }
      )}
    >
      <textarea
        {...field}
        name="message"
        ref={setRefs}
        disabled={disabled || isLoading || isOpenAddressSelect}
        placeholder={placeholder ?? '무엇이든 물어보세요'}
        rows={1}
        onInput={handleInput}
        onKeyDown={onKeyDown}
        autoComplete="off"
        style={noScrollbarStyle}
        className={cn(
          // ✅ 자동 확장 + 최대 2줄
          'h-auto w-full resize-none bg-white text-base font-medium leading-[22px] text-black',
          'placeholder:text-gray-300 focus:outline-none',
          // ✅ 보이는 높이는 2줄까지만, 내부 스크롤은 동작(스크롤바는 숨김)
          'no-scrollbar max-h-[44px] overflow-y-auto',
          // ✅ 하단 베이스라인에 딱 붙도록 패딩 제거
          'pt-[5px]'
        )}
      />
      {isLoading && isShowStopButton ? (
        <MessageInputStopButton onClick={onStop} />
      ) : (
        <MessageInputSendButton
          isValid={isValid}
          isLoading={isLoading}
          isOpenAddressSelect={isOpenAddressSelect}
          onClick={() => {
            /* handle submit */
          }}
        />
      )}
    </div>
  );
};
