
import React, { useState } from 'react';
import { ArrowRight, RefreshCcw, Info, ArrowLeftRight, Landmark } from 'lucide-react';
import { Currency } from '../types';

export const ExchangeView: React.FC<{ data: any }> = ({ data }) => {
  const { accounts, exchangeOperations, registerExchange } = data;
  const [isBrlToEur, setIsBrlToEur] = useState(true);
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    sourceAmount: 0,
    destinationAccountId: '',
    destinationAmount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const brlAccounts = accounts.filter((a: any) => a.currency === Currency.BRL);
  const eurAccounts = accounts.filter((a: any) => a.currency === Currency.EUR);

  const sourceAccounts = isBrlToEur ? brlAccounts : eurAccounts;
  const destinationAccounts = isBrlToEur ? eurAccounts : brlAccounts;

  const sourceCurrency = isBrlToEur ? Currency.BRL : Currency.EUR;
  const destinationCurrency = isBrlToEur ? Currency.EUR : Currency.BRL;

  const toggleDirection = () => {
    setIsBrlToEur(!isBrlToEur);
    setFormData({
      ...formData,
      sourceAccountId: '',
      destinationAccountId: '',
      sourceAmount: 0,
      destinationAmount: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceAccountId || !formData.destinationAccountId || formData.sourceAmount <= 0 || formData.destinationAmount <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    registerExchange(formData);
    setFormData({
      sourceAccountId: '',
      sourceAmount: 0,
      destinationAccountId: '',
      destinationAmount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">Câmbio Inteligente</h4>
          <p className="text-sm text-indigo-700/80 leading-relaxed">
            Registre operações de câmbio manual entre suas contas. Os saldos serão atualizados automaticamente com base nos valores informados, sem conversões automáticas.
          </p>
        </div>
      </div>

      <div className="flex justify-center -mb-4 relative z-20">
        <button 
          onClick={toggleDirection}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group border-4 border-slate-50"
        >
          <ArrowLeftRight className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold text-sm px-2">Inverter Sentido</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 pt-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-slate-100 opacity-20">
          <RefreshCcw className="w-32 h-32 rotate-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          {/* Source */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">1</div>
              Origem ({sourceCurrency})
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Conta de Saída</label>
                <select 
                  required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none cursor-pointer"
                  value={formData.sourceAccountId}
                  onChange={e => setFormData({...formData, sourceAccountId: e.target.value})}
                >
                  <option value="">Selecione a conta {sourceCurrency}</option>
                  {sourceAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({sourceCurrency})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor Retirado ({sourceCurrency === 'BRL' ? 'R$' : '€'})</label>
                <div className="relative">
                   <input 
                    type="number" step="0.01" required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold text-lg"
                    value={formData.sourceAmount || ''}
                    onChange={e => setFormData({...formData, sourceAmount: parseFloat(e.target.value)})}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">2</div>
              Destino ({destinationCurrency})
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Conta de Entrada</label>
                <select 
                  required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                  value={formData.destinationAccountId}
                  onChange={e => setFormData({...formData, destinationAccountId: e.target.value})}
                >
                  <option value="">Selecione a conta {destinationCurrency}</option>
                  {destinationAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({destinationCurrency})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor Recebido ({destinationCurrency === 'BRL' ? 'R$' : '€'})</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-lg"
                  value={formData.destinationAmount || ''}
                  onChange={e => setFormData({...formData, destinationAmount: parseFloat(e.target.value)})}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data da Operação</label>
             <input 
               type="date" required
               className="w-full md:w-1/2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
               value={formData.date}
               onChange={e => setFormData({...formData, date: e.target.value})}
             />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-10 bg-slate-900 text-white py-5 rounded-3xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 group"
        >
          Confirmar Operação de Câmbio
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* History */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Histórico de Movimentações</h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sentido / Valor / Taxa</div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-10 py-5">Data</th>
              <th className="px-10 py-5">Saída</th>
              <th className="px-10 py-5 text-center"></th>
              <th className="px-10 py-5">Entrada</th>
              <th className="px-10 py-5 text-right">Taxa Efetiva</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exchangeOperations.slice().reverse().map((op: any) => {
              const srcAcc = accounts.find((a: any) => a.id === op.sourceAccountId);
              const dstAcc = accounts.find((a: any) => a.id === op.destinationAccountId);
              const srcSym = srcAcc?.currency === Currency.BRL ? 'R$' : '€';
              const dstSym = dstAcc?.currency === Currency.BRL ? 'R$' : '€';
              
              // Effective rate calculation based on which way it's going
              const rate = op.sourceAmount / op.destinationAmount;
              const rateText = srcAcc?.currency === Currency.BRL 
                ? `1€ = R$ ${rate.toFixed(4)}` 
                : `1€ = R$ ${(1/rate).toFixed(4)}`;

              return (
                <tr key={op.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6 text-sm font-medium text-slate-500">{new Date(op.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-rose-600">{srcSym} {op.sourceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{srcAcc?.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <ArrowRight className="w-4 h-4 text-slate-300 mx-auto" />
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-600">{dstSym} {op.destinationAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{dstAcc?.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      {rateText}
                    </span>
                  </td>
                </tr>
              );
            })}
            {exchangeOperations.length === 0 && (
              <tr><td colSpan={5} className="px-10 py-12 text-center text-slate-400 italic">Nenhuma operação de câmbio registrada ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
