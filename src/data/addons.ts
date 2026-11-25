import type { AddonGroup } from './types';

/**
 * Grupos de adicionais, iguais aos do cardápio MenuDino (nomes, preços e limites).
 * Cada produto em data/menu.ts lista quais grupos usa.
 */
export const addonGroups: Record<string, AddonGroup> = {
  molhos: {
    id: 'molhos',
    title: 'Ketchup e maionese',
    hint: 'Escolha 1 opção',
    required: true,
    min: 1,
    max: 1,
    options: [
      { id: 'ketchup-e-maionese', name: 'Ketchup e maionese', price: 0 },
      { id: 'so-ketchup', name: 'Só ketchup', price: 0 },
      { id: 'so-maionese', name: 'Só maionese', price: 0 },
    ],
  },

  turbine: {
    id: 'turbine',
    title: 'Turbine seu hambúrguer',
    hint: 'Opcional',
    required: false,
    min: 0,
    max: 18,
    options: [
      { id: 'bacon-em-cubos', name: 'Bacon em cubos', price: 5 },
      { id: 'blend-100g', name: 'Blend 100g', price: 9 },
      { id: 'calabresa-defumada', name: 'Calabresa defumada', price: 4 },
      { id: 'carne-de-sol-desfiada', name: 'Carne de sol desfiada', price: 6 },
      { id: 'cebola-caramelizada', name: 'Cebola caramelizada', price: 4 },
      { id: 'cebola-roxa', name: 'Cebola roxa', price: 3 },
      { id: 'cheddar-cremoso', name: 'Cheddar cremoso', price: 4 },
      { id: 'cream-cheese', name: 'Cream cheese', price: 5 },
      { id: 'geleia-de-bacon', name: 'Geleia de bacon', price: 5 },
      { id: 'maionese-temperada-sache', name: 'Maionese temperada (sachê)', price: 1 },
      { id: 'molho-barbecue', name: 'Molho barbecue', price: 4 },
      { id: 'salada', name: 'Salada', price: 2 },
      { id: 'onion-rings', name: 'Onion rings', price: 5 },
      { id: 'ovo-frito', name: 'Ovo frito', price: 3 },
      { id: 'queijo-cheddar-fatia', name: 'Queijo cheddar (fatia)', price: 4 },
      { id: 'queijo-coalho-fatia', name: 'Queijo coalho (fatia)', price: 4 },
      { id: 'queijo-mussarela-fatia', name: 'Queijo mussarela (fatia)', price: 4 },
      { id: 'geleia-de-pimenta', name: 'Geleia de pimenta', price: 4 },
    ],
  },

  'mais-maionese': {
    id: 'mais-maionese',
    title: 'Adicionar mais maionese ao seu pedido?',
    hint: 'Opcional · até 11 sachês',
    required: false,
    min: 0,
    max: 1,
    maxTotalQty: 11,
    options: [{ id: 'maionese-temperada-sache', name: 'Maionese temperada (sachê)', price: 1, maxQty: 11 }],
  },

  retirar: {
    id: 'retirar',
    title: 'Retirar algum item?',
    hint: 'Opcional · até 10',
    required: false,
    min: 0,
    max: 10,
    options: [
      { id: 'sem-bacon', name: 'Sem bacon', price: 0 },
      { id: 'sem-creme-de-cheddar', name: 'Sem creme de cheddar', price: 0 },
      { id: 'sem-cebola-caramelizada', name: 'Sem cebola caramelizada', price: 0 },
      { id: 'sem-queijo-cheddar', name: 'Sem queijo cheddar', price: 0 },
      { id: 'sem-salada', name: 'Sem salada', price: 0 },
      { id: 'sem-tomate', name: 'Sem tomate', price: 0 },
      { id: 'sem-cebola-roxa', name: 'Sem cebola roxa', price: 0 },
      { id: 'sem-calabresa', name: 'Sem calabresa', price: 0 },
      { id: 'sem-cream-cheese', name: 'Sem cream cheese', price: 0 },
      { id: 'sem-geleia-de-pimenta', name: 'Sem geleia de pimenta', price: 0 },
      { id: 'sem-queijo-coalho', name: 'Sem queijo coalho', price: 0 },
      { id: 'sem-carne-de-sol', name: 'Sem carne de sol', price: 0 },
      { id: 'sem-geleia-de-bacon', name: 'Sem geleia de bacon', price: 0 },
      { id: 'sem-barbecue', name: 'Sem barbecue', price: 0 },
      { id: 'sem-onion-rings', name: 'Sem onion rings', price: 0 },
      { id: 'sem-alface', name: 'Sem alface', price: 0 },
    ],
  },

  complementos: {
    id: 'complementos',
    title: 'Complementos',
    hint: 'Opcional',
    required: false,
    min: 0,
    max: 1,
    options: [{ id: 'geleia-de-pimenta', name: 'Geleia de pimenta', price: 4 }],
  },
};
