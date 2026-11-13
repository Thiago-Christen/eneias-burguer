# Campanha visual Enéias Burguer

14 imagens geradas: oito quadros da montagem, cinco recriações de produtos e uma abertura em camadas. As imagens de campanha foram geradas por IA usando as capturas do catálogo como referência; não são fotografias documentais. Validar ingredientes, tamanho, apresentação, preços e disponibilidade com a casa antes de divulgação comercial. A box animada é um conceito e não define um combo à venda.

## Arquivos no site

- `src/assets/motion/frame-01.webp` a `frame-08.webp`: sequência ordenada.
- `src/assets/campaign/duplo-bacon.webp`, `x-salada.webp`, `x-nachos.webp`, `smash.webp` e `batata.webp`: produtos destacados.
- `src/assets/campaign/hero-exploded.webp`: abertura do site.
- `src/assets/campaign/box-conceito.webp`: mesma composição do oitavo quadro para a seção dos combos.

PNG original e WebP otimizado ficam no pacote de imagens entregue separadamente. Os recortes reais do catálogo foram preservados para os demais itens. O campo `campaignAsset` identifica as cinco recriações no catálogo compartilhado, e as telas marcam estas imagens como IA.

## Oito atos

1. Fundo preto, mesa escura e brasas discretas.
2. Duas pilhas de brioche, bacon, queijo e carne em camadas suspensas.
3. Camadas se aproximando para formar os dois hambúrgueres.
4. Os dois hambúrgueres descendo para a caixa kraft com forro preto.
5. Fritas, queijo e cebolinha entrando pela esquerda.
6. Anéis de cebola entrando pela direita.
7. Dois potinhos pretos com molhos descendo no centro.
8. Box completa, com todos os alimentos dentro.

As oito imagens deste pacote são referências de campanha. A vitrine atual usa uma sequência separada de 240 quadros extraídos do vídeo Gemini fornecido, com movimento nativo e oito etapas. O controle deslizante aceita teclado; o modo de movimento reduzido mostra a composição final. Veja `docs/VIDEO.md` para a fonte, resolução, extração e funcionamento do player.

## Direção e prompts

Direção comum: fotografia publicitária de alimentos, fundo preto, luz lateral quente, detalhes reais de brioche e textura do alimento, enquadramento fixo, sem letras ou marcas adicionadas.

Sequência: gerar primeiro a box final em 1536×1024. Caixa kraft aberta, dois burgers de brioche com carne, cheddar e bacon atrás; fritas com queijo e cebolinha à esquerda; onion rings à direita; dois potes pretos de molho ao centro. Reusar essa referência para os sete quadros anteriores, removendo ou suspendendo os elementos conforme cada ato. Manter câmera, caixa, iluminação e fundo fixos.

Produtos: recriar somente o item indicado na captura, remover a interface, usar um produto central sobre pedra escura e fundo preto, sem inventar novos ingredientes. Duplo Bacon: duas carnes, queijo e bacon; X-Salada: brioche, carne, queijo, alface, tomate e molho visíveis; X-Nachos: brioche, uma carne, queijo e nachos; Smash: três carnes finas, queijo, bacon e fritas; Batata completa: fritas, queijo e bacon conforme referência.

Abertura: Duplo Bacon em camadas suspensas na metade direita de uma imagem horizontal. Metade esquerda preta para texto. Brasas discretas, queijo derretido, sem caixa, pessoas ou letras.

## Componentes

Revelação de palavras adaptada da lógica do ScrollReveal de React Bits. Entrada de texto e abertura/fechamento de modal com as receitas gratuitas de Transitions.dev. Direção editorial informada por Taste Skill, ajustada ao pedido explícito de fundo preto e animação de produto. As licenças ficam em `THIRD_PARTY_NOTICES.md`. O projeto continua estático e não depende de React para executar esses efeitos.

As páginas de pedidos, caixa e salão continuam demonstrativas e usam dados do mesmo navegador. Esta mudança não adiciona backend ou autenticação operacional.
