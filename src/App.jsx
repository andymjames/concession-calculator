import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ItemGrid from './components/ItemGrid';
import CartView from './components/CartView';
import SettingsModal from './components/SettingsModal';
import HistoryDrawer from './components/HistoryDrawer';
import CashModal from './components/CashModal';
import { DEFAULT_ITEMS } from './data/defaultItems';
import { calculateCartTotals, formatCurrency } from './utils/currency';
import { CheckCircle2, Banknote } from 'lucide-react';

const MENU_STORAGE_KEY = 'concession_menu_items_v2';
const MENU_HASH_KEY = 'concession_menu_default_hash_v2';
const HISTORY_STORAGE_KEY = 'concession_order_history_v1';
const OUTDOOR_MODE_KEY = 'concession_outdoor_mode';
const CLEARANCE_MODE_KEY = 'concession_clearance_mode';

const DEFAULT_ITEMS_HASH = JSON.stringify(DEFAULT_ITEMS);

export default function App() {
  // Menu items state with automatic code-edit fingerprint detection
  const [items, setItems] = useState(() => {
    try {
      const savedHash = localStorage.getItem(MENU_HASH_KEY);
      const savedItems = localStorage.getItem(MENU_STORAGE_KEY);

      if (savedHash !== DEFAULT_ITEMS_HASH) {
        localStorage.setItem(MENU_HASH_KEY, DEFAULT_ITEMS_HASH);
        localStorage.setItem(MENU_STORAGE_KEY, DEFAULT_ITEMS_HASH);
        return DEFAULT_ITEMS;
      }

      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        return parsed.map((item) => ({
          ...item,
          clearancePrice:
            item.clearancePrice !== undefined ? item.clearancePrice : item.price,
        }));
      }

      return DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  // Active Cart State
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxRatePercent, setTaxRatePercent] = useState(0);

  // Outdoor High Contrast Mode
  const [outdoorMode, setOutdoorMode] = useState(() => {
    try {
      return localStorage.getItem(OUTDOOR_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Clearance Mode
  const [clearanceMode, setClearanceMode] = useState(() => {
    try {
      return localStorage.getItem(CLEARANCE_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Completed Sales History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal / Drawer visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  // Sync menu items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save menu items', e);
    }
  }, [items]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }, [history]);

  // Sync Outdoor High Contrast Mode
  useEffect(() => {
    try {
      localStorage.setItem(OUTDOOR_MODE_KEY, outdoorMode);
      if (outdoorMode) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } catch (e) {
      console.error('Failed to toggle outdoor mode', e);
    }
  }, [outdoorMode]);

  // Sync Clearance Mode
  useEffect(() => {
    try {
      localStorage.setItem(CLEARANCE_MODE_KEY, clearanceMode);
    } catch (e) {
      console.error('Failed to toggle clearance mode', e);
    }
  }, [clearanceMode]);

  // Sync active cart item prices when clearance mode or menu items change
  useEffect(() => {
    setCart((prevCart) =>
      prevCart.map((cartItem) => {
        const menuItem = items.find((i) => i.id === cartItem.id);
        if (!menuItem) return cartItem;
        const activePrice =
          clearanceMode && menuItem.clearancePrice !== undefined
            ? menuItem.clearancePrice
            : menuItem.price;
        return { ...cartItem, price: activePrice };
      }),
    );
  }, [clearanceMode, items]);

  /**
   * Cart Actions (Immutable state updates prevent StrictMode re-run double incrementing)
   */
  const handleAddToCart = (item) => {
    const activePrice =
      clearanceMode && item.clearancePrice !== undefined
        ? item.clearancePrice
        : item.price;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        return prevCart.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, price: activePrice, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prevCart, { ...item, price: activePrice, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  const cartTotals = calculateCartTotals(cart, taxRatePercent, discountPercent);

  /**
   * Complete Sale Action: Logs transaction to history and resets cart/grid state
   */
  const handleFinishSale = (cashDetails = null) => {
    if (cart.length === 0) return;

    const newOrder = {
      id: `order-${Date.now()}`,
      cart: [...cart],
      subtotal: cartTotals.subtotal,
      total: cartTotals.total,
      itemCount: cartTotals.totalItemCount,
      timestamp: new Date().toISOString(),
      ...(cashDetails
        ? {
            tendered: cashDetails.tendered,
            change: cashDetails.change,
          }
        : {}),
    };

    setHistory((prev) => [newOrder, ...prev]);
    setCart([]);
    setDiscountPercent(0);
    setIsCashModalOpen(false);
  };

  // Menu Management
  const handleUpdateItems = (newItemsList) => {
    setItems(newItemsList);
  };

  const handleResetDefaultItems = () => {
    setItems(DEFAULT_ITEMS);
    localStorage.setItem(MENU_HASH_KEY, DEFAULT_ITEMS_HASH);
    localStorage.setItem(MENU_STORAGE_KEY, DEFAULT_ITEMS_HASH);
    setIsSettingsOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app-container">
      <Header
        outdoorMode={outdoorMode}
        setOutdoorMode={setOutdoorMode}
        openHistory={() => setIsHistoryOpen(true)}
        openSettings={() => setIsSettingsOpen(true)}
        historyCount={history.length}
        clearanceMode={clearanceMode}
      />

      <main className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Main Item Grid */}
          <ItemGrid
            items={items}
            cart={cart}
            onAddToCart={handleAddToCart}
            clearanceMode={clearanceMode}
          />

          {/* Streamlined Checkout Total Card & Complete Sale Buttons */}
          <div style={styles.checkoutBox}>
            <div style={styles.totalRow}>
              <div style={styles.totalContainer}>
                <span style={styles.totalLabel}>
                  TOTAL DUE {cartTotals.totalItemCount > 0 && `(${cartTotals.totalItemCount} items)`}
                </span>
                <div style={styles.totalAmount}>
                  {formatCurrency(cartTotals.total)}
                </div>
              </div>
            </div>

            <div style={styles.checkoutBtnGroup}>
              <button
                className="touch-btn"
                style={{
                  ...styles.cashBtn,
                  ...(cart.length === 0 ? styles.btnDisabled : {}),
                }}
                onClick={() => setIsCashModalOpen(true)}
                disabled={cart.length === 0}
                aria-label="Pay with cash and calculate change"
              >
                <Banknote size={20} />
                <span>Cash</span>
              </button>

              <button
                className="touch-btn"
                style={{
                  ...styles.completeSaleBtn,
                  ...(cart.length === 0 ? styles.btnDisabled : {}),
                }}
                onClick={() => handleFinishSale()}
                disabled={cart.length === 0}
                aria-label="Complete sale for card or exact amount"
              >
                <CheckCircle2 size={20} />
                <span>Complete Sale</span>
              </button>
            </div>
          </div>

          {/* Streamlined Itemized Order View */}
          {cart.length > 0 && (
            <CartView
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
            />
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        items={items}
        onUpdateItems={handleUpdateItems}
        onResetDefaultItems={handleResetDefaultItems}
        clearanceMode={clearanceMode}
        onToggleClearanceMode={() => setClearanceMode((prev) => !prev)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      {/* Cash Payment & Change Calculator Modal */}
      <CashModal
        isOpen={isCashModalOpen}
        total={cartTotals.total}
        onClose={() => setIsCashModalOpen(false)}
        onCompleteSale={(details) => handleFinishSale(details)}
      />
    </div>
  );
}

const styles = {
  checkoutBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.85rem 1.15rem',
    border: '2px solid var(--accent-primary)',
    boxShadow: 'var(--shadow-md)',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    width: '100%',
  },
  totalLabel: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  totalAmount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '2.15rem',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1,
  },
  checkoutBtnGroup: {
    display: 'flex',
    gap: '0.65rem',
    width: '100%',
  },
  cashBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.85rem 0.75rem',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
    whiteSpace: 'nowrap',
  },
  completeSaleBtn: {
    flex: 1.4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.85rem 0.75rem',
    backgroundColor: 'var(--accent-success)',
    color: '#ffffff',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
    whiteSpace: 'nowrap',
  },
  btnDisabled: {
    backgroundColor: 'var(--bg-card-hover)',
    color: 'var(--text-muted)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};
