import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../cart/CartContext';
import { groupsOf, unitPrice, validate, type Selections } from '../cart/cartUtils';
import { productById } from '../data/menu';
import type { AddonGroup, Product } from '../data/types';
import { cx, formatBRL } from '../lib/format';
import { useDialog, useLockBody } from '../lib/hooks';
import { useUI } from '../lib/ui';
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon } from './Icons';
import { ProductImage } from './ProductImage';

const NOTES_MAX = 140;

export function ProductModal() {
  const { productId, closeProduct } = useUI();
  const product = productId ? productById.get(productId) : undefined;
  useLockBody(Boolean(product));
  if (!product) return null;
  // key reinicia o estado ao trocar de produto
  return <ModalContent key={product.id} product={product} onClose={closeProduct} />;
}

function ModalContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useCart();
  const { notify } = useUI();
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [selections, setSelections] = useState<Selections>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [closing, setClosing] = useState(false);
  const groups = groupsOf(product);

  const close = () => {
    setClosing(true);
    window.setTimeout(onClose, 180);
  };
  useDialog(true, close, panel);

  const price = useMemo(() => unitPrice(product, selections), [product, selections]);

  // Limpa o erro de um grupo assim que ele fica válido.
  useEffect(() => {
    if (!Object.keys(errors).length) return;
    const now = validate(product, selections);
    setErrors((prev) => Object.fromEntries(Object.keys(prev).filter((k) => now[k]).map((k) => [k, now[k]])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections]);

  const setOption = (group: AddonGroup, optionId: string, value: number) => {
    setSelections((prev) => {
      const current = { ...(prev[group.id] ?? {}) };
      if (group.max === 1 && group.options.length > 1) {
        // escolha única
        return { ...prev, [group.id]: value > 0 ? { [optionId]: 1 } : {} };
      }
      const chosenCount = Object.entries(current).filter(([id, q]) => q > 0 && id !== optionId).length;
      if (value > 0 && !current[optionId] && chosenCount >= group.max) return prev;
      if (group.maxTotalQty) {
        const others = Object.entries(current).reduce((s, [id, q]) => (id === optionId ? s : s + q), 0);
        value = Math.min(value, group.maxTotalQty - others);
      }
      current[optionId] = Math.max(0, value);
      return { ...prev, [group.id]: current };
    });
  };

  const submit = () => {
    const found = validate(product, selections);
    if (Object.keys(found).length) {
      setErrors(found);
      const first = Object.keys(found)[0];
      scroller.current?.querySelector(`[data-group="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    add(product.id, qty, selections, notes);
    notify(`${qty > 1 ? `${qty}x ` : ''}${product.name} adicionado à sacola`);
    close();
  };

  return (
    <div className={cx('modal', closing && 'is-closing')} role="presentation">
      <div className="modal__backdrop" onClick={close} />
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={panel}
        tabIndex={-1}
      >
        <button type="button" className="icon-btn modal__close" onClick={close} aria-label="Fechar">
          <CloseIcon />
        </button>

        <div className="modal__scroll">
        <div className="modal__media">
          <ProductImage product={product} size="large" eager />
        </div>

        <div className="modal__content" ref={scroller}>
          <div className="modal__intro">
            <h2 className="modal__title" id="modal-title">
              {product.name}
            </h2>
            {product.description && <p className="modal__desc">{product.description}</p>}
            <p className="modal__price">{formatBRL(product.price)}</p>
          </div>

          {product.combo && (
            <div className="opt-group">
              <div className="opt-group__head">
                <h3>Este combo inclui</h3>
              </div>
              <ul className="combo-list">
                {product.combo.map((part) => {
                  const item = productById.get(part.productId);
                  if (!item) return null;
                  return (
                    <li key={part.productId}>
                      <ProductImage product={item} size="thumb" />
                      <div>
                        <strong>
                          {part.qty}x {item.name}
                        </strong>
                        {item.description && <span>{item.description}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {groups.map((group) => (
            <OptionGroup
              key={group.id}
              group={group}
              chosen={selections[group.id] ?? {}}
              error={errors[group.id]}
              onChange={(optionId, value) => setOption(group, optionId, value)}
            />
          ))}

          <div className="opt-group">
            <label className="opt-group__head" htmlFor="obs-produto">
              <h3>Alguma observação?</h3>
              <span className="opt-group__hint">
                {notes.length}/{NOTES_MAX}
              </span>
            </label>
            <textarea
              id="obs-produto"
              className="field__input field__textarea"
              rows={2}
              maxLength={NOTES_MAX}
              placeholder="Ex.: ponto da carne, cortar ao meio…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        </div>

        <div className="modal__foot">
          <Stepper value={qty} min={1} max={99} onChange={setQty} label="Quantidade" />
          <button type="button" className="btn btn--primary btn--block" onClick={submit}>
            <span>Adicionar</span>
            <span className="btn__price">{formatBRL(price * qty)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface GroupProps {
  group: AddonGroup;
  chosen: Record<string, number>;
  error?: string;
  onChange: (optionId: string, value: number) => void;
}

function OptionGroup({ group, chosen, error, onChange }: GroupProps) {
  const single = group.max === 1 && group.options.length > 1;
  const count = Object.values(chosen).filter((q) => q > 0).length;
  const full = !single && count >= group.max;

  return (
    <fieldset className={cx('opt-group', error && 'opt-group--error')} data-group={group.id}>
      <legend className="opt-group__head">
        <h3>{group.title}</h3>
        <span className="opt-group__hint">{group.hint}</span>
        {group.required && (
          <span className={cx('pill', count >= group.min ? 'pill--ok' : 'pill--req')}>
            {count >= group.min ? <CheckIcon /> : null}
            Obrigatório
          </span>
        )}
      </legend>
      {error && (
        <p className="opt-group__error" role="alert">
          {error}
        </p>
      )}
      <ul className="opts">
        {group.options.map((opt) => {
          const qty = chosen[opt.id] ?? 0;
          const inputId = `${group.id}-${opt.id}`;
          const withQty = (opt.maxQty ?? 1) > 1;
          return (
            <li key={opt.id} className={cx('opt', qty > 0 && 'opt--on')}>
              {withQty ? (
                <>
                  <span className="opt__label">
                    <span className="opt__name">{opt.name}</span>
                    <span className="opt__price">+ {formatBRL(opt.price)} cada</span>
                  </span>
                  <Stepper
                    value={qty}
                    min={0}
                    max={opt.maxQty ?? 1}
                    onChange={(v) => onChange(opt.id, v)}
                    label={opt.name}
                    small
                  />
                </>
              ) : (
                <label className="opt__label" htmlFor={inputId}>
                  <input
                    id={inputId}
                    type={single ? 'radio' : 'checkbox'}
                    name={group.id}
                    checked={qty > 0}
                    disabled={!qty && full}
                    onChange={(e) => onChange(opt.id, e.target.checked ? 1 : 0)}
                  />
                  <span className={cx('opt__box', single && 'opt__box--radio')} aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <span className="opt__name">{opt.name}</span>
                  {opt.price > 0 && <span className="opt__price">+ {formatBRL(opt.price)}</span>}
                </label>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  small?: boolean;
}

export function Stepper({ value, min, max, onChange, label, small }: StepperProps) {
  return (
    <div className={cx('stepper', small && 'stepper--sm')} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Diminuir ${label}`}
      >
        <MinusIcon />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar ${label}`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
