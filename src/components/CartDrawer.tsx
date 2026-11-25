import { useEffect, useRef, useState } from 'react';
import { useCart } from '../cart/CartContext';
import { describeCombo, describeSelections, unitPrice } from '../cart/cartUtils';
import { CheckoutForm } from '../checkout/CheckoutForm';
import { productById } from '../data/menu';
import { store } from '../data/store';
import { cx, formatBRL, plural } from '../lib/format';
import { useDialog, useLockBody } from '../lib/hooks';
import { ArrowLeftIcon, BagIcon, CloseIcon, TrashIcon } from './Icons';
import { ProductImage } from './ProductImage';
import { Stepper } from './ProductModal';

type Step = 'sacola' | 'dados' | 'enviado';

export function CartDrawer() {
  const cart = useCart();
  const [step, setStep] = useState<Step>('sacola');
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useLockBody(cart.isOpen);
  useDialog(cart.isOpen, cart.close, panel);

  // Toda vez que a sacola abre, começa pela lista de itens.
  useEffect(() => {
    if (cart.isOpen) setStep('sacola');
  }, [cart.isOpen]);

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [step]);

  if (!cart.isOpen) return null;

  const titles: Record<Step, string> = {
    sacola: 'Sua sacola',
    dados: 'Finalizar pedido',
    enviado: 'Pedido pronto',
  };

  return (
    <div className="drawer" role="presentation">
      <div className="drawer__backdrop" onClick={cart.close} />
      <div className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={panel} tabIndex={-1}>
        <header className="drawer__head">
          {step === 'dados' ? (
            <button type="button" className="icon-btn" onClick={() => setStep('sacola')} aria-label="Voltar para a sacola">
              <ArrowLeftIcon />
            </button>
          ) : (
            <span className="drawer__icon" aria-hidden="true">
              <BagIcon />
            </span>
          )}
          <div className="drawer__title">
            <h2 id="drawer-title">{titles[step]}</h2>
            {step !== 'enviado' && cart.count > 0 && <p>{plural(cart.count, 'item', 'itens')}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={cart.close} aria-label="Fechar sacola">
            <CloseIcon />
          </button>
        </header>

        <ol className="steps" aria-label="Etapas do pedido">
          <li className={cx(step === 'sacola' && 'is-current', step !== 'sacola' && 'is-done')}>Sacola</li>
          <li className={cx(step === 'dados' && 'is-current', step === 'enviado' && 'is-done')}>Seus dados</li>
          <li className={cx(step === 'enviado' && 'is-current')}>WhatsApp</li>
        </ol>

        <div className="drawer__body" ref={body}>
          {step === 'sacola' && <CartLines />}
          {step !== 'sacola' && (
            <CheckoutForm
              sent={step === 'enviado'}
              onSent={() => setStep('enviado')}
              onEdit={() => setStep('dados')}
              onNewOrder={() => {
                cart.clear();
                setStep('sacola');
                cart.close();
              }}
            />
          )}
        </div>

        {step === 'sacola' && cart.count > 0 && (
          <footer className="drawer__foot">
            <div className="sum-row">
              <span>Subtotal</span>
              <strong>{formatBRL(cart.subtotal)}</strong>
            </div>
            <p className="drawer__note">
              Entrega: taxa de R$ {store.delivery.feeMin} a R$ {store.delivery.feeMax} conforme o endereço, confirmada pela
              loja.
            </p>
            <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => setStep('dados')}>
              Continuar
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function CartLines() {
  const cart = useCart();

  if (!cart.lines.length) {
    return (
      <div className="empty">
        <BagIcon className="empty__icon" />
        <h3>Sua sacola está vazia</h3>
        <p>Escolha um hambúrguer, uma batata e a bebida. Tudo fica salvo aqui enquanto você navega.</p>
        <a
          className="btn btn--primary"
          href="#cardapio"
          onClick={() => {
            cart.close();
          }}
        >
          Ver cardápio
        </a>
      </div>
    );
  }

  return (
    <ul className="lines">
      {cart.lines.map((line) => {
        const product = productById.get(line.productId);
        if (!product) return null;
        const extras = [...describeCombo(product).map((c) => `Inclui ${c}`), ...describeSelections(product, line.selections)];
        return (
          <li className="line" key={line.key}>
            <ProductImage product={product} size="thumb" />
            <div className="line__info">
              <div className="line__top">
                <h3>{product.name}</h3>
                <button
                  type="button"
                  className="icon-btn icon-btn--sm"
                  onClick={() => cart.remove(line.key)}
                  aria-label={`Remover ${product.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
              {extras.length > 0 && (
                <ul className="line__extras">
                  {extras.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              {line.notes && <p className="line__notes">Obs.: {line.notes}</p>}
              <div className="line__bottom">
                <Stepper
                  value={line.qty}
                  min={0}
                  max={99}
                  onChange={(v) => cart.setQty(line.key, v)}
                  label={`quantidade de ${product.name}`}
                  small
                />
                <strong className="price">{formatBRL(unitPrice(product, line.selections) * line.qty)}</strong>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
