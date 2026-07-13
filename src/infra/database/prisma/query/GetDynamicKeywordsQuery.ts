import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class GetDynamicKeywordsQuery {
  async execute(input: GetDynamicKeywordsQuery.Input): Promise<GetDynamicKeywordsQuery.Output> {
    const limit = input.limit || 10;

    const distinctCategories = await prismaClient.searchKeyword.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true },
    });

    const categoriesToQuery = distinctCategories
      .map((c) => c.category)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    const keywords: string[] = [];
    const keywordIdsToUpdate: string[] = [];

    for (const category of categoriesToQuery) {
      const record = await prismaClient.searchKeyword.findFirst({
        where: {
          isActive: true,
          category,
        },
        orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'desc' }],
      });

      if (record) {
        keywords.push(record.keyword);
        keywordIdsToUpdate.push(record.id);
      }
    }

    if (keywordIdsToUpdate.length > 0) {
      await prismaClient.searchKeyword.updateMany({
        where: { id: { in: keywordIdsToUpdate } },
        data: { lastUsedAt: new Date() },
      });
    }

    return { keywords };
  }
}

export namespace GetDynamicKeywordsQuery {
  export type Input = {
    limit?: number;
  };

  export type Output = {
    keywords: Array<string>;
  };
}
