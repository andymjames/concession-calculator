import { Edit2, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '../data/defaultItems';
import { formatCurrency } from '../utils/currency';

export default function SettingsModal({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  onResetDefaultItems,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Form state for adding new item
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newEmoji, setNewEmoji] = useState('🍿');

  if (!isOpen) return null;

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditPrice(item.price.toString());
  };

  const handleSavePrice = (id) => {
    const parsed = parseFloat(editPrice);
    if (isNaN(parsed) || parsed < 0) return;

    const updated = items.map((it) =>
      it.id === id ? { ...it, price: Math.round(parsed * 100) / 100 } : it,
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
    if (!newName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const newItem = {
      id: `item-custom-${Date.now()}`,
      name: newName.trim(),
      price: Math.round(priceNum * 100) / 100,
      category: newCategory,
      emoji: newEmoji || '📌',
    };

    onUpdateItems([...items, newItem]);
    setNewName('');
    setNewPrice('');
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
                  placeholder="Price (e.g. 3.50)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                  required
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
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <input
                          type="number"
                          step="0.25"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          style={{
                            ...styles.input,
                            width: '80px',
                            padding: '0.2rem 0.4rem',
                          }}
                          autoFocus
                        />
                        <button
                          style={styles.saveBtn}
                          onClick={() => handleSavePrice(item.id)}
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <span
                        style={styles.priceDisplay}
                        onClick={() => handleStartEdit(item)}
                        title="Click to edit price"
                      >
                        {formatCurrency(item.price)}
                      </span>
                    )}

                    <button
                      style={styles.actionIconBtn}
                      onClick={() => handleStartEdit(item)}
                      title="Edit Price"
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
    border: '1px solid var(--border-color)',
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
  priceDisplay: {
    fontWeight: '800',
    fontSize: '0.95rem',
    color: 'var(--accent-success)',
    cursor: 'pointer',
    padding: '0.2rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
  },
  saveBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: 'var(--accent-success)',
    color: '#ffffff',
    borderRadius: 'var(--radius-sm)',
  },
  actionIconBtn: {
    padding: '0.35rem',
    color: 'var(--text-secondary)',
  },
};
