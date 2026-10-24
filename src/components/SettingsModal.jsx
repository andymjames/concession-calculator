import { Edit2, Plus, RotateCcw, Save, Trash2, X, Tag } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '../data/defaultItems';
import { formatCurrency } from '../utils/currency';

export default function SettingsModal({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  onResetDefaultItems,
  clearanceMode,
  onToggleClearanceMode,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editClearancePrice, setEditClearancePrice] = useState('');

  // Form state for adding new item
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newClearancePrice, setNewClearancePrice] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newEmoji, setNewEmoji] = useState('🍿');

  if (!isOpen) return null;

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditPrice(item.price.toString());
    setEditClearancePrice(
      (item.clearancePrice !== undefined ? item.clearancePrice : item.price).toString(),
    );
  };

  const handleSavePrice = (id) => {
    const parsedPrice = parseFloat(editPrice);
    const parsedClearance = parseFloat(editClearancePrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    const finalClearance =
      isNaN(parsedClearance) || parsedClearance < 0
        ? parsedPrice
        : Math.round(parsedClearance * 100) / 100;

    const updated = items.map((it) =>
      it.id === id
        ? {
            ...it,
            price: Math.round(parsedPrice * 100) / 100,
            clearancePrice: finalClearance,
          }
        : it,
    );
    onUpdateItems(updated);
    setEditingId(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm('Remove this item from your concession menu?')) {
      const updated = items.filter((it) => it.id !== id);
      onUpdateItems(updated);
    }
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    const clearanceNum = parseFloat(newClearancePrice);
    if (!newName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const finalClearance =
      isNaN(clearanceNum) || clearanceNum < 0
        ? Math.round(priceNum * 100) / 100
        : Math.round(clearanceNum * 100) / 100;

    const newItem = {
      id: `item-custom-${Date.now()}`,
      name: newName.trim(),
      price: Math.round(priceNum * 100) / 100,
      clearancePrice: finalClearance,
      category: newCategory,
      emoji: newEmoji || '📌',
    };

    onUpdateItems([...items, newItem]);
    setNewName('');
    setNewPrice('');
    setNewClearancePrice('');
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Manage Menu & Prices</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          {/* Section: Clearance Mode Switch */}
          <div
            style={{
              ...styles.sectionCard,
              borderColor: clearanceMode
                ? 'var(--accent-warning)'
                : 'var(--border-color)',
              backgroundColor: clearanceMode
                ? 'rgba(245, 158, 11, 0.08)'
                : 'var(--bg-primary)',
            }}
          >
            <div style={styles.clearanceRow}>
              <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    marginBottom: '0.2rem',
                  }}
                >
                  <Tag
                    size={18}
                    color={
                      clearanceMode
                        ? 'var(--accent-warning)'
                        : 'var(--text-secondary)'
                    }
                  />
                  <h3 style={styles.sectionTitle}>Clearance Mode</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: clearanceMode
                        ? 'var(--accent-warning)'
                        : 'var(--bg-card-hover)',
                      color: clearanceMode ? '#ffffff' : 'var(--text-muted)',
                    }}
                  >
                    {clearanceMode ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p style={styles.clearanceSubtext}>
                  Sell surplus inventory (Hot Dogs, Burgers, Cheeseburgers) at
                  reduced end-of-game clearance prices.
                </p>
              </div>

              <button
                type="button"
                className="touch-btn"
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: clearanceMode
                    ? 'var(--accent-warning)'
                    : 'var(--bg-card-hover)',
                  border: `1.5px solid ${
                    clearanceMode
                      ? 'var(--accent-warning)'
                      : 'var(--border-color)'
                  }`,
                }}
                onClick={onToggleClearanceMode}
                title="Toggle Clearance Mode"
                aria-pressed={clearanceMode}
              >
                <div
                  style={{
                    ...styles.toggleThumb,
                    transform: clearanceMode
                      ? 'translateX(24px)'
                      : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Section: Add New Custom Menu Item */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Add New Item to Menu</h3>
            <form onSubmit={handleAddNewItem} style={styles.addForm}>
              <div style={styles.formRow}>
                <input
                  type="text"
                  placeholder="Emoji"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  style={{
                    ...styles.input,
                    width: '60px',
                    textAlign: 'center',
                  }}
                />
                <input
                  type="text"
                  placeholder="Item Name (e.g. Cotton Candy)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <input
                  type="number"
                  step="0.25"
                  placeholder="Reg ($)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                  required
                />
                <input
                  type="number"
                  step="0.25"
                  placeholder="Clearance ($)"
                  value={newClearancePrice}
                  onChange={(e) => setNewClearancePrice(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" style={styles.addBtn}>
                <Plus size={16} /> Add to Menu Grid
              </button>
            </form>
          </div>

          {/* Section: Edit Existing Items */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}>
                Existing Menu Items ({items.length})
              </h3>
              <button
                style={styles.resetBtn}
                onClick={() => {
                  if (
                    confirm(
                      'Reset menu back to default sports concession items?',
                    )
                  ) {
                    onResetDefaultItems();
                  }
                }}
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>
            </div>

            <div style={styles.itemsList}>
              {items.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <div style={styles.itemMeta}>
                    <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemCategory}>{item.category}</div>
                    </div>
                  </div>

                  <div style={styles.itemRight}>
                    {editingId === item.id ? (
                      <div style={styles.editInputsGroup}>
                        <div style={styles.editField}>
                          <span style={styles.miniLabel}>Reg</span>
                          <input
                            type="number"
                            step="0.25"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            style={styles.editInput}
                            autoFocus
                          />
                        </div>
                        <div style={styles.editField}>
                          <span style={styles.miniLabel}>Clr</span>
                          <input
                            type="number"
                            step="0.25"
                            value={editClearancePrice}
                            onChange={(e) =>
                              setEditClearancePrice(e.target.value)
                            }
                            style={styles.editInput}
                          />
                        </div>
                        <button
                          type="button"
                          style={styles.saveBtn}
                          onClick={() => handleSavePrice(item.id)}
                          title="Save Prices"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={styles.priceColumn}>
                        <div style={styles.priceBadgeRow}>
                          <span style={styles.priceLabel}>Reg</span>
                          <span
                            style={styles.priceDisplay}
                            onClick={() => handleStartEdit(item)}
                            title="Click to edit regular price"
                          >
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <div style={styles.priceBadgeRow}>
                          <span style={styles.priceLabel}>Clr</span>
                          <span
                            style={{
                              ...styles.clearanceDisplay,
                              color:
                                (item.clearancePrice ?? item.price) < item.price
                                  ? 'var(--accent-warning)'
                                  : 'var(--text-secondary)',
                            }}
                            onClick={() => handleStartEdit(item)}
                            title="Click to edit clearance price"
                          >
                            {formatCurrency(
                              item.clearancePrice ?? item.price,
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      style={styles.actionIconBtn}
                      onClick={() => handleStartEdit(item)}
                      title="Edit Prices"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      style={{
                        ...styles.actionIconBtn,
                        color: 'var(--accent-danger)',
                      }}
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
    maxWidth: '650px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color)',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    color: 'var(--text-secondary)',
    padding: '0.35rem',
    borderRadius: 'var(--radius-sm)',
  },
  modalBody: {
    padding: '1.25rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sectionCard: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem',
    border: '1.5px solid var(--border-color)',
    transition: 'all 0.15s ease',
  },
  clearanceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearanceSubtext: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.35,
  },
  statusBadge: {
    fontSize: '0.62rem',
    fontWeight: '800',
    padding: '0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    letterSpacing: '0.04em',
  },
  toggleSwitch: {
    width: '52px',
    height: '28px',
    borderRadius: '999px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  toggleThumb: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s ease',
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--accent-warning)',
    fontWeight: '700',
  },
  addForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    marginTop: '0.75rem',
  },
  formRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.6rem',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    fontWeight: '700',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '280px',
    overflowY: 'auto',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  itemName: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  itemCategory: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  priceColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  priceBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  priceLabel: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    width: '24px',
  },
  priceDisplay: {
    fontWeight: '800',
    fontSize: '0.85rem',
    color: 'var(--accent-success)',
    cursor: 'pointer',
    padding: '0.15rem 0.35rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    minWidth: '40px',
    textAlign: 'center',
  },
  clearanceDisplay: {
    fontWeight: '800',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '0.15rem 0.35rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    minWidth: '40px',
    textAlign: 'center',
  },
  editInputsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  editField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  miniLabel: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  editInput: {
    width: '56px',
    padding: '0.25rem 0.35rem',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: '700',
    outline: 'none',
  },
  saveBtn: {
    padding: '0.35rem 0.55rem',
    backgroundColor: 'var(--accent-success)',
    color: '#ffffff',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: '2px',
  },
  actionIconBtn: {
    padding: '0.35rem',
    color: 'var(--text-secondary)',
  },
};
