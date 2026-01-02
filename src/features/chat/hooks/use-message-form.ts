import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { z } from 'zod';

import { inputFormHeightState } from '@/features/layout/atom/layout';
import { useBindFormHeightToAtom } from '@/features/layout/hooks/use-message-form-height';

const messageSchema = z.object({
    message: z.string().min(1, '메시지를 입력해주세요'),
});

export type MessageFormData = z.infer<typeof messageSchema>;

/**
 * 메시지 입력 폼 상태 관리 훅
 *
 * - react-hook-form을 사용한 폼 상태 관리
 * - zod를 사용한 유효성 검증
 * - 폼 높이 측정 및 atom 동기화
 */
export function useMessageForm() {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isValid },
    } = useForm<MessageFormData>({
        resolver: zodResolver(messageSchema),
        defaultValues: { message: '' },
    });

    const setFormHeight = useSetRecoilState(inputFormHeightState);
    const formRef = useBindFormHeightToAtom<HTMLFormElement>(setFormHeight, {
        extraOffset: 0,
        initialMeasureDelayMs: 50,
    });

    /** 메시지 입력값 초기화 */
    const clearMessage = useCallback(() => {
        setValue('message', '');
    }, [setValue]);

    /** 메시지 입력값 설정 */
    const setMessage = useCallback(
        (value: string) => {
            setValue('message', value);
        },
        [setValue]
    );

    return {
        register,
        handleSubmit,
        isValid,
        formRef,
        clearMessage,
        setMessage,
        watchMessage: watch('message'),
    };
}
