/** Tipos compartilhados pelos arquivos de dados e componentes. */

export type CategoryId =
  | 'combos'
  | 'mais-pedidos'
  | 'artesanal'
  | 'matar-a-fome'
  | 'batatas'
  | 'bebidas';

export interface Category {
  id: CategoryId;
  /** Nome exibido, igual ao cardápio original da MenuDino. */
  name: string;
  /** Frase curta exibida abaixo do título da seção. */
  intro?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  /** Preço adicional por unidade. 0 = grátis. */
  price: number;
  /** Quantas vezes a mesma opção pode ser escolhida (padrão 1). */
  maxQty?: number;
}

export interface AddonGroup {
  id: string;
  title: string;
  /** Texto de ajuda exibido abaixo do título. */
  hint?: string;
  /** Obrigatório escolher pelo menos `min` opções. */
  required: boolean;
  min: number;
  /** Máximo de opções diferentes que podem ser marcadas. */
  max: number;
  /** Máximo de unidades somadas no grupo (para opções com quantidade). */
  maxTotalQty?: number;
  options: AddonOption[];
}

/**
 * Situação da foto do produto:
 * - 'propria'      foto do próprio produto (MenuDino ou enviada pela loja)
 * - 'ilustrativa'  foto do mesmo alimento, mas não do item exato (ex.: tamanho diferente)
 * - 'pendente'     ainda sem foto; o site mostra um quadro "foto em breve"
 */
export type PhotoStatus = 'propria' | 'ilustrativa' | 'pendente';

export interface ComboPart {
  qty: number;
  productId: string;
}

export interface Product {
  id: string;
  categoryId: CategoryId;
  /** Nome exatamente como no cardápio original. */
  name: string;
  description?: string;
  /** Preço em reais. */
  price: number;
  /** Nome do arquivo em public/images/products, sem extensão. */
  image?: string;
  photoStatus: PhotoStatus;
  /** Grupos de adicionais (ids de data/addons.ts). */
  addonGroups?: string[];
  /** Itens que compõem um combo. */
  combo?: ComboPart[];
  /** Id do produto na MenuDino, para conferência. */
  menudinoId: string;
}
