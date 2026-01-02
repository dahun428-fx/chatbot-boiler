import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const PortalToId = ({ targetId, children }: PropsWithChildren<{ targetId: string }>) => {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEl(document.getElementById(targetId));
  }, [targetId]);
  if (!el) return null;
  return createPortal(children, el);
};
