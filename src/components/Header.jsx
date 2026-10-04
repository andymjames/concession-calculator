import { History, Settings } from 'lucide-react';

export default function Header({ openHistory, openSettings, historyCount }) {
  return (
    <header style={styles.header}>
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>🍿</div>
        <div>
          <h1 style={styles.title}>Concession Stand</h1>
          <span style={styles.subtext}>Volunteer POS</span>
        </div>
      </div>

      <div style={styles.actionGroup}>
        <button
          className="touch-btn"
          style={styles.iconBtn}
          onClick={openHistory}
          title="View Sales History Log"
        >
          <div style={{ position: 'relative' }}>
            <History size={18} />
            {historyCount > 0 && (
              <span style={styles.badgeCount}>{historyCount}</span>
            )}
          </div>
        </button>

        <button
          className="touch-btn"
          style={styles.iconBtn}
          onClick={openSettings}
          title="Edit Menu & Prices"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.85rem',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoBadge: {
    fontSize: '1.3rem',
    lineHeight: 1,
    padding: '0.25rem 0.35rem',
    backgroundColor: 'var(--bg-card-hover)',
    borderRadius: 'var(--radius-md)',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.15',
  },
  subtext: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-card-hover)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
  badgeCount: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '1px 4px',
    borderRadius: '999px',
  },
};
