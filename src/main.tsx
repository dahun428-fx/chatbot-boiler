import { StrictMode, Suspense } from 'react';
import { HeroUIProvider } from '@heroui/system';
import './i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';
import { routeTree } from './routeTree.gen';
import { StreamingAnimationProvider } from './shared/context/StreamingAnimationContext';
import { LoadingOverlay } from './shared/ui/basic/LoadingOverlay';
import { StyledToastContainer } from './shared/ui/StyledToastContainer';

const basepath = import.meta.env.VITE_ROUTER_BASE || '';

// Set up a Router instance
const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      {import.meta.env.MODE === 'local-dev' && <ReactQueryDevtools initialIsOpen={false} />}
      <StyledToastContainer />
    </>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <HeroUIProvider>
        <QueryClientProvider client={queryClient}>
          <StreamingAnimationProvider initialType="fade-in" initialDuration={600}>
            <Suspense fallback={<LoadingOverlay isLoading={true} />}>
              <App />
            </Suspense>
          </StreamingAnimationProvider>
        </QueryClientProvider>
      </HeroUIProvider>
    </RecoilRoot>
  </StrictMode>
);
