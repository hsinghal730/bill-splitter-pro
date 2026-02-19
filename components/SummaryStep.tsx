
import React from 'react';
import { Share2, ArrowLeft, Copy, Check, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
  
  const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f97316'  // Orange
  ];

  const copySummaryText = () => {
    let text = `🧾 BILL SPLIT: ${splitName.toUpperCase()}\n`;
    text += `👤 PAYER: ${payer?.name.toUpperCase()}\n\n`;
    
    results.forEach(res => {
      if (res.personId === payerId) return; 
      
      const roundedTotal = Math.round(res.total);
      text += `${res.name.toUpperCase()}\n`;
      text += `Owes ${payer?.name.toUpperCase()}: ${currency}${roundedTotal}\n`;
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
        <h2 className="text-3xl font-black text-zinc-900 mb-1 uppercase tracking-tighter">SETTLEMENT REPORT</h2>
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Final Split Breakdown</p>
      </div>

      {payer && (
        <div className="bg-zinc-900 text-white p-8 border border-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] block mb-2 opacity-50">Settlement Destination</span>
          <h3 className="text-2xl font-black uppercase tracking-widest">{payer.name} PAID THE TOTAL</h3>
          <p className="text-[11px] font-bold text-zinc-400 uppercase mt-2 tracking-[0.15em] italic">Everyone listed below owes {payer.name} their share.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-16 items-start">
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 border-b border-zinc-100 pb-3">Individual Balances</div>
          {results.map((res, idx) => {
            const isExpanded = expandedPerson === res.personId;
            const isPayer = res.personId === payerId;
            const displayTotal = Math.round(res.total);
            
            return (
              <div key={res.personId} className={`border ${isPayer ? 'border-zinc-200 opacity-60' : 'border-zinc-200'} bg-white transition-all overflow-hidden`}>
                <button 
                  onClick={() => setExpandedPerson(isExpanded ? null : res.personId)}
                  className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                      {res.name} {isPayer && <span className="text-[9px] bg-zinc-400 text-white px-1.5 py-0.5 ml-2 tracking-widest font-black">PAYER</span>}
                    </h3>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      {isPayer ? (
                        <div className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">Settled Up</div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">OWES {payer?.name}</span>
                          <span className="text-2xl font-black text-zinc-900 leading-none tracking-tight">{currency}{displayTotal}</span>
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-zinc-300" /> : <ChevronDown size={18} className="text-zinc-300" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6 bg-zinc-50 border-t border-zinc-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="pt-5 space-y-4">
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-3">Itemized Consumption</span>
                        <div className="space-y-2">
                          {res.assignedItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-zinc-800 font-bold uppercase tracking-tight">
                              <span>{item.name}</span>
                              <span className="text-zinc-500 font-medium tracking-normal">{currency}{(item.price / item.assignedTo.length).toFixed(2)}</span>
                            </div>
                          ))}
                          {res.assignedItems.length === 0 && <span className="text-xs text-zinc-400 italic">No items assigned.</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-t border-zinc-200 pt-4">
                        <div className="text-[10px]">
                          <span className="block text-zinc-400 font-black uppercase tracking-widest mb-1">Subtotal</span>
                          <span className="font-black text-zinc-900">{currency}{res.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block text-zinc-400 font-black uppercase tracking-widest mb-1">Tax</span>
                          <span className="font-black text-zinc-900">{currency}{res.tax.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="block text-zinc-400 font-black uppercase tracking-widest mb-1">Tip</span>
                          <span className="font-black text-zinc-900">{currency}{res.tip.toFixed(2)}</span>
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
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="white"
                  strokeWidth={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Grand Total</span>
              <span className="text-4xl font-black text-zinc-900 tracking-tighter">{currency}{totalBill.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-12 w-full max-w-md">
            <div className="bg-zinc-900 p-8 text-white border border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)]">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-[11px] font-black flex items-center gap-3 uppercase tracking-[0.3em]">
                  <Share2 size={14} /> Export Settlements
                </h4>
              </div>
              <p className="text-zinc-400 text-[11px] mb-8 font-bold leading-relaxed tracking-tight uppercase opacity-80">
                Everyone except {payer?.name} will receive a notification of what they owe. Values include proportional tax ({currency}{totalTax.toFixed(2)}) and gratuity ({currency}{totalTip.toFixed(2)}).
              </p>
              <button
                onClick={copySummaryText}
                className="w-full bg-white text-zinc-900 font-black py-5 text-xs uppercase tracking-[0.3em] hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
              >
                {copied ? <Check size={14} /> : null}
                {copied ? 'Copied' : 'Copy Summary Text'}
              </button>
            </div>

            <div className="bg-white p-5 border border-zinc-100 flex gap-4 mt-8 items-center shadow-sm">
              <Info className="text-zinc-300 shrink-0" size={18} />
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-4">
                Calculations Verified. Itemized breakdowns are available by tapping individual cards.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start pt-12 border-t border-zinc-100 mt-16">
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-zinc-400 font-black text-[11px] uppercase tracking-[0.3em] hover:text-zinc-900 transition-all"
        >
          <ArrowLeft size={16} /> Back to Edit
        </button>
      </div>
    </div>
  );
};

export default SummaryStep;
