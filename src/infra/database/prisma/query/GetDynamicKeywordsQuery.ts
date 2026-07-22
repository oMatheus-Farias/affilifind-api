import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class GetDynamicKeywordsQuery {
  async execute(input: GetDynamicKeywordsQuery.Input): Promise<GetDynamicKeywordsQuery.Output> {
    const limit = input.limit || 12;
    const keywordsPerCategory = input.keywordsPerCategory || 2;

    const activeKeywords = await prismaClient.searchKeyword.findMany({
      where: { isActive: true },
      select: {
        id: true,
        keyword: true,
        category: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    if (activeKeywords.length === 0) {
      return { keywords: [] };
    }

    const categoriesMap = new Map<
      string,
      Array<{
        id: string;
        keyword: string;
        category: string;
        lastUsedAt: Date | null;
        createdAt: Date;
        randomTieBreaker: number;
      }>
    >();

    for (const keyword of activeKeywords) {
      const categoryKeywords = categoriesMap.get(keyword.category) ?? [];

      categoryKeywords.push({
        ...keyword,
        randomTieBreaker: Math.random(),
      });

      categoriesMap.set(keyword.category, categoryKeywords);
    }

    const categoriesToPrioritize = [...categoriesMap.entries()]
      .map(([category, keywords]) => {
        const totalCount = keywords.length;
        const usedCount = keywords.filter((item) => item.lastUsedAt !== null).length;
        const oldestReference = keywords.reduce(
          (oldest, current) => {
            const currentReference = current.lastUsedAt ?? current.createdAt;

            if (!oldest) {
              return currentReference;
            }

            return currentReference < oldest ? currentReference : oldest;
          },
          null as Date | null,
        );

        return {
          category,
          coverageRatio: usedCount / totalCount,
          oldestReference: oldestReference ?? new Date(0),
          randomTieBreaker: Math.random(),
        };
      })
      .sort((left, right) => {
        const byCoverage = left.coverageRatio - right.coverageRatio;

        if (byCoverage !== 0) {
          return byCoverage;
        }

        const byRecency = left.oldestReference.getTime() - right.oldestReference.getTime();

        if (byRecency !== 0) {
          return byRecency;
        }

        return left.randomTieBreaker - right.randomTieBreaker;
      })
      .map((entry) => entry.category);

    const sortedKeywordsByCategory = new Map<string, typeof activeKeywords>();
    for (const [category, keywords] of categoriesMap.entries()) {
      sortedKeywordsByCategory.set(
        category,
        [...keywords].sort((left, right) => {
          const leftReference = left.lastUsedAt ?? left.createdAt;
          const rightReference = right.lastUsedAt ?? right.createdAt;

          const byRecency = leftReference.getTime() - rightReference.getTime();
          if (byRecency !== 0) {
            return byRecency;
          }

          const byCreation = left.createdAt.getTime() - right.createdAt.getTime();
          if (byCreation !== 0) {
            return byCreation;
          }

          return left.randomTieBreaker - right.randomTieBreaker;
        }),
      );
    }

    const keywordsWithCategory: Array<{ keyword: string; category: string }> = [];
    const keywordIdsToUpdate: string[] = [];
    const maxRounds = Math.min(
      keywordsPerCategory,
      Math.ceil(limit / Math.max(categoriesToPrioritize.length, 1)),
    );

    for (let round = 0; round < maxRounds; round++) {
      for (const category of categoriesToPrioritize) {
        if (keywordsWithCategory.length >= limit) {
          break;
        }

        const categoryKeywords = sortedKeywordsByCategory.get(category) ?? [];
        const record = categoryKeywords[round];

        if (!record) {
          continue;
        }

        keywordsWithCategory.push({
          keyword: record.keyword,
          category: record.category,
        });
        keywordIdsToUpdate.push(record.id);
      }
    }

    if (keywordsWithCategory.length === 0) {
      return { keywords: [] };
    }

    // Atualiza a data de uso das palavras de uma só vez.
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
    keywordsPerCategory?: number;
  };

  export type Output = {
    keywords: Array<{ keyword: string; category: string }>;
  };
}
