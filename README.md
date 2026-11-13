# Enéias Burguer · Kit digital

Prévia comercial desenvolvida por Thiago Christen Pereira Soares. Identidade em preto, creme e laranja brasa, com tipografia condensada, imagens reais do catálogo e recriações publicitárias identificadas por IA. Projeto frontend estático. O build usa `qrcode` para gerar os QRs do domínio de publicação.

## Executar

```bash
npm ci
npm run build
python3 -m http.server 8080 --directory dist
```

Abra http://localhost:8080/proposta/ para começar a apresentação.

## Módulos

| URL | Fonte | Objetivo |
| --- | --- | --- |
| `/` | `src/apps/catalog.js` | Landing com vídeo imersivo, destaques, celular e NFC |
| `/cardapio/` | `src/apps/menu.js` | Cardápio independente com busca, categorias e QR |
| `/pedidos/` | `src/apps/orders.js` | Pedidos para retirada ou entrega |
| `/pedidos/?mesa=04` | mesmo módulo | Pedido com identificação da mesa pelo QR |
| `/gerenciamento/` | `src/apps/pos.js` | Fila do salão e delivery, despacho e comanda |
| `/garcom/` | `src/apps/waiter.js` | Mesas, lançamentos, chamados e conta |
| `/proposta/` | `src/apps/proposal.js` | Apresentação comercial e exemplos de redes |
| `/avaliar/` | mesmo módulo | Convite aberto para avaliar no Google |

São módulos por finalidade no mesmo repositório, com um catálogo comum. Não há duplicação de dados entre sistemas. A vitrine não apresenta atalhos internos para caixa ou garçom. A separação por URL nesta prévia não é uma barreira de segurança.

## Catálogo e imagens

`src/shared/catalog.json` é a fonte editável de 76 produtos sem repetições, transcritos das capturas do catálogo WhatsApp enviadas em 12/11/2026. `catalog.js` é gerado no build a partir desse JSON. Campos: ID, nome, preço, categoria, descrição, indicação de descrição confirmada e coordenadas da foto na captura.

Descrições cortadas não foram completadas com ingredientes inventados. Alguns nomes foram reduzidos ao trecho legível; confirmar os nomes completos, ingredientes, preços e disponibilidade com o proprietário antes de uso real. Cinco destaques usam recriações publicitárias por IA identificadas no cardápio; os demais usam recortes via CSS das capturas, de resolução limitada. O JSON vincula cada destaque ao arquivo de campanha. Validar apresentação, porções e ingredientes antes de uso comercial.

## O que funciona na demonstração

Busca, categorias, detalhes, adicionais, quantidades, observações, cálculo do total, criação de pedidos fictícios, acompanhamento, mudança de etapa, conferência de despacho, escolha de entregador, comanda, impressão pelo navegador, lançamento do garçom por mesa e chamados de atendimento.

Os dados ficam no `localStorage` (`eneias-demo-v4`) e atualizam outras abas do mesmo navegador e origem. Não sincronizam aparelhos. Não há pedido enviado ao restaurante, pagamento real, API de WhatsApp, impressora térmica automática, autenticação, autorização, estoque ou emissão fiscal. O caixa contém exemplos fictícios e a taxa de entrega de R$ 6,00 é ilustrativa. Só utilize dados fictícios nesta prévia.

## Vídeo e rolagem

A seção “A box” tem 240 quadros do vídeo Gemini (24 fps), sem controles de processo. O fundo preto preenche a tela; o enquadramento abre na rolagem e, no final, a imagem divide espaço com o texto da marca. No celular, a box diminui e o texto surge abaixo. O cache usa duas resoluções e limita as imagens decodificadas. Movimento reduzido mostra o resultado final estático. Veja `docs/VIDEO.md`.

## QR e NFC

`src/assets/table-04-qr.svg` aponta para a prévia da mesa 04; `review-qr.svg` aponta para a página de avaliação. Estes QRs são exemplos vinculados ao endereço atual da prévia, que conserva seu acesso privado. Regerar com o domínio e acesso aprovados antes de imprimir. NFC requer gravação da etiqueta física; o site não grava hardware.

A página de avaliação abre o perfil Google informado pelo usuário. O proprietário deve confirmar um link direto válido antes de gravar as placas. O convite não filtra clientes satisfeitos e não oferece recompensa por avaliações.

## Próxima etapa operacional

Ver `docs/ARQUITETURA.md`: servidor compartilhado, sessões de mesa emitidas e verificadas no servidor, conta de funcionários, permissões, validação de preços, histórico, idempotência, backup e integração da cozinha. A prévia não deve receber clientes reais.

## Conteúdo comercial

A página `/proposta/` contém conceitos de Facebook, Instagram, Google, placa NFC, QR de mesa e opções de pacote. Os exemplos não foram publicados nas redes. Não há promessa de alcance, classificação ou receita; definir escopo, produção, hardware, hospedagem e suporte antes de precificar.

## Componentes interativos da apresentação

- A vitrine tem um carrossel em perspectiva CSS 3D com quatro imagens publicitárias, navegação por botões, teclado ou arraste horizontal, descrição, preço e link vinculados ao produto selecionado. Os hambúrgueres são imagens em planos com profundidade, não malhas 3D rotacionáveis do alimento.
- `/proposta/#celular-3d` demonstra um celular construído em CSS 3D, com frente, verso, espessura, logo e cardápio interativo. Arraste o controle acima do celular ou a borda, use as setas com o celular/controle focado ou o botão para virar. Categorias, adição, remoção e resumo usam um estado isolado em memória; o link abre a experiência real da prévia sem transferir o minicarrinho.
- `/proposta/#mesa-interativa` apresenta uma placa em perspectiva com QR real da prévia, varredura visual, ondas NFC, confirmação e alternância Mesa 04/Avaliação. O efeito é acionado pelo botão e não lê câmera, NFC nem grava hardware. Os links preservam os destinos específicos.
- Não há reprodução automática no carrossel. `prefers-reduced-motion` desativa transições do celular e do carrossel e torna imediata a confirmação da simulação de aproximação.

## GitHub Pages

Os quatro acessos principais são `/`, `/cardapio/`, `/pedidos/` e `/gerenciamento/`. As rotas antigas `/caixa/`, `/garcom/`, `/proposta/` e `/avaliar/` continuam disponíveis. O QR da mesa 04 abre `/cardapio/?mesa=04`; a seleção mantém a identificação ao abrir os pedidos.

```bash
npm ci
npm run build:pages
```

A saída fica em `pages-dist/`, com links, imagens, frames e QRs compatíveis com o prefixo `/eneias-burguer`. Para outro repositório, configure `SITE_BASE_PATH` e `PUBLIC_SITE_URL`. O workflow publica pela opção **GitHub Actions** em Settings → Pages.

No repositório GitHub, as mídias são fornecidas em `asset-packs/` para manter a transferência organizada. O primeiro build restaura os arquivos automaticamente com Python 3. Todos os módulos, estilos e scripts ficam disponíveis como código. Não há segredos nem credenciais no projeto.

O gerenciador publicado é uma demonstração pública, com dados fictícios locais ao navegador. Não há autenticação nem sincronização entre dispositivos nesta versão.
