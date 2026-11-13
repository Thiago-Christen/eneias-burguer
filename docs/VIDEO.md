# Vídeo Gemini controlado por rolagem

Fonte: `gemini_generated_video_89f22d79.mp4`, fornecida pelo usuário. O arquivo tem 1280 × 720 pixels, 24 fps e aproximadamente 10,03 segundos. Foram extraídos 240 quadros nativos, sem interpolação nem aumento artificial de resolução. O áudio não é usado na página. A identidade/hash da fonte está no manifest.

## Sequências

- Desktop: 240 WebP em 1280 × 720, qualidade 86, aproximadamente 11,86 MiB no total.
- Celular: 240 WebP em 768 × 432, qualidade 84, aproximadamente 5,82 MiB no total.
- Cada dispositivo busca apenas uma variante. As duas compartilham os mesmos índices e tempos. A seleção é feita ao iniciar a seção; redimensionar preserva a variante selecionada.
- `opening.webp` e `poster.webp` são cópias exatas do primeiro e do último quadro desktop. O vídeo MP4 original permanece no arquivo enviado, fora do build do site.

## Experiência imersiva

`FoodFrameSequence` guarda os blobs comprimidos e mantém até 24 imagens decodificadas no desktop ou 14 no celular. Faz quatro buscas e duas decodificações simultâneas, priorizando o trecho solicitado. A janela acompanha a posição da rolagem; bitmaps distantes são fechados. O carregamento começa até 1400 px antes da seção. O restante da variante é pré-carregado em segundo plano.

O canvas desenha os quadros nativos, sem misturar imagens vizinhas. A seção ocupa a tela e começa sobre fundo preto. Os primeiros 10% da rolagem mantêm a abertura; de 10% a 78%, os 240 quadros acompanham a rolagem. O enquadramento começa preenchendo a tela e abre progressivamente para revelar a composição inteira. De 78% a 95%, a box pronta diminui e dá lugar ao texto de marca: ao lado no computador e abaixo no celular. Não há capítulos, slider ou painéis sobre os alimentos.

O conteúdo da fonte continua sem interpolação ou aumento artificial de qualidade. A apresentação usa recorte inicial e reenquadramento responsivo; a qualidade do vídeo original continua sendo o limite.

Com `prefers-reduced-motion`, somente a composição final é mostrada, sem alongamento da seção nem carregamento das sequências. Falha de carregamento inicial também oferece imagem final e fluxo normal de página.

## Reexportar

Requer FFmpeg, ffprobe, Python 3 e Node. Na raiz do projeto:

```bash
bash scripts/extract-frames.sh /caminho/video.mp4
```

Para um trecho específico, use `--start 0 --duration 10 --fps 24`. O exportador suporta de 8 a 600 frames e não aumenta a taxa de quadros nem a resolução da fonte. Revise o mapeamento de progresso em `src/shared/motion.js` caso substitua a sequência.

As imagens continuam sendo conteúdo publicitário sintético, com composição ilustrativa a validar com o restaurante.
