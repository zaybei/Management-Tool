import { useEffect, useRef } from 'react';

const useFocusTrap = (isOpen: boolean) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const trapFocus = (e: KeyboardEvent) => {
      const focusableElements = modalRef.current?.querySelectorAll(
        'a[href], button, input, textarea, select, details[open], [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusableElement = focusableElements?.[0] as HTMLElement;
      const lastFocusableElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    };

    // Focus on the first focusable element when the modal opens
    const initialFocusElement = modalRef.current?.querySelector(
      'a[href], button, input, textarea, select, details[open], [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    initialFocusElement?.focus();

    modalRef.current?.addEventListener('keydown', trapFocus);

    const currentModalRef = modalRef.current;

    return () => {
      currentModalRef?.removeEventListener('keydown', trapFocus);
    };
  }, [isOpen]);

  return modalRef;
};

export default useFocusTrap;
