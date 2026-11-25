# Empório Burguer Teresina — site com cardápio e pedido pelo WhatsApp

Site da hamburgueria Empório Burguer (Promorar, Teresina-PI): cardápio completo com fotos,
adicionais, sacola que fica salva no aparelho e finalização do pedido no WhatsApp da loja.

Feito com React 18 + TypeScript + Vite. Gera um site estático (pasta `dist/`) que pode ser
hospedado em qualquer lugar: Netlify, Vercel, Hostinger, GitHub Pages, etc.

## Rodar e publicar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # gera a pasta dist/ pronta para hospedar
npm run preview    # testa a versão final em http://localhost:4173
```

Para publicar, envie o conteúdo da pasta `dist/` para a hospedagem. Os caminhos são relativos,
então funciona tanto na raiz do domínio quanto numa subpasta.

## Onde editar cada coisa

| O que mudar | Arquivo |
|---|---|
| Produtos, preços, descrições, fotos, categorias | `src/data/menu.ts` |
| Adicionais (Turbine, molhos, retirar itens…) | `src/data/addons.ts` |
| Telefone/WhatsApp, endereço, horários, taxa, pedido mínimo, pagamentos | `src/data/store.ts` |
| Texto da mensagem enviada ao WhatsApp | `src/checkout/whatsapp.ts` |
| Cores e fontes | `src/styles/tokens.css` |
| Vitrine giratória (cartões, fotos, categorias) e cores do letreiro neon | `src/data/showcase.ts` |
| Ajustes do letreiro e do carrossel (velocidade, brilho, tamanho…) | `src/components/Showcase.tsx` |

### Trocar ou adicionar uma foto

1. Salve a foto em `public/images/products/<nome>.webp` (quadrada, de preferência 720×720).
2. Em `src/data/menu.ts`, no produto, use `image: '<nome>'` e `photoStatus: 'propria'`.

Para refazer os recortes automáticos a partir das fotos originais (`source-images/`):
`python3 scripts/process_images.py` (precisa de Python 3 com Pillow e NumPy).

### Adicionar um produto

Copie um bloco de produto em `src/data/menu.ts`, troque `id` (único, sem espaços),
`categoryId`, `name`, `description`, `price` e `image`. Para ter adicionais, informe
`addonGroups` com os ids de `src/data/addons.ts`.

## Estrutura

```
src/
  data/        menu.ts, addons.ts, store.ts, types.ts   ← dados editáveis
  components/  Header, Hero, WeeklyTop, Showcase, NeonLogo, CircularCarousel,
               Menu, ProductCard, ProductImage, ProductModal, CartDrawer,
               CartBar, StoreInfo, Footer, Icons
  cart/        CartContext.tsx (estado + salvamento), cartUtils.ts (preços, validação)
  checkout/    CheckoutForm.tsx (formulário + comanda), whatsapp.ts (mensagem)
  lib/         formatação, horário de funcionamento, hooks, armazenamento
  styles/      tokens, base, header-hero, menu, modal, cart, info
public/images/ products/ (fotos do cardápio) e brand/ (logo, ícones, foto do topo)
source-images/ fotos originais (MenuDino e enviadas pela loja)
scripts/       process_images.py (recorte e padronização das fotos)
```

## Letreiro neon e vitrine giratória

Logo depois do destaque "Top 1 da semana" fica o letreiro **Empório Burger** em neon
(`NeonLogo`) e a vitrine 3D (`CircularCarousel`) com as categorias.

- **Letreiro:** "Empório" em laranja e "Burger" em branco quente, como no logo. Acende piscando
  quando aparece na tela, o brilho varia devagar, as letras perto do mouse esquentam e um
  clique reacende. Fonte Tilt Neon.
- **Vitrine:** gira sozinha, pausa com o mouse em cima, aceita arrastar (com inércia e
  encaixe) e as setas do teclado. Tocar num cartão lateral traz ele para a frente; tocar
  no da frente leva à categoria no cardápio.
- Os dois param de animar fora da tela e respeitam a opção "reduzir movimento" do aparelho.

## Como o pedido funciona

1. O cliente escolhe os itens (com adicionais e observações) e eles ficam na sacola,
   salva no próprio aparelho.
2. Na finalização, informa nome, telefone, entrega/retirada/consumo no local, endereço,
   forma de pagamento e observações.
3. O botão **Enviar pedido pelo WhatsApp** abre a conversa com a loja com o pedido escrito.
   O pedido só chega quando o cliente envia a mensagem — o site deixa isso claro.
4. A taxa de entrega aparece como "a confirmar" (R$ 4 a R$ 18 conforme a distância,
   igual à MenuDino); a loja confirma pelo WhatsApp.

## Origem dos dados

Tudo foi conferido no cardápio da MenuDino (https://emporioburguerteresina.menudino.com/)
em 25/11/2026: 6 categorias, 32 produtos, preços, adicionais, composição dos combos,
endereço, telefone, horários, taxa, tempo de entrega, pedido mínimo e formas de pagamento.
Nenhum preço ou produto foi inventado.

## Pendências para a loja confirmar

- **WhatsApp**: o site usa o telefone da MenuDino, (86) 98897-7712. Confirme que esse número
  recebe WhatsApp (ou troque `whatsapp` em `src/data/store.ts`).
- **Foto da BATATA COM BACON**: a foto enviada mostra cheddar, que não aparece na descrição
  da MenuDino ("batata média com bacon em cubos"), por isso tem o selo "Foto ilustrativa".
- **Foto da BATATA P**: usa um recorte da foto da Batata Simples, marcado como
  "Foto ilustrativa".
- **Combos**: não têm foto própria na MenuDino (o Combo Mexicano tem uma arte com preço
  antigo de R$ 32,00, diferente do preço atual de R$ 30,00). O site mostra a foto do
  hambúrguer que vem no combo com o selo "2×".
- **Horário de sábado**: a MenuDino mostra 17:02 às 23:59. Se for 17:00, ajuste em `store.ts`.
- **PIX**: não aparece entre as formas de pagamento da MenuDino, por isso não foi incluído.
