import type { CategoryId } from './types';

/**
 * Vitrine giratória (carrossel 3D) e letreiro neon.
 * Cada cartão leva para uma categoria real do cardápio.
 * `image` = arquivo em public/images/products (sem extensão).
 */
export interface ShowcaseItem {
  image: string;
  alt: string;
  title: string;
  subtitle: string;
  category: CategoryId;
}

export const showcaseItems: ShowcaseItem[] = [
  {
    image: 'pepper-burguer',
    alt: 'PEPPER BURGUER, hambúrguer artesanal do Empório Burguer no pão de batata',
    title: 'Hambúrgueres',
    subtitle: 'Sabor irresistível',
    category: 'artesanal',
  },
  {
    image: 'sertaozinho',
    alt: 'SERTAOZINHO, o hambúrguer do COMBO SERTAOZINHO (2 unidades)',
    title: 'Combos',
    subtitle: 'Tudo em um só pedido',
    category: 'combos',
  },
  {
    image: 'batata-com-cheddar-e-calabresa',
    alt: 'Porção de batatas fritas com cheddar e calabresa',
    title: 'Porções',
    subtitle: 'Acompanhamentos especiais',
    category: 'batatas',
  },
  {
    image: 'esfomeado',
    alt: 'ESFOMEADO, hambúrguer com duplo blend e duplo queijo coalho',
    title: 'Mais pedidos',
    subtitle: 'Favoritos da casa',
    category: 'mais-pedidos',
  },
  {
    image: 'smash-triplo',
    alt: 'SMASH TRIPLO, três blends prensados com cheddar',
    title: 'Pra matar a fome',
    subtitle: 'Duplos e triplos',
    category: 'matar-a-fome',
  },
];

/** Cores do letreiro, tiradas do logo: laranja (#F17723) e branco quente. */
export const neonOrange = ['#fff4e3', '#ffd9a8', '#ffb760', '#ff9a3c', '#f17723', '#d95a14', '#8f3008', '#240b02'];
export const neonWarmWhite = ['#ffffff', '#fffaf2', '#ffefd6', '#ffdcae', '#f6c48c', '#e39a58', '#7a3a10', '#240b02'];
