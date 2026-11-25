import { productById, weeklyTopId } from '../data/menu';
import { formatBRL, img } from '../lib/format';
import { useUI } from '../lib/ui';
import { ArrowRightIcon } from './Icons';
import { ProductImage } from './ProductImage';

/** Faixa laranja com o "TOP 1 DA SEMANA" da MenuDino. */
export function WeeklyTop() {
  const product = productById.get(weeklyTopId);
  const { openProduct } = useUI();
  if (!product) return null;

  return (
    <section className="top1" aria-labelledby="top1-title">
      <div className="top1__pattern" style={{ backgroundImage: `url(${img('brand/pattern.webp')})` }} aria-hidden="true" />
      <div className="top1__inner wrap">
        <div className="top1__media">
          <ProductImage product={product} size="large" />
        </div>
        <div className="top1__copy">
          <p className="top1__kicker">Top 1 da semana</p>
          <h2 className="top1__name" id="top1-title">
            {product.name}
          </h2>
          <p className="top1__desc">{product.description}</p>
          <div className="top1__row">
            <span className="top1__price">{formatBRL(product.price)}</span>
            <button type="button" className="btn btn--dark" onClick={() => openProduct(product.id)}>
              Quero esse
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
