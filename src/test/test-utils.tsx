import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

// 테스트용 QueryClient 생성
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

interface AllTheProvidersProps {
    children: ReactNode;
}

// 모든 Provider를 포함한 Wrapper 컴포넌트
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    const testQueryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={testQueryClient}>
            <RecoilRoot>{children}</RecoilRoot>
        </QueryClientProvider>
    );
};

// 커스텀 render 함수
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export { customRender as render };
