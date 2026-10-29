import type { Prize, PrizeCategory } from '~/models';
import { MOCK_CATEGORIES, MOCK_PRIZES } from '~/utils/mockPrizes';

export const usePrizesStore = () => {
  const categories = useState<PrizeCategory[]>('prizeCategories', () => [...MOCK_CATEGORIES]);
  const allPrizes = useState<Prize[]>('allPrizes', () => [...MOCK_PRIZES]);

  const addCategory = (category: PrizeCategory) => {
    categories.value.unshift(category);
  };

  const updateCategory = (id: string, updates: Partial<PrizeCategory>) => {
    const index = categories.value.findIndex(c => c.id === id);
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates } as PrizeCategory;
    }
  };

  const deleteCategory = (id: string) => {
    categories.value = categories.value.filter(c => c.id !== id);
    allPrizes.value = allPrizes.value.filter(p => p.categoryId !== id);
  };

  const addPrize = (prize: Prize) => {
    allPrizes.value.unshift(prize);
  };

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    const index = allPrizes.value.findIndex(p => p.id === id);
    if (index !== -1) {
      allPrizes.value[index] = { ...allPrizes.value[index], ...updates } as Prize;
    }
  };

  const deletePrize = (id: string) => {
    allPrizes.value = allPrizes.value.filter(p => p.id !== id);
  };

  return {
    categories,
    allPrizes,
    addCategory,
    updateCategory,
    deleteCategory,
    addPrize,
    updatePrize,
    deletePrize
  };
};
