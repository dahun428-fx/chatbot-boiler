import { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';

import { isShowStopButtonState } from '@/features/chat';
import { SendMessageParams, useMessageInput } from '@/features/chat/hooks/use-message-input';
import { cn } from '@/shared/lib/common';

import { MessageInputField } from './message/MessageInputField';

export type MessageInputHandle = {
    sendMessage: (params: SendMessageParams) => void;
};

type TProps = {
    disabled?: boolean;
    placeholder?: string;
    isOpenAddressSelect: boolean;
};

export const MessageInputNonStreaming = forwardRef<MessageInputHandle, TProps>(
    ({ placeholder, isOpenAddressSelect, disabled }, ref) => {
        const { register, onSubmit, isValid, isLoading, formRef, onStop } = useMessageInput(ref);
        const isShowStopButton = useRecoilValue(isShowStopButtonState);

        return (
            <form
                onSubmit={onSubmit}
                ref={formRef}
                className={cn('md:mx-auto md:max-w-tabletMsg', 'lg:mx-auto lg:max-w-desktopMsg')}
            >
                {/* ✅ 선택: 하단 고정 효과를 원하면 상위 래퍼에 sticky/fixed 추가 */}
                <div
                    className={cn(
                        'sticky bottom-0 left-0 right-0 z-20 mt-[3px] bg-white/95 pb-[21px] backdrop-blur',
                        'rounded-t-3xl bg-white shadow-none'
                    )}
                    style={{
                        boxShadow: '0 -4px 14px rgba(0,0,0,0.04), 4px 0 14px rgba(0,0,0,0.04)',
                    }}
                >
                    {/* ✅ 핵심: justify-start -> justify-end 로 바꿔 '위로만' 커지게 */}
                    <div className="box-border flex max-h-[150px] w-full flex-col justify-end rounded-t-3xl bg-white px-4">
                        {/* ✅ 행(row)도 하단 정렬 */}
                        <div className="flex items-end gap-2">
                            <MessageInputField
                                onStop={onStop}
                                register={register}
                                isValid={isValid}
                                isLoading={isLoading}
                                disabled={disabled}
                                placeholder={placeholder}
                                isOpenAddressSelect={isOpenAddressSelect}
                                isShowStopButton={isShowStopButton}
                            />
                        </div>

                        {/* 안내 문구는 바닥 라인에 붙어 있게 유지 */}
                        <p className="mt-4 w-full text-center text-[10.5px] font-medium text-gray-500">
                            인공지능을 활용한 해석이므로, 정확한 진단은 의료 기관에 확인하세요.
                        </p>
                    </div>
                </div>
            </form>
        );
    }
);

export default MessageInputNonStreaming;
