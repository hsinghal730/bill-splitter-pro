
import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Person, Item } from './types';
import { calculateTotals } from './utils/calculations';
import PeopleStep from './components/PeopleStep';
import ItemsStep from './components/ItemsStep';
import SummaryStep from './components/SummaryStep';

type Step = 'setup' | 'people' | 'items' | 'summary';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: 'C$' },
];

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('setup');
  const [splitName, setSplitName] = useState('New Split');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [people, setPeople] = useState<Person[]>([]);
  const [payerId, setPayerId] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);

  const results = useMemo(() => calculateTotals(people, items, tax, tip), [people, items, tax, tip]);

  const handleNext = () => {
    if (step === 'setup') setStep('people');
    else if (step === 'people') setStep('items');
    else if (step === 'items') setStep('summary');
  };

  const handleBack = () => {
    if (step === 'people') setStep('setup');
    else if (step === 'items') setStep('people');
    else if (step === 'summary') setStep('items');
  };

  const renderProgress = () => {
    const steps: { key: Step; label: string }[] = [
      { key: 'setup', label: 'Start' },
      { key: 'people', label: 'People' },
      { key: 'items', label: 'Items' },
      { key: 'summary', label: 'Split' },
    ];

    return (
      <div className="flex items-center justify-between mb-8 max-w-lg mx-auto px-4">
        {steps.map((s, idx) => {
          const isActive = step === s.key;
          const isDone = steps.findIndex(x => x.key === step) > idx;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 border flex items-center justify-center text-[10px] font-bold transition-colors duration-200 ${isActive ? 'bg-zinc-900 text-white border-zinc-900' : isDone ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-300 border-zinc-200'}`}>
                  {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-[1px] flex-1 mx-2 transition-colors duration-200 ${isDone ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="text-zinc-900" size={18} />
            <h1 className="font-bold text-zinc-900 text-sm tracking-tight uppercase">BILL SPLITTER</h1>
          </div>
          <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest truncate max-w-[150px]">
            {splitName}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-12 px-6">
        {renderProgress()}

        <div className="bg-white border border-zinc-200 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] min-h-[400px]">
          {step === 'setup' && (
            <div className="max-w-md mx-auto space-y-8 py-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900 mb-1 uppercase tracking-tight">NEW SPLIT</h2>
                <p className="text-sm text-zinc-500">Configure your group expense baseline.</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Split Name</span>
                  <input
                    type="text"
                    value={splitName}
                    onChange={(e) => setSplitName(e.target.value)}
                    placeholder="e.g. TEAM LUNCH"
                    className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 transition-all font-medium text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Currency</span>
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
                    className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 transition-all font-medium text-sm appearance-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={handleNext}
                  className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-4 px-6 rounded-none flex items-center justify-center gap-2 transition-all uppercase tracking-[0.2em] text-xs"
                >
                  NEXT <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'people' && (
            <PeopleStep 
              people={people} 
              setPeople={setPeople} 
              payerId={payerId}
              setPayerId={setPayerId}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 'items' && (
            <ItemsStep 
              people={people} 
              items={items} 
              setItems={setItems} 
              tax={tax}
              setTax={setTax}
              tip={tip}
              setTip={setTip}
              currency={currency.symbol}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 'summary' && (
            <SummaryStep 
              splitName={splitName}
              results={results}
              people={people}
              payerId={payerId}
              items={items}
              currency={currency.symbol}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
