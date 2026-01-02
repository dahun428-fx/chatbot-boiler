/**
 * 날짜 구분선 컴포넌트
 *
 * 채팅에서 날짜가 바뀔 때 표시됩니다.
 * my-health-ai-coach-web의 DateDivider를 참고하여 구현했습니다.
 */
import { memo, useMemo } from 'react';

import type { Message } from '../types/message';

interface DateDividerProps {
    message: Message;
    prevMessage: Message | null;
}

/**
 * 날짜를 포맷팅합니다.
 * @example "2026년 1월 2일 목요일"
 */
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];

    return `${year}년 ${month}월 ${day}일 ${weekday}`;
};

/**
 * 두 timestamp가 같은 날짜인지 확인합니다.
 */
const isSameDate = (ts1: number, ts2: number): boolean => {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const DateDivider = memo(function DateDivider({
    message,
    prevMessage,
}: DateDividerProps) {
    const formattedDate = useMemo(() => formatDate(message.timestamp), [message.timestamp]);

    // 이전 메시지가 없거나 날짜가 다르면 표시
    const shouldShow = useMemo(() => {
        if (!prevMessage) return true;
        return !isSameDate(message.timestamp, prevMessage.timestamp);
    }, [message.timestamp, prevMessage]);

    if (!shouldShow) return null;

    return (
        <div className="mb-6 flex h-fit justify-center text-center">
            <p className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                {formattedDate}
            </p>
        </div>
    );
});
