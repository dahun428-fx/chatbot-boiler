/* eslint-disable react-refresh/only-export-components */
import { createContext, FC, ReactNode, useContext, useState } from 'react';

export type StreamingAnimationType = 'typing' | 'fade-in' | 'none';
export type AnimationEasing = 'ease-out' | 'ease-in' | 'ease-in-out' | 'linear';

interface StreamingAnimationContextType {
    animationType: StreamingAnimationType;
    setAnimationType: (type: StreamingAnimationType) => void;
    animationDuration: number; // ms
    setAnimationDuration: (duration: number) => void;
    animationEasing: AnimationEasing;
    setAnimationEasing: (easing: AnimationEasing) => void;
}

const StreamingAnimationContext = createContext<StreamingAnimationContextType>({
    animationType: 'fade-in',
    setAnimationType: () => { },
    animationDuration: 600,
    setAnimationDuration: () => { },
    animationEasing: 'ease-out',
    setAnimationEasing: () => { },
});

export const useStreamingAnimation = () => useContext(StreamingAnimationContext);

interface ProviderProps {
    children: ReactNode;
    initialType?: StreamingAnimationType;
    initialDuration?: number;
    initialEasing?: AnimationEasing;
}

export const StreamingAnimationProvider: FC<ProviderProps> = ({
    children,
    initialType = 'fade-in',
    initialDuration = 600,
    initialEasing = 'ease-out',
}) => {
    const [animationType, setAnimationType] = useState<StreamingAnimationType>(initialType);
    const [animationDuration, setAnimationDuration] = useState<number>(initialDuration);
    const [animationEasing, setAnimationEasing] = useState<AnimationEasing>(initialEasing);

    return (
        <StreamingAnimationContext.Provider value={{
            animationType, setAnimationType,
            animationDuration, setAnimationDuration,
            animationEasing, setAnimationEasing,
        }}>
            {children}
        </StreamingAnimationContext.Provider>
    );
};
