type TelegramPromotionItem = {
  id: string;
  title: string;
  currentPrice: number;
  maxPrice: number | null;
  discountPercentage: number | null;
  imageUrl: string;
  affiliateUrl: string;
  originalProductUrl: string | null;
  category: string;
  salesCount: number;
  rating: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildTelegramPromotionCaption(product: TelegramPromotionItem) {
  const title = escapeHtml(truncate(product.title, 90));
  const category = escapeHtml(product.category || 'outros');
  const price = product.currentPrice.toFixed(2).replace('.', ',');
  const maxPrice = product.maxPrice ? product.maxPrice.toFixed(2).replace('.', ',') : null;
  const discount = product.discountPercentage ? `${product.discountPercentage.toFixed(0)}%` : 'n/a';
  const rating = product.rating.toFixed(1);
  const sales = product.salesCount.toLocaleString('pt-BR');
  const affiliateUrl = escapeHtml(product.affiliateUrl);
  // const originalUrl = product.originalProductUrl ? escapeHtml(product.originalProductUrl) : null;

  return [
    `🔥 <b> ACHADINHO </b> 🔥`,
    '',
    `🛒  <b>${title}</b>`,
    '',
    `👉  Categoria: ${category}`,
    '',
    `💰  Preço: <b>R$ ${price}</b>`,
    '',
    maxPrice ? `💲  Antes: R$ ${maxPrice}` : null,
    '',
    `💸  Desconto: <b>${discount}</b>`,
    '',
    `⭐  Avaliação: ${rating}`,
    '',
    `👀  Vendas: ${sales}`,
    '',
    `<a href="${affiliateUrl}">👉  COMPRAR AGORA  👈</a>`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

export function buildTelegramPromotionReplyMarkup(affiliateUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: '🛒  Comprar na oferta',
          url: affiliateUrl,
        },
      ],
    ],
  };
}

export type { TelegramPromotionItem };
