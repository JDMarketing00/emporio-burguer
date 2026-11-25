import { useState } from 'react';
import { whatsappContactUrl } from '../checkout/whatsapp';
import { fullAddress, mapsUrl, store } from '../data/store';
import { cx, formatBRL } from '../lib/format';
import { useMinuteTick } from '../lib/hooks';
import { getOpenStatus, WEEKDAYS } from '../lib/hours';
import { CardIcon, CheckIcon, ClockIcon, CopyIcon, DeliveryIcon, PinIcon, WhatsAppIcon } from './Icons';

// Segunda a domingo, como a semana costuma ser lida.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function StoreInfo() {
  useMinuteTick();
  const status = getOpenStatus();
  const [copied, setCopied] = useState(false);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(store.phoneDisplay);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.getElementById('store-phone');
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };

  return (
    <section className="info" id="informacoes" aria-labelledby="info-title">
      <div className="wrap">
        <p className="eyebrow">Informações</p>
        <h2 className="section-title" id="info-title">
          Onde e quando
        </h2>

        <div className="info__grid">
          <article className="info__block info__block--hours">
            <h3>
              <ClockIcon /> Horário de funcionamento
            </h3>
            <p className={cx('info__status', status.open ? 'is-open' : 'is-closed')}>
              <i className="dot" aria-hidden="true" />
              {status.label}
            </p>
            <table className="hours">
              <tbody>
                {ORDER.map((d) => {
                  const h = store.hours.find((x) => x.day === d);
                  return (
                    <tr key={d} className={cx(d === status.today && 'is-today')}>
                      <th scope="row">
                        {WEEKDAYS[d]}
                        {d === status.today && <span className="hours__today">hoje</span>}
                      </th>
                      <td>{h ? `${h.open} às ${h.close}` : 'Fechado'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </article>

          <article className="info__block">
            <h3>
              <PinIcon /> Endereço
            </h3>
            <p className="info__lead">{fullAddress}</p>
            <a className="btn btn--ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir no Google Maps
            </a>

            <h3 className="info__sub">
              <WhatsAppIcon /> Contato
            </h3>
            <p className="info__phone">
              <span id="store-phone">{store.phoneDisplay}</span>
              <button type="button" className="icon-btn icon-btn--sm" onClick={copyPhone} aria-label="Copiar telefone">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </p>
            <a className="btn btn--whats" href={whatsappContactUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Falar no WhatsApp
            </a>
          </article>

          <article className="info__block">
            <h3>
              <DeliveryIcon /> Entrega e retirada
            </h3>
            <ul className="facts">
              {store.orderTypes.map((t) => (
                <li key={t.id}>
                  <CheckIcon /> {t.label}
                </li>
              ))}
            </ul>
            <dl className="kv">
              <div>
                <dt>Taxa de entrega</dt>
                <dd>
                  R$ {store.delivery.feeMin} a R$ {store.delivery.feeMax}
                </dd>
              </div>
              <div>
                <dt>Tempo estimado</dt>
                <dd>
                  {store.delivery.timeMin} a {store.delivery.timeMax} min
                </dd>
              </div>
              <div>
                <dt>Pedido mínimo</dt>
                <dd>{formatBRL(store.delivery.minimumOrder)}</dd>
              </div>
            </dl>

            <h3 className="info__sub">
              <CardIcon /> Pagamento na entrega
            </h3>
            <ul className="facts">
              {store.payments.map((p) => (
                <li key={p}>
                  <CheckIcon /> {p}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
