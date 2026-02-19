
import { Person, Item, CalculationResult } from '../types';

export const calculateTotals = (
  people: Person[],
  items: Item[],
  tax: number,
  tip: number
): CalculationResult[] => {
  const personSubtotals: Record<string, number> = {};
  const personItems: Record<string, Item[]> = {};
  
  people.forEach(p => {
    personSubtotals[p.id] = 0;
    personItems[p.id] = [];
  });

  let totalItemCosts = 0;
  items.forEach(item => {
    totalItemCosts += item.price;
    if (item.assignedTo.length > 0) {
      const share = item.price / item.assignedTo.length;
      item.assignedTo.forEach(pid => {
        if (personSubtotals[pid] !== undefined) {
          personSubtotals[pid] += share;
          personItems[pid].push(item);
        }
      });
    }
  });

  return people.map(p => {
    const subtotal = personSubtotals[p.id] || 0;
    const proportion = totalItemCosts > 0 ? subtotal / totalItemCosts : 0;
    const pTax = tax * proportion;
    const pTip = tip * proportion;
    
    return {
      personId: p.id,
      name: p.name,
      subtotal: subtotal,
      tax: pTax,
      tip: pTip,
      total: subtotal + pTax + pTip,
      assignedItems: personItems[p.id] || []
    };
  });
};
