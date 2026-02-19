
import React from 'react';
import { Share2, ArrowLeft, Copy, Check, Info, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { CalculationResult, Person, Item } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface SummaryStepProps {
  splitName: string;
  results: CalculationResult[];
  people: Person[];
  payerId: string;
  items: Item[];
  currency: string;
  onBack: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ 
  splitName, results, people, payerId, items, currency, onBack 
}) => {
  const [copied, setCopied] = React.useState(false);
  const [expandedPerson, setExpandedPerson] = React.useState<string | null>(null);

  const payer = people.find(p => p.id === payerId);
  const totalBill = results.reduce((acc, curr) => acc + curr.total, 0);
  const totalTax = results.reduce((acc, curr) => acc + curr.tax, 0);
  const totalTip = results.reduce((acc, curr) => acc + curr.tip, 0);

  const chartData = results.map(r => ({ name: r.name, value: r.total }));
  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#27272a', '#52525b'];

  const copySummaryText = () => {
    let text = `🧾 BILL SPLIT: ${splitName.toUpperCase()}\n`;
    text += `👤 PAYER: ${payer?.name.toUpperCase()}\n\n`;
    
    results.forEach(res => {
      if (res.personId === payerId) return; // Payer doesn't owe themselves
      
      text += `${res.name.toUpperCase()}\n`;
      text += `Owes ${payer?.name.toUpperCase()}: ${currency}${res.total.toFixed(2)}\n`;
      text += `Items: ${res.assignedItems.map(i => i.name).join(', ') || 'None'}\n`;
      text += `Breakdown: Sub ${currency}${res.subtotal.toFixed(2)} | Tax ${currency}${res.tax.toFixed(2)} | Tip ${currency}${res.tip.toFixed(2)}\n\n`;
    });
    text += `TOTAL BILL: ${currency}${totalBill.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-black text-zinc-900 mb-1 uppercase tracking-tighter">SETTLEMENT REPORT</h2>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Final Split Breakdown</p>
      </div>

      {payer && (
        <div className="bg-zinc-900 text-white p-6 border border-black text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] block mb-2 opacity-60">Settlement Destination</span>
          <h3 className="text-lg font-black uppercase tracking-widest">{payer.name} PAID THE TOTAL</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-wider italic">Everyone listed below owes {payer.name} their share.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 border-b border-zinc-100 pb-2">Individual Balances</div>
          {results.map((res, idx) => {
            const isExpanded = expandedPerson === res.personId;
            const isPayer = res.personId === payerId;
            
            return (
              <div key={res.personId} className={`border ${isPayer ? 'border-zinc-900 opacity-60' : 'border-zinc-200'} bg-white transition-all overflow-hidden`}>
                <button 
                  onClick={() => setExpandedPerson(isExpanded ? null : res.personId)}
                  className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                      {res.name} {isPayer && <span className="text-[9px] bg-zinc-900 text-white px-1.5 py-0.5 ml-1 tracking-widest">PAYER</span>}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      {isPayer ? (
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Settled Up</div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">OWES {payer?.name}</span>
                          <span className="text-lg font-black text-zinc-900 leading-none">{currency}{res.total.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 bg-zinc-50 border-t border-zinc-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="pt-4 space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Itemized Consumption</span>
                        <div className="space-y-1">
                          {res.assignedItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-zinc-600 font-medium">
                              <span>{item.name}</span>
                              <span className="text-zinc-400">{currency}{(item.price / item.assignedTo.length).toFixed(2)}</span>
                            </div>
                          ))}
                          {res.assignedItems.length === 0 && <span className="text-xs text-zinc-400 italic">No items assigned.</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-zinc-200 pt-3">
                        <div className="text-[10px]">
                          <span className="block text-zinc-400 font-bold uppercase tracking-tighter">Subtotal</span>
                          <span className="font-bold text-zinc-700">{currency}{res.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block text-zinc-400 font-bold uppercase tracking-tighter">Tax</span>
                          <span className="font-bold text-zinc-700">{currency}{res.tax.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block text-zinc-400 font-bold uppercase tracking-tighter">Tip</span>
                          <span className="font-bold text-zinc-700">{currency}{res.tip.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="white"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-1">Grand Total</span>
              <span className="text-3xl font-black text-zinc-900">{currency}{totalBill.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-12 w-full space-y-4">
            <div className="bg-zinc-900 p-6 text-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Share2 size={14} /> EXPORT SETTLEMENTS
                </h4>
              </div>
              <p className="text-zinc-400 text-[11px] mb-6 font-medium leading-relaxed tracking-tight">
                Everyone except {payer?.name} will receive a notification of what they owe. Values include proportional tax ({currency}{totalTax.toFixed(2)}) and gratuity ({currency}{totalTip.toFixed(2)}).
              </p>
              <button
                onClick={copySummaryText}
                className="w-full bg-white text-zinc-900 font-black py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check size={14} /> : null}
                {copied ? 'COPIED TO CLIPBOARD' : 'COPY SUMMARY TEXT'}
              </button>
            </div>

            <div className="bg-zinc-50 p-4 border border-zinc-100 flex gap-3 mt-4">
              <Info className="text-zinc-400 shrink-0" size={16} />
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight leading-4">
                Calculations verified. Itemized breakdowns are available by tapping individual cards.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start pt-8 border-t border-zinc-100 mt-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-900 transition-all"
        >
          <ArrowLeft size={14} /> BACK TO EDIT
        </button>
      </div>
    </div>
  );
};

export default SummaryStep;
