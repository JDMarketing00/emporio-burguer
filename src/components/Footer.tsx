import { store } from '../data/store';
import { img } from '../lib/format';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <img className="footer__logo" src={img('brand/logo.webp')} alt={store.name} width={243} height={295} loading="lazy" />
        <div className="footer__text">
          <p className="footer__name">
            {store.name} · {store.tagline}
          </p>
          <p>
            {store.address.district}, {store.address.city} - {store.address.state}
          </p>
          <p className="footer__legal">
            {store.legalName} · CNPJ {store.cnpj}
          </p>
        </div>
        <nav className="footer__nav" aria-label="Rodapé">
          <a href="#cardapio">Cardápio</a>
          <a href="#informacoes">Horários e endereço</a>
          <a href={store.menudinoUrl} target="_blank" rel="noopener noreferrer">
            Cardápio na MenuDino
          </a>
        </nav>
      </div>
      <p className="wrap footer__copy">© {new Date().getFullYear()} {store.name}. Preços sujeitos a alteração pela loja.</p>
    </footer>
  );
}
