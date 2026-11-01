import { SITE_FEATURES } from "../config/site-features";

// By default, categories retain their content-derived sorting. A site can
// append selected categories to the end in a stable, explicitly chosen order.
export function orderNoteCategoriesAtEnd<T extends { category: string }>(groups: T[]): T[] {
  const appendedOrder = new Map<string, number>(
    SITE_FEATURES.noteTaxonomy.appendedCategoryOrder.map((category: string, index: number) => [category, index]),
  );
  return [...groups].sort((left, right) => {
    const leftOrder = appendedOrder.get(left.category);
    const rightOrder = appendedOrder.get(right.category);
    if (leftOrder === undefined && rightOrder === undefined) return 0;
    if (leftOrder === undefined) return -1;
    if (rightOrder === undefined) return 1;
    return leftOrder - rightOrder;
  });
}
