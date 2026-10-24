import React, { useState, useEffect, useRef } from 'react';
import { Banknote, CheckCircle2, X } from 'lucide-react';
import {
  formatCurrency,
  calculateChange,
  getQuickBillSuggestions,
} from '../utils/currency';

export default function CashModal({
  isOpen,
  total = 0,
  onClose,
  onCompleteSale,
}) {
  const [tenderedInput, setTenderedInput] = useState('');
  const inputRef = useRef(null);

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTenderedInput('');
    }
  }, [isOpen, total]);

  // Handle Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numericTendered = parseFloat(tenderedInput) || 0;
  const { tender, change, isSufficient, shortage } = calculateChange(
    total,
    numericTendered,
  );

  const quickBills = getQuickBillSuggestions(total);

  // Handle typing in cash input (sanitizes to digits and at most one decimal point with 2 decimal places)
  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2);
    }
    setTenderedInput(val);
  };

  // Quick preset click
  const handlePresetClick = (amount) => {
    setTenderedInput(amount.toString());
  };

  // Complete sale handler
  const handleComplete = () => {
    if (!isSufficient || numericTendered <= 0) return;
    onCompleteSale({
      tendered: tender,
      change,
    });
  };

  // Submit on Enter key if sufficient
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && isSufficient && numericTendered > 0) {
      e.preventDefault();
      handleComplete();
    }
  };

  const hasTendered = tenderedInput.trim() !== '' && numericTendered > 0;
  const isExactSelected = numericTendered === total && hasTendered;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote size={22} color="var(--accent-primary)" />
            <h2 style={styles.title}>Cash Payment</h2>
          </div>
          <button
            className="touch-btn"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close cash modal"
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Total Due Banner */}
          <div style={styles.totalBanner}>
            <span style={styles.totalLabel}>TOTAL DUE</span>
            <span style={styles.totalAmount}>{formatCurrency(total)}</span>
          </div>

          {/* Quick Cash Presets */}
          <div style={styles.presetsSection}>
            <span style={styles.sectionLabel}>QUICK CASH PRESETS</span>

            {/* Exact Amount Button */}
            <button
              type="button"
              className={`touch-btn cash-preset-btn ${isExactSelected ? 'cash-preset-selected' : ''}`}
              style={styles.exactPresetBtn}
              onClick={(e) => {
                e.currentTarget.blur();
                handlePresetClick(total);
              }}
            >
              <span style={styles.exactBtnText}>Exact Amount</span>
              <span style={styles.exactBtnPrice}>{formatCurrency(total)}</span>
            </button>

            {/* Higher Denominations */}
            {quickBills.length > 0 && (
              <div style={styles.billsGrid}>
                {quickBills.map((bill) => {
                  const isSelected =
                    numericTendered === bill && hasTendered;
                  return (
                    <button
                      key={bill}
                      type="button"
                      className={`touch-btn cash-preset-btn ${isSelected ? 'cash-preset-selected' : ''}`}
                      style={styles.billPresetBtn}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        handlePresetClick(bill);
                      }}
                    >
                      {formatCurrency(bill)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Cash Input */}
          <div style={styles.inputSection}>
            <div style={styles.inputLabelRow}>
              <label htmlFor="cash-tendered-input" style={styles.sectionLabel}>
                OR ENTER AMOUNT RECEIVED
              </label>
              {hasTendered && (
                <button
                  type="button"
                  className="touch-btn"
                  style={styles.clearInputBtn}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setTenderedInput('');
                    inputRef.current?.focus();
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.currencySymbol}>$</span>
              <input
                id="cash-tendered-input"
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="0.00"
                value={tenderedInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                style={styles.inputField}
              />
            </div>
          </div>

          {/* Live Change Feedback Card */}
          <div
            className={`cash-change-card ${hasTendered && isSufficient ? 'cash-change-card-success' : ''} ${hasTendered && !isSufficient ? 'cash-change-card-warning' : ''}`}
          >
            <div style={styles.changeHeader}>
              <span style={styles.changeLabel}>
                {hasTendered && !isSufficient ? 'STILL SHORT' : 'CHANGE TO GIVE'}
              </span>
            </div>

            <div
              style={{
                ...styles.changeAmount,
                ...(hasTendered && isSufficient
                  ? styles.changeAmountSuccess
                  : {}),
                ...(hasTendered && !isSufficient
                  ? styles.changeAmountWarning
                  : {}),
              }}
            >
              {hasTendered && !isSufficient
                ? formatCurrency(shortage)
                : formatCurrency(hasTendered ? change : 0)}
            </div>

            <div style={styles.changeHint}>
              {!hasTendered &&
                'Tap a quick preset bill above or type cash amount received.'}
              {hasTendered && isSufficient && change === 0 && (
                <span style={{ color: 'var(--accent-success)' }}>
                  Exact cash received — no change to return.
                </span>
              )}
              {hasTendered && isSufficient && change > 0 && (
                <span style={{ color: 'var(--accent-success)' }}>
                  Return <strong>{formatCurrency(change)}</strong> to customer.
                </span>
              )}
              {hasTendered && !isSufficient && (
                <span style={{ color: 'var(--accent-warning)' }}>
                  Customer still owes <strong>{formatCurrency(shortage)}</strong>.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={styles.footer}>
          <button
            type="button"
            className="touch-btn"
            style={styles.cancelBtn}
            onClick={(e) => {
              e.currentTarget.blur();
              onClose();
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="touch-btn"
            style={{
              ...styles.completeBtn,
              ...(!isSufficient || !hasTendered
                ? styles.completeBtnDisabled
                : {}),
            }}
            disabled={!isSufficient || !hasTendered}
            onClick={(e) => {
              e.currentTarget.blur();
              handleComplete();
            }}
          >
            <CheckCircle2 size={20} />
            <span>
              {hasTendered && isSufficient && change > 0
                ? `Complete (${formatCurrency(change)} Chg)`
                : 'Complete Sale'}
            </span>
          </button>
        </div>
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem',
  },
  modal: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxWidth: '440px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.15rem',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    color: 'var(--text-secondary)',
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '1rem 1.15rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  totalBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  totalLabel: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  totalAmount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  presetsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  exactPresetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.7rem 1rem',
    width: '100%',
  },
  exactBtnText: {
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  exactBtnPrice: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: '800',
    fontSize: '1.05rem',
    color: 'var(--accent-primary)',
  },
  billsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  billPresetBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    padding: '0.65rem 0.5rem',
    fontSize: '1rem',
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  inputLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearInputBtn: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    padding: '0.1rem 0.35rem',
    borderRadius: 'var(--radius-sm)',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-card)',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0.4rem 0.75rem',
  },
  currencySymbol: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '1.35rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    marginRight: '0.4rem',
  },
  inputField: {
    width: '100%',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  changeHeader: {
    marginBottom: '0.2rem',
  },
  changeLabel: {
    fontSize: '0.7rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
  },
  changeAmount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '2.3rem',
    fontWeight: '800',
    lineHeight: 1.1,
    color: 'var(--text-muted)',
    marginBottom: '0.25rem',
  },
  changeAmountSuccess: {
    color: 'var(--accent-success)',
  },
  changeAmountWarning: {
    color: 'var(--accent-warning)',
  },
  changeHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    minHeight: '1.2rem',
  },
  footer: {
    display: 'flex',
    gap: '0.65rem',
    padding: '0.85rem 1.15rem',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  completeBtn: {
    flex: 1.6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--accent-success)',
    borderRadius: 'var(--radius-md)',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.95rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
    whiteSpace: 'nowrap',
  },
  completeBtnDisabled: {
    backgroundColor: 'var(--bg-card-hover)',
    color: 'var(--text-muted)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};
