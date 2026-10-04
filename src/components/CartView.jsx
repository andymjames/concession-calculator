import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) {
  if (!cart || cart.length === 0) return null;

  return (
    <div style={styles.cartContainer}>
      <div style={styles.cartHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={18} color="var(--accent-primary)" />
          <h2 style={styles.cartTitle}>Current Order Items ({cart.length})</h2>
        </div>
        <button
          className="touch-btn"
          style={styles.clearBtn}
          onClick={onClearCart}
        >
          Clear All
        </button>
      </div>

      {/* Cart Item List */}
      <div style={styles.itemList}>
        {cart.map((item) => (
          <div key={item.id} style={styles.itemRow}>
            <div style={styles.itemInfo}>
              <span style={styles.itemEmoji}>{item.emoji || '📌'}</span>
              <div>
                <div style={styles.itemName}>{item.name}</div>
                <div style={styles.itemUnitPrice}>
                  {formatCurrency(item.price)} each
                </div>
              </div>
            </div>

            <div style={styles.itemActions}>
              <div style={styles.qtyControlGroup}>
                <button
                  className="touch-btn"
                  style={styles.qtyBtn}
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span style={styles.qtyNumber}>{item.quantity}</span>
                <button
                  className="touch-btn"
                  style={styles.qtyBtn}
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div style={styles.linePrice}>
                {formatCurrency(item.price * item.quantity)}
              </div>

              <button
                className="touch-btn"
                style={styles.deleteBtn}
                onClick={() => onRemoveItem(item.id)}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  cartContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.85rem 1rem',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
  },
  cartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '0.6rem',
  },
  cartTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  clearBtn: {
    fontSize: '0.75rem',
    color: 'var(--accent-danger)',
    fontWeight: '700',
    padding: '0.25rem 0.55rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '0.1rem',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: '0.5rem 0.65rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    minWidth: 0,
  },
  itemEmoji: {
    fontSize: '1.15rem',
  },
  itemName: {
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemUnitPrice: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  qtyControlGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  qtyBtn: {
    padding: '0.3rem 0.45rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
  },
  qtyNumber: {
    padding: '0 0.4rem',
    fontWeight: '800',
    fontSize: '0.85rem',
    minWidth: '20px',
    textAlign: 'center',
  },
  linePrice: {
    fontWeight: '800',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    minWidth: '45px',
    textAlign: 'right',
  },
  deleteBtn: {
    color: 'var(--text-muted)',
    padding: '0.3rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
  },
};
