import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import ErrorPage from '@/shared/ui/error-pages/ErrorPage';
import NotFoundPage from '@/shared/ui/error-pages/NotFoundPage';
import ModalOutlet from '@/ui/ModalOutlet';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ModalOutlet />
      {import.meta.env.MODE === 'local-dev' && <TanStackRouterDevtools />}
    </>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});
