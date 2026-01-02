import { useState, useCallback } from 'react';

interface UseDynamicFormReturn {
  isOpen: boolean;
  item: any | null;
  openCreate: () => void;
  openEdit: (item: any) => void;
  close: () => void;
}

export function useDynamicForm(): UseDynamicFormReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<any | null>(null);

  const openCreate = useCallback(() => {
    setItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((editItem: any) => {
    setItem(editItem);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItem(null);
  }, []);

  return {
    isOpen,
    item,
    openCreate,
    openEdit,
    close,
  };
}
