# AGENTS.md

## Observação

Sempre busque documentações atualizadas usando MCP context7 e sempre use as skills para executar as tarefas e se tiver algumas dúvida, questione antes de prosseguir.

## Objetivo

Este repositório contém a API do projeto Affilifind, focada em "achadinhos" e afiliados. O estado atual está centrado na integração com a Shopee, com sincronização de produtos, listagem de promoções e envio de promoções para um canal do Telegram.

## Visão Geral Da Aplicação

- Runtime: Node.js + TypeScript em `type: module`.
- Web framework: Fastify.
- Banco: PostgreSQL via Prisma.
- Validação: Zod.
- HTTP externo: Axios.
- DI: container próprio em `src/kermel/di/Registry.ts`, alimentado pelo decorator `@Injectable()`.
- Ponto de entrada: `src/main/server.ts` -> `src/main/app.ts`.
- Alias de importação:
  - `@application/*`
  - `@infra/*`
  - `@kermel/*`
  - `@main/*`
  - `@shared/*`

## Fluxo De Inicialização

1. `src/main/server.ts` sobe o Fastify em `0.0.0.0` e usa `env.PORT`.
2. `src/main/app.ts` registra CORS, rota `GET /`, rotas da Shopee e handler global de erros.
3. `reflect-metadata` precisa ser carregado antes da resolução via decorator.
4. O `fastifyAdapter` resolve controllers via `Registry` e injeta `body`, `params` e `queryParams`.

## Rotas Atuais

Base: `/api/v1/shopee`

- `GET /api/v1/shopee/promotions`
  - Lista promoções com filtros e paginação.
- `POST /api/v1/shopee/sync`
  - Sincroniza produtos da Shopee e persiste no banco.
- `POST /api/v1/shopee/send-promotions`
  - Seleciona promoções pendentes e retorna um preview do lote.
- `GET /`
  - Health check simples: `{ message: '🟢 OK' }`.

## Domínio E Persistência

### Tabelas Principais

- `users`
- `affiliate_credentials`
- `promotions`
- `search_keywords`

### Modelos Relevantes

- `Promotion`
  - Guarda dados do item, preços, comissão, imagem, links e status de envio.
- `SearchKeyword`
  - Guarda palavras-chave por categoria, com controle de uso (`lastUsedAt`) e ativação.

### Prisma

- Schema em `prisma/schema.prisma`.
- O client é gerado em `generated/prisma` conforme a config atual.
- O `postinstall` executa `prisma generate`.

## Caso De Uso Da Shopee

### Sync

Arquivo: `src/application/usecases/shopee/SyncShopeeProductsUseCase.ts`

Comportamento atual:

- Usa keywords enviadas manualmente, se existirem.
- Caso contrário, busca keywords dinâmicas em `search_keywords`.
- Se não houver keywords no banco, usa fallback estático.
- Consulta a Shopee em lotes.
- Filtra produtos com:
  - `rating >= 4.7`
  - `salesCount >= 100`
- Faz `upsert` na tabela `promotions`.

Regras atuais importantes:

- Keywords manuais recebem categoria `geral`.
- O fluxo insere/atualiza por `externalId`.
- Existe pausa entre buscas para reduzir agressividade (`setTimeout`).

### Send Promotions

Arquivo: `src/application/usecases/shopee/SendPromotionsToChannelsUseCase.ts`

Comportamento atual:

- Busca promoções com `sentAt = null`.
- Agrupa por categoria.
- Seleciona até 10 itens, no máximo 1 por categoria.
- Não envia nem marca `sentAt`.
- Serve como lote/payload neutro para o publisher.

### Dispatch Telegram

Arquivos:

- `src/application/usecases/telegram/DispatchPromotionsToTelegramUseCase.ts`
- `src/infra/gateways/TelegramGateway.ts`
- `src/infra/jobs/telegramPromotionsJob.ts`
- `src/infra/jobs/telegramPromotionsScheduler.ts`

Comportamento atual:

- Reaproveita o lote selecionado pelo use case da Shopee.
- Formata uma mensagem HTML para Telegram.
- Envia para um canal via Bot API.
- Marca `sentAt` apenas após sucesso do envio.
- Pode ser executado por runner externo via `pnpm job:telegram-promotions`.
- Pode ser habilitado no servidor com `TELEGRAM_PROMOTIONS_JOB_ENABLED=true`.
- Usa `node-cron` com cron padrão `0 */2 * * *` e timezone `America/Sao_Paulo`.

### Listagem

Arquivo: `src/infra/database/prisma/query/ListPromotionQuery.ts`

Suporta:

- busca textual por título
- filtro por plataforma
- filtro por faixa de preço
- ordenação por:
  - `sales_count`
  - `current_price`
  - `discount_percentage`
  - `rating`
  - `created_at`

## Integração Shopee

Arquivo: `src/infra/gateways/ShopeeGateway.ts`

Pontos importantes:

- A assinatura da requisição é `SHA256(appId + timestamp + payload + secret)`.
- O corpo é enviado como JSON string bruto.
- O endpoint e credenciais vêm de `.env`.
- Campos retornados pela gateway são normalizados antes de persistir.

## Configuração De Ambiente

Variáveis obrigatórias em `src/shared/config/env.ts`:

- `PORT` com default `3333`
- `DATABASE_URL`
- `SHOPEE_API_URL`
- `SHOPEE_APP_ID`
- `SHOPEE_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL_CHAT_ID`
- `TELEGRAM_API_URL` com default `https://api.telegram.org`
- `TELEGRAM_PROMOTIONS_JOB_ENABLED` com default `false`
- `TELEGRAM_PROMOTIONS_CRON` com default `0 */2 * * *`
- `TELEGRAM_PROMOTIONS_TIMEZONE` com default `America/Sao_Paulo`

## Scripts Úteis

- `pnpm dev`
  - Roda em watch com `@swc-node/register`.
- `pnpm build`
  - Gera `dist/server.js` com `tsup`.
- `pnpm start`
  - Executa o build gerado.
- `pnpm typecheck`
  - Roda `tsc --noEmit`.
- `pnpm seed:keywords`
  - Popula `search_keywords` com categorias e palavras de busca.
- `pnpm job:telegram-promotions`
  - Executa uma rodada única de seleção + envio para o canal do Telegram.

## Infra Local

- `docker-compose.yml` sobe um Postgres local.
- Banco padrão:
  - usuário: `root`
  - senha: `password`
  - database: `dev-affilifind`
  - porta: `5432`

## Convenções Do Projeto

- Use `apply_patch` para editar arquivos.
- Preserve os aliases existentes em vez de trocar tudo para imports relativos.
- Controllers seguem o contrato `Controller<TType, TBody>`.
- Erros HTTP e de aplicação são convertidos em payload padronizado por `fastifyErrorResponse`.
- O shape de erro atual é:
  - `{ error: { code, message } }`

## Pontos De Atenção Atuais

- Há inconsistência entre alguns tipos e o payload real:
  - o sync usa `body.keywords`, mas o tipo interno do controller ainda está desalinhado em relação a isso.
- `page` é tratado como 1-based na entrada, mas o `meta.page_index` retorna base zero.
- O campo `limit_perPage` aparece com esse nome no retorno atual.
- `dist/` existe no repositório, mas a fonte de verdade é `src/`.
- O código tem regras de negócio embutidas diretamente nos use cases; antes de refatorar, confirme se a regra é intencional.
- O job do Telegram foi desenhado para ser disparado por scheduler externo ou runner dedicado, não por controller HTTP.

## Como Trabalhar Neste Projeto

1. Leia primeiro a rota/controller alvo.
2. Siga para o use case/query correspondente.
3. Só então toque em repositório, gateway ou schema.
4. Se alterar contratos de request/response, atualize o controller, a schema e os consumidores.
5. Se alterar persistência, revise o schema Prisma e a migração.

## Resumo Arquitetural

- Camada `application`: regras de negócio, controllers e entidades.
- Camada `infra`: Prisma, gateway Shopee, scripts e queries.
- Camada `main`: bootstrap, adapter Fastify e utilitários de request/erro.
- Camada `shared`: config e tipos genéricos.
