import { Calendar, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) {
  if (!isOpen) return null;

  const totalRevenue = history.reduce(
    (sum, order) => sum + (order.total || 0),
    0,
  );
  const totalItemsSold = history.reduce(
    (sum, order) => sum + (order.itemCount || 0),
    0,
  );

  // Calculate item popularity counts
  const itemPopularity = {};
  history.forEach((order) => {
    (order.cart || []).forEach((item) => {
      const name = item.name;
      itemPopularity[name] = (itemPopularity[name] || 0) + item.quantity;
    });
  });

  const sortedPopularity = Object.entries(itemPopularity).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--accent-primary)" />
            <h2 style={styles.title}>Daily Sales Log</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Daily Stats Summary Banner */}
        <div style={styles.statsBanner}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Sales</span>
            <span style={styles.statValue}>{formatCurrency(totalRevenue)}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Orders</span>
            <span style={styles.statValue}>{history.length}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Items Sold</span>
            <span style={styles.statValue}>{totalItemsSold}</span>
          </div>
        </div>

        {/* Top Seller Insights */}
        {sortedPopularity.length > 0 && (
          <div style={styles.popularityCard}>
            <span style={styles.popTitle}>Item Totals:</span>
            <div style={styles.popRow}>
              {sortedPopularity.map(([name, qty]) => (
                <span key={name} style={styles.popTag}>
                  {name}: <strong>{qty}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History List */}
        <div style={styles.list}>
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <ShoppingBag size={40} color="var(--text-muted)" />
              <p style={{ marginTop: '0.5rem', fontWeight: '600' }}>
                No completed sales yet today
              </p>
            </div>
          ) : (
            history.map((order, idx) => {
              const formattedTime = new Date(
                order.timestamp,
              ).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div key={order.id || idx} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.timeTag}>
                      #{history.length - idx} • {formattedTime}
                    </span>
                    <strong style={styles.orderTotal}>
                      {formatCurrency(order.total)}
                    </strong>
                  </div>

                  <div style={styles.itemsSummary}>
                    {(order.cart || []).map((item, i) => (
                      <span key={i} style={styles.itemBadge}>
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>

                  {order.tendered > 0 && (
                    <div style={styles.tenderDetails}>
                      <span>Paid: {formatCurrency(order.tendered)}</span>
                      <span>Change: {formatCurrency(order.change)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div style={styles.footer}>
            <button
              style={styles.clearHistoryBtn}
              onClick={() => {
                if (
                  confirm(
                    "Clear today's sales log? This action cannot be undone.",
                  )
                ) {
                  onClearHistory();
                }
              }}
            >
              <Trash2 size={16} /> Clear Sales Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  drawer: {
    backgroundColor: 'var(--bg-secondary)',
    width: '100%',
    maxWidth: '480px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    color: 'var(--text-secondary)',
    padding: '0.35rem',
  },
  statsBanner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--accent-success)',
  },
  popularityCard: {
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
  },
  popTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  popRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.35rem',
  },
  popTag: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.45rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-secondary)',
  },
  orderCard: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  orderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeTag: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--accent-success)',
  },
  itemsSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
  },
  itemBadge: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
  tenderDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '0.35rem',
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
  },
  clearHistoryBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.65rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--accent-danger)',
    fontWeight: '700',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
  },
};
