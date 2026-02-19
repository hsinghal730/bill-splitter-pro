
import React, { useState, useEffect } from 'react';
import { Trash2, ArrowLeft, ArrowRight, UserPlus, CreditCard } from 'lucide-react';
import { Person } from '../types';

interface PeopleStepProps {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  payerId: string;
  setPayerId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PeopleStep: React.FC<PeopleStepProps> = ({ 
  people, setPeople, payerId, setPayerId, onNext, onBack 
}) => {
  const [newName, setNewName] = useState('');

  // Default payer to first person added if not set
  useEffect(() => {
    if (people.length > 0 && !payerId) {
      setPayerId(people[0].id);
    }
  }, [people, payerId, setPayerId]);

  const addPerson = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newName.trim()) {
      const newId = Math.random().toString(36).substr(2, 9);
      setPeople([...people, { id: newId, name: newName.trim() }]);
      setNewName('');
    }
  };

  const removePerson = (id: string) => {
    const updatedPeople = people.filter(p => p.id !== id);
    setPeople(updatedPeople);
    if (payerId === id) {
      setPayerId(updatedPeople.length > 0 ? updatedPeople[0].id : '');
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-1 uppercase tracking-tight">ADD PARTICIPANTS</h2>
        <p className="text-sm text-zinc-500">List everyone splitting the bill.</p>
      </div>

      <form onSubmit={addPerson} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. John Doe"
          className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-zinc-900 transition-all text-sm font-medium"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="bg-zinc-900 hover:bg-black disabled:opacity-20 text-white p-3 rounded-none transition-all flex items-center justify-center w-12"
        >
          <UserPlus size={18} />
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8">
        {people.map((person) => (
          <div key={person.id} className="group flex items-center justify-between p-3 border border-zinc-100 hover:border-zinc-900 transition-all">
            <span className="text-sm font-bold text-zinc-800 uppercase tracking-tight">{person.name}</span>
            <button
              onClick={() => removePerson(person.id)}
              className="text-zinc-300 hover:text-zinc-900 p-1 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {people.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-300 border border-dashed border-zinc-200 text-xs font-bold uppercase tracking-widest">
            NO USERS ADDED
          </div>
        )}
      </div>

      {people.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-zinc-100">
          <div className="text-center">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] mb-1">WHO PAID THE BILL?</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Everyone else will owe this person.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => setPayerId(person.id)}
                className={`flex items-center gap-2 px-4 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                  payerId === person.id
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                    : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <CreditCard size={12} className={payerId === person.id ? 'text-white' : 'text-zinc-200'} />
                {person.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-8 border-t border-zinc-100 mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-900 transition-all"
        >
          <ArrowLeft size={14} /> BACK
        </button>
        <button
          onClick={onNext}
          disabled={people.length === 0 || !payerId}
          className="bg-zinc-900 hover:bg-black disabled:opacity-20 text-white font-bold py-3 px-8 rounded-none flex items-center gap-2 transition-all text-xs tracking-widest uppercase"
        >
          CONTINUE <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PeopleStep;
