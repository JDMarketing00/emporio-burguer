import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useCart } from '../cart/CartContext';
import { describeCombo, describeSelections, unitPrice } from '../cart/cartUtils';
import { CheckIcon, CopyIcon, WhatsAppIcon } from '../components/Icons';
import { productById } from '../data/menu';
import { store, type OrderType } from '../data/store';
import { cx, digits, formatBRL, maskPhone, parseMoney } from '../lib/format';
import { getOpenStatus } from '../lib/hours';
import { readJSON, writeJSON } from '../lib/storage';
import { buildOrderMessage, emptyCheckout, whatsappUrl, type CheckoutData } from './whatsapp';

const SAVED_KEY = 'emporio-burguer:cliente:v1';

interface Props {
  sent: boolean;
  onSent: () => void;
  onEdit: () => void;
  onNewOrder: () => void;
}

type Errors = Partial<Record<keyof CheckoutData | 'minimum', string>>;

export function CheckoutForm({ sent, onSent, onEdit, onNewOrder }: Props) {
  const { lines, subtotal } = useCart();
  // Nome, telefone e endereço ficam salvos no aparelho para o próximo pedido.
  const [data, setData] = useState<CheckoutData>(() => ({
    ...emptyCheckout,
    ...readJSON<Partial<CheckoutData>>(SAVED_KEY, {}),
    payment: '',
    change: '',
    notes: '',
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);
  const status = getOpenStatus();

  useEffect(() => {
    const { name, phone, orderType, street, number, district, complement } = data;
    writeJSON(SAVED_KEY, { name, phone, orderType, street, number, district, complement });
  }, [data]);

  const message = useMemo(() => buildOrderMessage(lines, data, subtotal), [lines, data, subtotal]);
  const url = whatsappUrl(message);
  const isDelivery = data.orderType === 'delivery';
  const belowMinimum = isDelivery && subtotal < store.delivery.minimumOrder;

  const set = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const check = (): Errors => {
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = 'Informe seu nome.';
    if (digits(data.phone).length < 10) e.phone = 'Informe um telefone com DDD.';
    if (isDelivery) {
      if (!data.street.trim()) e.street = 'Informe a rua.';
      if (!data.number.trim()) e.number = 'Informe o número (ou S/N).';
      if (!data.district.trim()) e.district = 'Informe o bairro.';
    }
    if (!data.payment) e.payment = 'Escolha a forma de pagamento.';
    if (data.payment === 'Dinheiro' && data.change.trim() && parseMoney(data.change) < subtotal) {
      e.change = `O troco precisa ser para um valor acima de ${formatBRL(subtotal)}.`;
    }
    if (belowMinimum) e.minimum = `O pedido mínimo para entrega é ${formatBRL(store.delivery.minimumOrder)}.`;
    return e;
  };

  /** O envio é um link real para o WhatsApp; só seguimos se o formulário estiver completo. */
  const onSend = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    const e = check();
    setErrors(e);
    if (Object.values(e).some(Boolean)) {
      ev.preventDefault();
      const first = Object.keys(e).find((k) => e[k as keyof Errors]);
      document.getElementById(`ck-${first}`)?.focus();
      return;
    }
    onSent();
  };

  const onSubmit = (ev: FormEvent) => ev.preventDefault();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const pre = document.getElementById('order-text');
      if (pre) window.getSelection()?.selectAllChildren(pre);
    }
  };

  if (sent) {
    return (
      <div className="sent">
        <div className="sent__badge" aria-hidden="true">
          <WhatsAppIcon />
        </div>
        <h3>Confira e toque em enviar no WhatsApp</h3>
        <p>
          Abrimos uma conversa com o Empório Burguer com o seu pedido já escrito. <strong>O pedido só chega na loja
          depois que você enviar a mensagem por lá.</strong> A loja confirma a taxa de entrega e o tempo de preparo.
        </p>
        <div className="sent__actions">
          <a className="btn btn--whats btn--block btn--lg" href={url} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Abrir o WhatsApp de novo
          </a>
          <button type="button" className="btn btn--ghost btn--block" onClick={copy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Pedido copiado' : 'Copiar texto do pedido'}
          </button>
        </div>
        <pre className="sent__text" id="order-text">
          {message}
        </pre>
        <div className="sent__foot">
          <button type="button" className="link-btn" onClick={onEdit}>
            Corrigir meus dados
          </button>
          <button type="button" className="link-btn" onClick={onNewOrder}>
            Começar um novo pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="checkout" onSubmit={onSubmit} noValidate>
      {!status.open && (
        <p className="notice">
          <strong>{status.label}.</strong> Você pode montar o pedido agora; a loja responde no horário de
          funcionamento.
        </p>
      )}

      <fieldset className="ck-block">
        <legend>Como você quer receber?</legend>
        <div className="segmented" role="radiogroup" aria-label="Tipo de pedido">
          {store.orderTypes.map((t) => (
            <label key={t.id} className={cx('segmented__opt', data.orderType === t.id && 'is-on')}>
              <input
                type="radio"
                name="orderType"
                value={t.id}
                checked={data.orderType === t.id}
                onChange={() => set('orderType', t.id as OrderType)}
              />
              {t.label}
            </label>
          ))}
        </div>
        {isDelivery ? (
          <p className="ck-hint">
            Taxa de R$ {store.delivery.feeMin} a R$ {store.delivery.feeMax} conforme a distância · {store.delivery.timeMin}–
            {store.delivery.timeMax} min · pedido mínimo {formatBRL(store.delivery.minimumOrder)}
          </p>
        ) : (
          <p className="ck-hint">
            {store.address.street} - {store.address.district}
          </p>
        )}
      </fieldset>

      <fieldset className="ck-block">
        <legend>Seus dados</legend>
        <Field id="ck-name" label="Nome" error={errors.name}>
          <input
            id="ck-name"
            className="field__input"
            autoComplete="name"
            value={data.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Como devemos te chamar"
          />
        </Field>
        <Field id="ck-phone" label="Telefone / WhatsApp" error={errors.phone}>
          <input
            id="ck-phone"
            className="field__input"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={data.phone}
            onChange={(e) => set('phone', maskPhone(e.target.value))}
            placeholder="(86) 90000-0000"
          />
        </Field>
      </fieldset>

      {isDelivery && (
        <fieldset className="ck-block">
          <legend>Endereço de entrega</legend>
          <div className="field-row">
            <Field id="ck-street" label="Rua / avenida" error={errors.street} grow>
              <input
                id="ck-street"
                className="field__input"
                autoComplete="address-line1"
                value={data.street}
                onChange={(e) => set('street', e.target.value)}
              />
            </Field>
            <Field id="ck-number" label="Número" error={errors.number} narrow>
              <input
                id="ck-number"
                className="field__input"
                inputMode="numeric"
                value={data.number}
                onChange={(e) => set('number', e.target.value)}
              />
            </Field>
          </div>
          <Field id="ck-district" label="Bairro" error={errors.district}>
            <input
              id="ck-district"
              className="field__input"
              autoComplete="address-level3"
              value={data.district}
              onChange={(e) => set('district', e.target.value)}
            />
          </Field>
          <Field id="ck-complement" label="Complemento / ponto de referência (opcional)">
            <input
              id="ck-complement"
              className="field__input"
              value={data.complement}
              onChange={(e) => set('complement', e.target.value)}
              placeholder="Casa, bloco, perto de…"
            />
          </Field>
        </fieldset>
      )}

      <fieldset className="ck-block">
        <legend>Pagamento {isDelivery ? 'na entrega' : 'na loja'}</legend>
        <div className="pay" role="radiogroup" aria-label="Forma de pagamento" id="ck-payment" tabIndex={-1}>
          {store.payments.map((p) => (
            <label key={p} className={cx('pay__opt', data.payment === p && 'is-on')}>
              <input type="radio" name="payment" value={p} checked={data.payment === p} onChange={() => set('payment', p)} />
              <span className="opt__box opt__box--radio" aria-hidden="true">
                <CheckIcon />
              </span>
              {p}
            </label>
          ))}
        </div>
        {errors.payment && <p className="field__error">{errors.payment}</p>}
        {data.payment === 'Dinheiro' && (
          <Field id="ck-change" label="Troco para quanto? (opcional)" error={errors.change}>
            <input
              id="ck-change"
              className="field__input"
              inputMode="decimal"
              value={data.change}
              onChange={(e) => set('change', e.target.value)}
              placeholder="Ex.: R$ 100,00"
            />
          </Field>
        )}
      </fieldset>

      <fieldset className="ck-block">
        <legend>Observações do pedido</legend>
        <Field id="ck-notes" label="Algo que a loja precisa saber? (opcional)">
          <textarea
            id="ck-notes"
            className="field__input field__textarea"
            rows={2}
            maxLength={240}
            value={data.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </Field>
      </fieldset>

      <OrderTicket isDelivery={isDelivery} />

      {errors.minimum && (
        <p className="field__error field__error--block" role="alert">
          {errors.minimum}
        </p>
      )}

      <a
        className="btn btn--whats btn--block btn--lg"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onSend}
      >
        <WhatsAppIcon />
        Enviar pedido pelo WhatsApp
      </a>
      <p className="ck-foot">
        Abre o WhatsApp da loja, {store.phoneDisplay}, com o pedido escrito. Você confere e envia por lá.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
  grow,
  narrow,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  grow?: boolean;
  narrow?: boolean;
}) {
  return (
    <div className={cx('field', error && 'field--error', grow && 'field--grow', narrow && 'field--narrow')}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}

/** Resumo no formato de comanda de cozinha. */
function OrderTicket({ isDelivery }: { isDelivery: boolean }) {
  const { lines, subtotal } = useCart();
  return (
    <div className="ticket" aria-label="Resumo do pedido">
      <p className="ticket__head">
        <span>Comanda</span>
        <span>{store.name}</span>
      </p>
      <ul className="ticket__lines">
        {lines.map((line) => {
          const product = productById.get(line.productId);
          if (!product) return null;
          const extras = [...describeCombo(product).map((c) => `inclui ${c}`), ...describeSelections(product, line.selections)];
          return (
            <li key={line.key}>
              <div className="ticket__row">
                <span>
                  {line.qty}x {product.name}
                </span>
                <span>{formatBRL(unitPrice(product, line.selections) * line.qty)}</span>
              </div>
              {extras.map((e) => (
                <div className="ticket__extra" key={e}>
                  {e}
                </div>
              ))}
              {line.notes && <div className="ticket__extra">obs.: {line.notes}</div>}
            </li>
          );
        })}
      </ul>
      <div className="ticket__row ticket__total">
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
      {isDelivery && (
        <div className="ticket__row ticket__fee">
          <span>Entrega</span>
          <span>a confirmar</span>
        </div>
      )}
    </div>
  );
}
