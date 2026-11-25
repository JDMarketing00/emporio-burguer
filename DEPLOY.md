# Como colocar o site no ar (Cloudflare Pages + domínio do registro.br)

Resumo: o site fica hospedado de graça no **Cloudflare Pages**, na sua conta. O **cliente**
compra o domínio no **registro.br** (no CNPJ dele) e você aponta esse domínio para o Cloudflare.

Os menus do Cloudflare mudam de nome de vez em quando; se algum botão estiver um pouco
diferente, procure pelo nome parecido.

---

## Publicação atual

O site foi publicado no Cloudflare como **Worker com arquivos estáticos** (configuração em
`wrangler.jsonc`, pasta `dist/`), no endereço:

**https://emporio-burguer.elegant-star-3e6.workers.dev**

A publicação foi feita numa conta temporária do Cloudflare. Para ela virar sua, alguém precisa
abrir o link de "Claim" e entrar na conta Cloudflare dentro de 60 minutos.
Depois do Claim, para publicar uma versão nova: `npx wrangler login` e depois `npm run build && npx wrangler deploy`.
O domínio do cliente entra em **Workers & Pages → emporio-burguer → Settings → Domains & Routes**.

---

## 1. Publicar (escolha um jeito)

### Jeito A — arrastar a pasta (mais rápido, sem programação)

1. Crie uma conta grátis em **dash.cloudflare.com**.
2. Menu **Workers & Pages** → **Create** (Criar) → aba **Pages** → **Upload assets** (enviar arquivos).
3. Nome do projeto: `emporio-burguer` → **Create project**.
4. Arraste o arquivo **`emporio-burguer-site-cloudflare.zip`** (ou a pasta `dist/` do projeto) → **Deploy**.
5. Pronto: o site fica num endereço tipo `https://emporio-burguer.pages.dev`.

Para atualizar (preço novo, produto novo): gere o build de novo e, no projeto do Cloudflare,
clique em **Create deployment** / **Upload** e envie a pasta `dist/` nova.

### Jeito B — GitHub (recomendado se for dar manutenção todo mês)

1. Suba o projeto num repositório do GitHub (sem a pasta `node_modules`).
2. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → escolha o repositório.
3. Configuração de build:
   - Framework preset: **Vite** (ou "None")
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Variável de ambiente (quando já tiver o domínio): `SITE_URL` = `https://www.dominiodocliente.com.br`
4. **Save and Deploy**. A partir daí, toda alteração enviada ao GitHub publica sozinha.

### Jeito C — pelo terminal

```bash
npm install
npx wrangler@3 login        # abre o navegador para entrar na conta Cloudflare
SITE_URL=https://www.dominiodocliente.com.br npm run deploy
```

---

## 2. Ligar o domínio do cliente

1. **Cliente compra o domínio** no registro.br (ex.: `emporioburguer.com.br`), no CNPJ dele.
   Peça o login do registro.br ou que ele faça o passo 3 com você.
2. No Cloudflare: **Add a domain** / **Adicionar domínio** → digite o domínio → plano **Free**.
   O Cloudflare mostra **2 servidores DNS** (nameservers), algo como `xxx.ns.cloudflare.com`.
3. No **registro.br**: entre no domínio → **DNS** → **Alterar servidores DNS** → cole os 2
   servidores do Cloudflare → salvar. Costuma ativar em algumas horas.
4. Quando o Cloudflare mostrar o domínio como **Ativo**: abra o projeto em **Workers & Pages** →
   **Custom domains** → **Set up a custom domain** → adicione `emporioburguer.com.br` e
   também `www.emporioburguer.com.br`. O HTTPS (cadeado) é configurado sozinho.
5. **Publique de novo com o domínio** (`SITE_URL`), para a prévia do link no WhatsApp mostrar a
   foto e o Google receber o sitemap:
   - Jeito A/C: `SITE_URL=https://www.emporioburguer.com.br npm run build` e envie a `dist/` nova.
   - Jeito B: coloque `SITE_URL` nas variáveis de ambiente do projeto e clique em **Retry deployment**.

---

## 3. Antes de entregar ao cliente

- [ ] Fazer um pedido de teste e confirmar que chega no WhatsApp da loja, (86) 98897-7712.
- [ ] Cliente confirmar as pendências do README (foto da Batata com Bacon, horário de sábado, PIX).
- [ ] Testar o endereço final no celular (Android e iPhone) e no computador.
- [ ] Colocar o link na bio do Instagram, no Google Meu Negócio (perfil no Google Maps) e no
      WhatsApp Business da loja.
- [ ] Combinar por escrito: valor da criação, valor mensal da manutenção (o que está incluído,
      ex.: trocar preços e fotos), e que o domínio fica no nome do cliente.
