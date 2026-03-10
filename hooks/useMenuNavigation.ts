import { useEffect, useRef, useCallback } from 'react';

export interface UseMenuNavigationOptions {
  /**
   * Whether the menu is currently open
   */
  isOpen: boolean;

  /**
   * Callback to close the menu
   */
  onClose: () => void;

  /**
   * Element that triggered the menu (for focus return)
   */
  triggerRef?: React.RefObject<HTMLElement>;

  /**
   * Auto-focus first item when menu opens
   * @default true
   */
  autoFocusFirst?: boolean;

  /**
   * Selector for focusable items within the menu
   * @default '[role="menuitem"]:not([disabled]), a:not([disabled]), button:not([disabled])'
   */
  itemSelector?: string;
}

/**
 * useMenuNavigation - Reusable hook for accessible menu/dropdown navigation
 * 
 * Features:
 * - Arrow key navigation (Up/Down to move, wraps at edges)
 * - Escape to close and return focus to trigger
 * - Auto-focus first item on open
 * - Tab closes menu (allows normal tab flow)
 * - Focus trapping within menu items
 * 
 * Based on Sales Center's proven accessibility patterns.
 * 
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   const menuRef = useMenuNavigation({
 *     isOpen,
 *     onClose: () => setIsOpen(false),
 *     triggerRef,
 *   });
 *   
 *   return (
 *     <>
 *       <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
 *         Menu
 *       </button>
 *       {isOpen && (
 *         <div ref={menuRef} role="menu">
 *           <button role="menuitem">Item 1</button>
 *           <button role="menuitem">Item 2</button>
 *         </div>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useMenuNavigation({
  isOpen,
  onClose,
  triggerRef,
  autoFocusFirst = true,
  itemSelector = '[role="menuitem"]:not([disabled]), a:not([disabled]), button:not([disabled])',
}: UseMenuNavigationOptions) {
  const menuRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef<number>(0);

  /**
   * Get all focusable items in the menu
   */
  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (!menuRef.current) return [];
    return Array.from(menuRef.current.querySelectorAll(itemSelector));
  }, [itemSelector]);

  /**
   * Focus item at given index
   */
  const focusItem = useCallback((index: number) => {
    const items = getFocusableItems();
    if (items.length === 0) return;

    // Wrap around
    const wrappedIndex = ((index % items.length) + items.length) % items.length;
    items[wrappedIndex]?.focus();
    focusedIndexRef.current = wrappedIndex;
  }, [getFocusableItems]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      const items = getFocusableItems();
      if (items.length === 0) return;

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          focusItem(focusedIndexRef.current + 1);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          focusItem(focusedIndexRef.current - 1);
          break;
        }
        case 'Home': {
          event.preventDefault();
          focusItem(0);
          break;
        }
        case 'End': {
          event.preventDefault();
          focusItem(items.length - 1);
          break;
        }
        case 'Escape': {
          event.preventDefault();
          onClose();
          triggerRef?.current?.focus();
          break;
        }
        case 'Tab': {
          // Allow Tab to close menu and continue normal tab flow
          event.preventDefault();
          onClose();
          break;
        }
      }
    },
    [isOpen, getFocusableItems, focusItem, onClose, triggerRef]
  );

  /**
   * Auto-focus first item when menu opens
   */
  useEffect(() => {
    if (isOpen && autoFocusFirst) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        focusItem(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoFocusFirst, focusItem]);

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    if (!isOpen) {
      focusedIndexRef.current = 0;
      return;
    }

    const menu = menuRef.current;
    if (!menu) return;

    menu.addEventListener('keydown', handleKeyDown);
    return () => {
      menu.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  /**
   * Click outside to close
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  return menuRef;
}
