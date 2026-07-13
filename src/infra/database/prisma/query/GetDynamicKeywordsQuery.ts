import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class GetDynamicKeywordsQuery {
  async execute(input: GetDynamicKeywordsQuery.Input): Promise<GetDynamicKeywordsQuery.Output> {
    const limit = input.limit || 10;

    // 1. Descobre quais categorias distintas existem e estão ativas
    const distinctCategories = await prismaClient.searchKeyword.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true },
    });

    // Sorteia a ordem das categorias
    const categoriesToQuery = distinctCategories
      .map((c) => c.category)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    const keywordsWithCategory: Array<{ keyword: string; category: string }> = [];
    const keywordIdsToUpdate: string[] = [];

    // 2. Para cada categoria, busca o termo individual mais antigo
    for (const category of categoriesToQuery) {
      const record = await prismaClient.searchKeyword.findFirst({
        where: {
          isActive: true,
          category,
        },
        orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'desc' }],
      });

      if (record) {
        keywordsWithCategory.push({
          keyword: record.keyword,
          category: record.category,
        });
        keywordIdsToUpdate.push(record.id);
      }
    }

    // 3. Atualiza a data de uso das palavras de uma só vez
    if (keywordIdsToUpdate.length > 0) {
      await prismaClient.searchKeyword.updateMany({
        where: { id: { in: keywordIdsToUpdate } },
        data: { lastUsedAt: new Date() },
      });
    }

    return { keywords: keywordsWithCategory };
  }
}

export namespace GetDynamicKeywordsQuery {
  export type Input = {
    limit?: number;
  };

  export type Output = {
    keywords: Array<{ keyword: string; category: string }>;
  };
}
