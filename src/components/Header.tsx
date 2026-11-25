import { useCart } from '../cart/CartContext';
import { store } from '../data/store';
import { cx, formatBRL, img } from '../lib/format';
import { useMinuteTick, useScrolled } from '../lib/hooks';
import { getOpenStatus } from '../lib/hours';
import { BagIcon } from './Icons';

export function Header() {
  const scrolled = useScrolled(24);
  const { count, subtotal, open } = useCart();
  useMinuteTick();
  const status = getOpenStatus();

  return (
    <header className={cx('header', scrolled && 'header--solid')}>
      <div className="header__inner wrap">
        <a className="header__brand" href="#inicio" aria-label={`${store.name} — início`}>
          <img src={img('brand/logo.webp')} alt={store.name} width={243} height={295} />
          <span className="header__name">
            Empório <b>Burguer</b>
          </span>
        </a>

        <nav className="header__nav" aria-label="Seções do site">
          <a href="#cardapio">Cardápio</a>
          <a href="#combos">Combos</a>
          <a href="#informacoes">Informações</a>
        </nav>

        <div className="header__actions">
          <span className={cx('status', status.open ? 'status--open' : 'status--closed')} title={status.label}>
            <i aria-hidden="true" />
            {status.open ? 'Aberto' : 'Fechado'}
          </span>
          <button type="button" className="cart-btn" onClick={open} aria-label={`Abrir sacola, ${count} itens`}>
            <BagIcon />
            {count > 0 && (
              <span className="cart-btn__count" key={count}>
                {count}
              </span>
            )}
            <span className="cart-btn__total">{count > 0 ? formatBRL(subtotal) : 'Sacola'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
