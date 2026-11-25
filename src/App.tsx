import { useEffect, useRef } from 'react';
import { CartProvider, useCart } from './cart/CartContext';
import { CartBar } from './components/CartBar';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Menu } from './components/Menu';
import { ProductModal } from './components/ProductModal';
import { Showcase } from './components/Showcase';
import { StoreInfo } from './components/StoreInfo';
import { WeeklyTop } from './components/WeeklyTop';
import { UIProvider, useUI } from './lib/ui';

export default function App() {
  return (
    <CartProvider>
      <UIProvider>
        <Shell />
      </UIProvider>
    </CartProvider>
  );
}

function Shell() {
  const { productId } = useUI();
  const { isOpen } = useCart();
  const page = useRef<HTMLDivElement>(null);
  const overlay = productId !== null || isOpen;

  // Com modal ou sacola abertos, o resto da página fica inerte (teclado e leitores de tela).
  useEffect(() => {
    page.current?.toggleAttribute('inert', overlay);
  }, [overlay]);

  return (
    <>
      <div ref={page}>
        <a className="skip" href="#cardapio">
          Pular para o cardápio
        </a>
        <Header />
        <main>
          <Hero />
          <WeeklyTop />
          <Showcase />
          <Menu />
          <StoreInfo />
        </main>
        <Footer />
        <CartBar />
      </div>
      <ProductModal />
      <CartDrawer />
    </>
  );
}
