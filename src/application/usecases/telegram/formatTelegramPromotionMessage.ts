type TelegramPromotionItem = {
  id: string;
  title: string;
  currentPrice: number;
  maxPrice: number | null;
  discountPercentage: number | null;
  imageUrl: string;
  affiliateUrl: string;
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

export function formatTelegramPromotionMessage(products: TelegramPromotionItem[]) {
  const header = `<b>Affilifind</b>\nNovos achadinhos selecionados para o canal:\n`;

  const body = products
    .map((product, index) => {
      const title = escapeHtml(product.title);
      const category = escapeHtml(product.category);
      const price = product.currentPrice.toFixed(2).replace('.', ',');
      const link = escapeHtml(product.affiliateUrl);
      const maxPrice = product.maxPrice ? product.maxPrice.toFixed(2).replace('.', ',') : null;
      const discount = product.discountPercentage
        ? `${product.discountPercentage.toFixed(0)}%`
        : 'n/a';
      const rating = product.rating.toFixed(1);
      const sales = product.salesCount.toLocaleString('pt-BR');

      return [
        `${index + 1}. <a href="${link}">${title}</a>`,
        `Categoria: ${category}`,
        `Preço: R$ ${price}`,
        maxPrice ? `Antes: R$ ${maxPrice}` : null,
        `Desconto: ${discount}`,
        `Avaliação: ${rating}`,
        `Vendas: ${sales}`,
      ]
        .filter((line): line is string => line !== null)
        .join('\n');
    })
    .join('\n\n');

  return `${header}\n${body}`;
}

export type { TelegramPromotionItem };
