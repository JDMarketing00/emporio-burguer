import { useCart } from '../cart/CartContext';
import { describeCombo, groupsOf } from '../cart/cartUtils';
import { weeklyTopId } from '../data/menu';
import type { Product } from '../data/types';
import { formatBRL } from '../lib/format';
import { useUI } from '../lib/ui';
import { PlusIcon } from './Icons';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const { openProduct, notify } = useUI();
  const { add } = useCart();
  const hasOptions = groupsOf(product).length > 0;
  const detail = product.combo ? `Inclui ${describeCombo(product).join(' + ')}` : product.description;

  // Sem adicionais (bebidas, combos, batata P): o "+" coloca direto na sacola.
  const quickAdd = () => {
    if (hasOptions) {
      openProduct(product.id);
      return;
    }
    add(product.id, 1, {}, '');
    notify(`${product.name} adicionado à sacola`);
  };

  return (
    <article className="card" data-reveal>
      <button
        type="button"
        className="card__hit"
        onClick={() => openProduct(product.id)}
        aria-label={`Ver detalhes: ${product.name}, ${formatBRL(product.price)}`}
      />
      <ProductImage product={product} />
      {product.id === weeklyTopId && <span className="card__flag">Top 1 da semana</span>}
      <div className="card__body">
        <h3 className="card__name">{product.name}</h3>
        {detail && <p className="card__desc">{detail}</p>}
        <div className="card__foot">
          <span className="price">{formatBRL(product.price)}</span>
          <button
            type="button"
            className="card__add"
            onClick={quickAdd}
            aria-label={hasOptions ? `Escolher adicionais de ${product.name}` : `Adicionar ${product.name} à sacola`}
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
