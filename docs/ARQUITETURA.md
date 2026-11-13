# Divisão e implantação

Manter um monorepo inicialmente facilita compartilhar catálogo, componentes visuais e regras de pedido. Os frontends são separados por rota e módulo; só a landing possui a abertura de apresentação. A proposta comercial tem URL própria e não fica no menu público.

## Evolução para sistema real

O caixa, o garçom e o cliente precisam consumir a mesma API, com armazenamento persistente. Um QR de mesa estático pode abrir a página, mas não deve sozinho autorizar pedidos. Vincular a visita a uma sessão de mesa controlada pelo servidor, com expiração e opção de ativação pela equipe. Um parâmetro `?mesa=04` é apenas uma identificação na demonstração, facilmente alterável.

| Operação sugerida | Endpoint futuro | Acesso |
| --- | --- | --- |
| Consultar catálogo | GET /api/catalogo | Público |
| Iniciar sessão da mesa | POST /api/mesas/sessoes | QR validado e política da casa |
| Criar pedido | POST /api/pedidos | Sessão de mesa ou checkout validado |
| Acompanhar pedido | GET /api/pedidos/:id | Token específico do pedido |
| Registrar chamado | POST /api/chamados | Sessão de mesa |
| Entrar como funcionário | POST /api/auth/sessao | Credenciais da equipe |
| Consultar fila | GET /api/gestao/pedidos | Caixa ou cozinha |
| Atualizar etapa | PATCH /api/gestao/pedidos/:id/status | Permissão e transição validada |
| Despachar | POST /api/gestao/pedidos/:id/despacho | Caixa |
| Atualizar catálogo | PATCH /api/gestao/produtos/:id | Administrador |

São contratos propostos, ainda não implementados. O servidor calcula preços e taxas a partir de produtos válidos; não confia em totais do cliente. Usar idempotência na criação para evitar duplicidade e controlar transições de etapa e disponibilidade. O acompanhamento deve atualizar por evento ou consultas periódicas sem expor pedidos de outros clientes.

Para operação: autenticação e autorização no servidor, logs de alterações, backups, tratamento de queda de conexão, limites contra abuso e proteção dos dados necessários à entrega. Separar pagamento de etapa de produção. Validar impressora, cozinha, horários, regiões, capacidade de entrega e processo de cancelamento com a equipe antes do lançamento.

## Validação da prévia

Testar mesa 04 em uma aba, caixa em outra: criar pedido, confirmar, preparar, concluir e atualizar o acompanhamento. Testar garçom, chamado da mesa e conferência de conta. A sincronização local é para venda do conceito e não substitui teste entre dispositivos com backend.

## Oferta

1. Presença: site, catálogo e configuração inicial dos links.
2. Operação: pedidos, caixa, salão e implantação do servidor.
3. Adicionais: produção de conteúdo, fotografia, vídeo e placas físicas.

Os brindes devem ter limite e custo embutido. Cobrar produção recorrente, hardware e suporte adicional com escopo explícito. A prioridade da operação deve ser validada com o proprietário; as capturas não comprovam por si só falta de sistema ou a origem dos problemas de delivery.
