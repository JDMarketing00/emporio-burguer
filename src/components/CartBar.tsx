import { useCart } from '../cart/CartContext';
import { cx, formatBRL, plural } from '../lib/format';
import { useUI } from '../lib/ui';
import { BagIcon, CheckIcon } from './Icons';

/** Barra fixa no rodapé da tela: atalho para a sacola + aviso de item adicionado. */
export function CartBar() {
  const { count, subtotal, open, isOpen } = useCart();
  const { toast, productId } = useUI();
  const hidden = isOpen || productId !== null;

  return (
    <div className={cx('dock', hidden && 'dock--hidden')} aria-live="polite">
      {toast && (
        <p className="toast" key={toast.id} role="status">
          <CheckIcon />
          {toast.text}
        </p>
      )}
      {count > 0 && (
        <button type="button" className="cartbar" onClick={open} key={`bar-${count}`}>
          <span className="cartbar__icon">
            <BagIcon />
            <b>{count}</b>
          </span>
          <span className="cartbar__label">Ver sacola</span>
          <span className="cartbar__meta">{plural(count, 'item', 'itens')}</span>
          <strong className="cartbar__total">{formatBRL(subtotal)}</strong>
        </button>
      )}
    </div>
  );
}
