import type { Product } from '../data/types';
import { cx, productImage } from '../lib/format';
import { FriesIcon } from './Icons';

interface Props {
  product: Product;
  size?: 'card' | 'large' | 'thumb';
  eager?: boolean;
  className?: string;
}

/** Foto quadrada do produto, com quadro "foto em breve" quando ainda não há foto. */
export function ProductImage({ product, size = 'card', eager = false, className }: Props) {
  const isDrink = product.categoryId === 'bebidas' && product.id !== 'cajuina';
  const comboQty = product.combo?.[0]?.qty;

  return (
    <div className={cx('pimg', `pimg--${size}`, isDrink && 'pimg--packshot', className)}>
      {product.image && product.photoStatus !== 'pendente' ? (
        <img
          src={productImage(product.image)}
          alt={product.combo ? `${product.name}: ${comboQty} hambúrgueres` : product.name}
          width={720}
          height={720}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div className="pimg__pending" role="img" aria-label={`${product.name} (foto em breve)`}>
          <FriesIcon className="pimg__pending-icon" />
          {size !== 'thumb' && <span>Foto em breve</span>}
        </div>
      )}
      {comboQty && size !== 'thumb' && (
        <span className="pimg__combo" aria-hidden="true">
          {comboQty}×
        </span>
      )}
      {product.photoStatus === 'ilustrativa' && !product.combo && size !== 'thumb' && (
        <span className="pimg__note">Foto ilustrativa</span>
      )}
    </div>
  );
}
