import { useState } from 'react';
import { formatCurrency } from '../utils/currency';

export default function ItemGrid({ items, cart, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate map of item quantities in cart
  const cartQtyMap = cart.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + item.quantity;
    return acc;
  }, {});

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleClick = (e, item) => {
    e.currentTarget.blur();
    onAddToCart(item);
  };

  return (
    <div style={styles.container}>
      {/* Grid of Item Touch Cards */}
      <div style={styles.grid}>
        {filteredItems.map((item) => {
          const qtyInCart = cartQtyMap[item.id] || 0;
          const isSelected = qtyInCart > 0;

          return (
            <button
              key={item.id}
              className={`touch-btn item-card-btn ${isSelected ? 'item-card-selected' : ''}`}
              onClick={(e) => handleClick(e, item)}
            >
              {isSelected && <div style={styles.cartBadge}>{qtyInCart}</div>}

              <div style={styles.emojiRow}>{item.emoji || '🍿'}</div>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemPrice}>{formatCurrency(item.price)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '0.75rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '0.65rem',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
    paddingRight: '0.1rem',
  },
  cartBadge: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '800',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--bg-secondary)',
    boxShadow: 'var(--shadow-sm)',
  },
  emojiRow: {
    fontSize: '1.85rem',
    marginBottom: '0.25rem',
    lineHeight: 1,
  },
  itemName: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
    marginBottom: '0.25rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  itemPrice: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'var(--accent-success)',
  },
};
