import type { Category, Product } from './types';

/**
 * CARDÁPIO — arquivo único para editar produtos, preços, descrições e fotos.
 *
 * Fonte: cardápio MenuDino (emporioburguerteresina.menudino.com), conferido em 25/11/2026.
 * Nomes e preços estão exatamente como no original. As descrições seguem o original,
 * apenas com acentos e erros de digitação corrigidos (ex.: "CHEEDAR" → "cheddar").
 *
 * Fotos: arquivos em public/images/products/<image>.webp (quadradas, 720 px).
 */

export const categories: Category[] = [
  { id: 'combos', name: 'Combos', intro: 'Dois hambúrgueres por pedido, com preço de combo.' },
  { id: 'mais-pedidos', name: 'Os mais pedidos', intro: 'Os que mais saem da chapa.' },
  { id: 'artesanal', name: 'Hambúrguer artesanal', intro: 'Todos no pão de batata.' },
  { id: 'matar-a-fome', name: 'Pra matar a fome', intro: 'Duplos e triplos, para quem chega com fome.' },
  { id: 'batatas', name: 'Batatas e porções' },
  { id: 'bebidas', name: 'Bebidas' },
];

const BURGER_ADDONS = ['molhos', 'turbine', 'mais-maionese', 'retirar'];
const FRIES_ADDONS = ['molhos', 'turbine'];

export const products: Product[] = [
  // ───────────────────────── COMBOS ─────────────────────────
  {
    id: 'combo-2-smoke-b',
    categoryId: 'combos',
    name: 'COMBO 2 SMOKE B',
    price: 39.9,
    image: 'smoke-burguer',
    photoStatus: 'ilustrativa',
    combo: [{ qty: 2, productId: 'smoke-burguer' }],
    menudinoId: 'a83dda4b-4a21-489a-bca2-696d5b4fc12e',
  },
  {
    id: 'combo-casal-super',
    categoryId: 'combos',
    name: 'COMBO CASAL SUPER',
    price: 38,
    image: 'super-smash',
    photoStatus: 'ilustrativa',
    combo: [{ qty: 2, productId: 'super-smash' }],
    menudinoId: '93a7cd20-9600-4623-9d5d-d3f3255524a0',
  },
  {
    id: 'combo-mexicano',
    categoryId: 'combos',
    name: 'COMBO MEXICANO',
    price: 30,
    image: 'cheese-mexicano',
    photoStatus: 'ilustrativa',
    combo: [{ qty: 2, productId: 'cheese-mexicano' }],
    menudinoId: 'b1125990-233c-4a3a-9c54-8cedb09746c2',
  },
  {
    id: 'combo-sertaozinho',
    categoryId: 'combos',
    name: 'COMBO SERTAOZINHO',
    price: 45.99,
    image: 'sertaozinho',
    photoStatus: 'ilustrativa',
    combo: [{ qty: 2, productId: 'sertaozinho' }],
    menudinoId: '0d9dad67-cb13-4d69-a42c-a39d4bc2db2a',
  },

  // ───────────────────────── OS MAIS PEDIDOS ─────────────────────────
  {
    id: 'sertaozinho',
    categoryId: 'mais-pedidos',
    name: 'SERTAOZINHO',
    description:
      'Pão de batata, duplo smash bovino, duplo queijo coalho, cream cheese, dupla camada de carne de sol desfiada e a famosa geleia de pimenta.',
    price: 26.9,
    image: 'sertaozinho',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '1b862943-df68-4044-821a-8dfdf7f3e0d4',
  },
  {
    id: 'emporio-burguer',
    categoryId: 'mais-pedidos',
    name: 'EMPORIO BURGUER',
    description:
      'Pão de batata, duplo blend bovino, queijo coalho saboroso, cream cheese, cebola caramelizada natural, bacon crocante, calabresa defumada e salada.',
    price: 24.9,
    image: 'emporio-burguer',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: 'bd667465-1265-4f00-ab09-c48464abca49',
  },
  {
    id: 'esfomeado',
    categoryId: 'mais-pedidos',
    name: 'ESFOMEADO',
    description:
      'Pão de batata, duplo blend bovino 160g cada, dupla camada da nossa deliciosa geleia de bacon apimentada, duplo queijo coalho.',
    price: 32.9,
    image: 'esfomeado',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: 'cc921d07-f616-4778-90ed-309cb9bbd65e',
  },

  // ───────────────────────── HAMBÚRGUER ARTESANAL ─────────────────────────
  {
    id: 'duplo-mexicano',
    categoryId: 'artesanal',
    name: 'DUPLO MEXICANO',
    description: 'Pão de batata, duplo blend bovino, cream cheese, geleia de pimenta e salada.',
    price: 28,
    image: 'duplo-mexicano',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '37ea1f18-e454-43ba-85ff-ea4e498e1039',
  },
  {
    id: 'smash-cheddar',
    categoryId: 'artesanal',
    name: 'SMASH CHEDDAR',
    description: 'Pão de batata, carne smash, cheddar cremoso, bacon em cubos e salada.',
    price: 28,
    image: 'smash-cheddar',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '50f388c2-0d55-4935-960c-4a4d82d8b9b7',
  },
  {
    id: 'pepper-burguer',
    categoryId: 'artesanal',
    name: 'PEPPER BURGUER',
    description:
      'Pão artesanal de batata, blend bovino de 100g, queijo cheddar, cream cheese, bacon bastante crocante e a fresquinha e deliciosa salada!',
    price: 18.5,
    image: 'pepper-burguer',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '99da5903-8db8-4c7d-b3a4-bcf7b394f2e4',
  },
  {
    id: 'cheddar-nordestino',
    categoryId: 'artesanal',
    name: 'CHEDDAR NORDESTINO',
    description: 'Pão de batata, blend 100g, queijo coalho, creme de cheddar, carne de sol desfiada e salada.',
    price: 19.9,
    image: 'cheddar-nordestino',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '4d9d3f54-0e86-445b-83f5-1c479ea3a319',
  },
  {
    id: 'cheese-mexicano',
    categoryId: 'artesanal',
    name: 'CHEESE MEXICANO',
    description: 'Pão de batata, blend 100g, queijo coalho, cream cheese, geleia de pimenta e salada.',
    price: 19.9,
    image: 'cheese-mexicano',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: 'c2c63257-1b86-48fc-9943-8299fd47b653',
  },
  {
    id: 'hot-bacon',
    categoryId: 'artesanal',
    name: 'HOT BACON',
    description:
      'Pão artesanal de batata, blend bovino de 100g, queijo coalho com sabor irresistível, nossa diferenciada geleia de bacon, cream cheese e uma salada fresquinha e deliciosa!',
    price: 20.9,
    image: 'hot-bacon',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: 'd7aab4b5-1365-4d17-8317-5237064ff37b',
  },
  {
    id: 'onion-bacon',
    categoryId: 'artesanal',
    name: 'ONION BACON',
    description:
      'Pão de batata, blend 120g, bacon em tiras, queijo mussarela, presunto chapeado, onion rings e cream cheese.',
    price: 22.9,
    image: 'onion-bacon',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '6b10785c-3df9-455d-9c30-90434256c2bb',
  },

  // ───────────────────────── PRA MATAR A FOME ─────────────────────────
  {
    id: 'smoke-burguer',
    categoryId: 'matar-a-fome',
    name: 'SMOKE BURGUER',
    description:
      'Pão artesanal de batata, duplo blend bovino de 100g, queijo coalho, bacon, o maravilhoso creme de cheddar caseiro, cebola roxa tostada e salada.',
    price: 23.9,
    image: 'smoke-burguer',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '1ac23fea-1abd-4993-89a1-3f7695d63c3f',
  },
  {
    id: 'smash-turbo',
    categoryId: 'matar-a-fome',
    name: 'SMASH TURBO',
    description:
      'Pão de batata, duplo blend prensado e crostado, queijo coalho e queijo cheddar, creme de cheddar caseiro, cebola roxa tostada, barbecue, calabresa defumada, geleia de pimenta e salada.',
    price: 24.9,
    image: 'smash-turbo',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '473c7eaf-5c46-43f3-9d61-191ed09bea3f',
  },
  {
    id: 'super-smash',
    categoryId: 'matar-a-fome',
    name: 'SUPER SMASH',
    description:
      'Pão artesanal de batata, duplo blend bovino de 100g, queijo cheddar, a maravilhosa geleia de pimenta caseira, cebola roxa tostada e a salada!',
    price: 23,
    image: 'super-smash',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: '074947bc-e937-4734-8661-1110775282f2',
  },
  {
    id: 'smash-triplo',
    categoryId: 'matar-a-fome',
    name: 'SMASH TRIPLO',
    description:
      'Pão de batata, três blends prensados e crostados, triplo queijo cheddar, tripla camada de molho cheddar que todo mundo ama.',
    price: 24.9,
    image: 'smash-triplo',
    photoStatus: 'propria',
    addonGroups: BURGER_ADDONS,
    menudinoId: 'c7650ebf-85ca-41e4-8316-2baf5fa98cfc',
  },

  // ───────────────────────── BATATAS E PORÇÕES ─────────────────────────
  {
    id: 'batata-p',
    categoryId: 'batatas',
    name: 'BATATA P',
    price: 13,
    // Sem foto própria na MenuDino: usa a batata simples (mesmo alimento, porção menor).
    image: 'batata-p',
    photoStatus: 'ilustrativa',
    menudinoId: '222d1c78-268c-4eac-baee-6e066832b415',
  },
  {
    id: 'batata-simples',
    categoryId: 'batatas',
    name: 'BATATA SIMPLES',
    description: 'Batata frita tamanho médio.',
    price: 14,
    image: 'batata-simples',
    photoStatus: 'propria',
    addonGroups: FRIES_ADDONS,
    menudinoId: '9ec86ee8-662c-4f09-917f-0a991e8c8a13',
  },
  {
    id: 'batata-com-bacon',
    categoryId: 'batatas',
    name: 'BATATA COM BACON',
    description: 'Batata média com bacon em cubos.',
    price: 16,
    // Foto enviada pela loja; mostra cheddar, que não vem neste item, por isso fica como ilustrativa.
    image: 'batata-com-bacon',
    photoStatus: 'ilustrativa',
    addonGroups: ['molhos'],
    menudinoId: '69ebeee2-6f1b-45d5-ad95-3de8a474d5ad',
  },
  {
    id: 'batata-com-cheddar',
    categoryId: 'batatas',
    name: 'BATATA COM CHEDDAR',
    description: 'Batata tamanho médio com molho cheddar por cima.',
    price: 16,
    image: 'batata-com-cheddar',
    photoStatus: 'propria',
    addonGroups: FRIES_ADDONS,
    menudinoId: '23f9e894-f656-43d6-bcf5-81a61bc0c78e',
  },
  {
    id: 'batata-com-cheddar-e-bacon',
    categoryId: 'batatas',
    name: 'BATATA COM CHEDDAR E BACON',
    description: 'Batata frita tamanho médio com molho cheddar e bacon em cubos.',
    price: 18,
    image: 'batata-com-cheddar-e-bacon',
    photoStatus: 'propria',
    addonGroups: FRIES_ADDONS,
    menudinoId: '6cdeecf8-0bf8-40d8-b338-ffc747bf46e9',
  },
  {
    id: 'batata-com-cheddar-e-calabresa',
    categoryId: 'batatas',
    name: 'BATATA COM CHEDDAR E CALABRESA',
    description: 'Batata frita coberta com cheddar e calabresa defumada.',
    price: 18,
    image: 'batata-com-cheddar-e-calabresa',
    photoStatus: 'propria',
    addonGroups: FRIES_ADDONS,
    menudinoId: '9c4c875a-8d93-4be3-aa08-35975051b03a',
  },
  {
    id: 'batata-com-cream-cheese-e-carne-de-sol',
    categoryId: 'batatas',
    name: 'BATATA COM CREAM CHEESE E CARNE DE SOL',
    description: 'Batata frita com cream cheese e carne de sol desfiada.',
    price: 22,
    image: 'batata-com-cream-cheese-e-carne-de-sol',
    photoStatus: 'propria',
    addonGroups: FRIES_ADDONS,
    menudinoId: 'ca4c592f-fb59-45d2-a535-a2401c99d88f',
  },
  {
    id: 'porcao-de-onion-rings',
    categoryId: 'batatas',
    name: 'PORÇAO DE ONION RINGS',
    description: 'São 8 unidades de onion rings. Os famosos anéis de cebola.',
    price: 15,
    image: 'porcao-de-onion-rings',
    photoStatus: 'propria',
    addonGroups: ['complementos'],
    menudinoId: 'bdaad93d-d38d-4d00-9f86-8d5c14add3af',
  },

  // ───────────────────────── BEBIDAS ─────────────────────────
  {
    id: 'sprite-600ml',
    categoryId: 'bebidas',
    name: 'SPRITE 600 ML',
    price: 8,
    image: 'sprite-600ml',
    photoStatus: 'propria',
    menudinoId: 'c8f4327b-b373-461d-a776-bc10147b85a8',
  },
  {
    id: 'agua-com-gas',
    categoryId: 'bebidas',
    name: 'AGUA C GAS',
    price: 3.5,
    image: 'agua-com-gas',
    photoStatus: 'propria',
    menudinoId: '58266aac-0e6a-493a-b448-0fdd1da3d0a9',
  },
  {
    id: 'fanta-laranja-350ml',
    categoryId: 'bebidas',
    name: 'FANTA LARANJA 350ML',
    price: 6,
    image: 'fanta-laranja-350ml',
    photoStatus: 'propria',
    menudinoId: '49b4c87c-b9d7-46bd-8a71-08fd4415dfac',
  },
  {
    id: 'fanta-uva-350ml',
    categoryId: 'bebidas',
    name: 'FANTA UVA 350ML',
    price: 6,
    image: 'fanta-uva-350ml',
    photoStatus: 'propria',
    menudinoId: 'fc640654-f49d-4963-9b7c-1d5709d7c89e',
  },
  {
    id: 'guarana-zero-350ml',
    categoryId: 'bebidas',
    name: 'GUARANA ZERO 350 ML',
    price: 6,
    image: 'guarana-zero-350ml',
    photoStatus: 'propria',
    menudinoId: '05d81fa7-df1b-40c5-9bd3-6e45c98b619d',
  },
  {
    id: 'cajuina',
    categoryId: 'bebidas',
    name: 'CAJUINA',
    price: 10,
    image: 'cajuina',
    photoStatus: 'propria',
    menudinoId: '116295ac-f3bf-4f46-8901-266f942ca0d8',
  },
];

/** Destaque "TOP 1 DA SEMANA" da MenuDino. */
export const weeklyTopId = 'super-smash';

/** Produto da foto principal do topo do site. */
export const heroProductId = 'smash-cheddar';

export const productById = new Map(products.map((p) => [p.id, p]));

export function productsIn(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}
