
import React, { useState, useRef } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight, Users, Receipt } from 'lucide-react';
import { Person, Item } from '../types';

interface ItemsStepProps {
  people: Person[];
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  tax: number;
  setTax: (val: number) => void;
  tip: number;
  setTip: (val: number) => void;
  currency: string;
  onNext: () => void;
  onBack: () => void;
}

const ItemsStep: React.FC<ItemsStepProps> = ({ 
  people, items, setItems, tax, setTax, tip, setTip, currency, onNext, onBack 
}) => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const itemInputRef = useRef<HTMLInputElement>(null);

  const addItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    const price = parseFloat(itemPrice);
    if (itemName.trim() && !isNaN(price) && price >= 0) {
      setItems([
        ...items,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: itemName.trim(),
          price: price,
          assignedTo: people.map(p => p.id)
        }
      ]);
      setItemName('');
      setItemPrice('');
      // Return focus to the item name field as requested
      itemInputRef.current?.focus();
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const togglePersonOnItem = (itemId: string, personId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(personId);
        return {
          ...item,
          assignedTo: isAssigned 
            ? item.assignedTo.filter(pid => pid !== personId)
            : [...item.assignedTo, personId]
        };
      }
      return item;
    }));
  };

  const itemsSubtotal = items.reduce((acc, curr) => acc + curr.price, 0);
  const runningTotal = itemsSubtotal + tax + tip;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-1 uppercase tracking-tight">RECEIPT ITEMS</h2>
        <p className="text-sm text-zinc-500">Log your receipt details exactly as they appear.</p>
      </div>

      <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-2 bg-zinc-50 p-3 border border-zinc-200">
        <div className="flex-1">
          <input
            ref={itemInputRef}
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Description"
            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 text-sm font-medium"
          />
        </div>
        <div className="w-full sm:w-32 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{currency}</div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 bg-white border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 text-sm font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={!itemName.trim() || !itemPrice || parseFloat(itemPrice) < 0}
          className="bg-zinc-900 hover:bg-black disabled:opacity-20 text-white font-bold px-6 py-3 rounded-none flex items-center justify-center gap-2 transition-all text-[11px] uppercase tracking-widest"
        >
          <Plus size={16} /> ADD
        </button>
      </form>

      {/* Running Total Indicator */}
      <div className="flex justify-between items-center py-2 px-4 border border-zinc-900 bg-zinc-900 text-white">
        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <Receipt size={14} /> Running Receipt Total
        </span>
        <span className="font-bold text-sm">{currency}{runningTotal.toFixed(2)}</span>
      </div>

      <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white border border-zinc-200 transition-all hover:border-zinc-400">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-tight">{item.name}</h4>
                <span className="text-zinc-500 font-bold text-xs">{currency}{item.price.toFixed(2)}</span>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-zinc-300 hover:text-zinc-900 p-1 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {people.map((person) => {
                const isSelected = item.assignedTo.includes(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => togglePersonOnItem(item.id, person.id)}
                    className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-tighter transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-900 text-white' 
                        : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    {person.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-16 text-center text-zinc-300 border border-dashed border-zinc-200 text-xs font-bold uppercase tracking-widest">
            LIST IS EMPTY
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-zinc-100">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">TOTAL TAX</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{currency}</div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tax === 0 ? '' : tax}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                if (val >= 0) setTax(val);
              }}
              className="w-full pl-8 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 text-sm font-medium"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">TOTAL TIP</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{currency}</div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tip === 0 ? '' : tip}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                if (val >= 0) setTip(val);
              }}
              className="w-full pl-8 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 text-sm font-medium"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-zinc-100 mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-900 transition-all"
        >
          <ArrowLeft size={14} /> BACK
        </button>
        <button
          onClick={onNext}
          disabled={items.length === 0}
          className="bg-zinc-900 hover:bg-black disabled:opacity-20 text-white font-bold py-3 px-8 rounded-none flex items-center gap-2 transition-all text-xs tracking-widest"
        >
          CALCULATE SPLIT <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ItemsStep;
