
import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCcw, Info, ArrowLeftRight, Landmark, CreditCard, Banknote } from 'lucide-react';
import { Currency, Account } from '../types';

export const ExchangeView: React.FC<{ data: any }> = ({ data }) => {
  const { accounts, exchangeOperations, registerExchange } = data;
  
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    sourceAmount: 0,
    destinationAccountId: '',
    destinationAmount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const sourceAccount = accounts.find((a: Account) => a.id === formData.sourceAccountId);
  const destinationAccount = accounts.find((a: Account) => a.id === formData.destinationAccountId);

  const isExchange = sourceAccount && destinationAccount && sourceAccount.currency !== destinationAccount.currency;
  const isSameCurrency = sourceAccount && destinationAccount && sourceAccount.currency === destinationAccount.currency;

  // Sincroniza o valor de destino se for a mesma moeda (Transferência)
  useEffect(() => {
    if (isSameCurrency) {
      setFormData(prev => ({ ...prev, destinationAmount: prev.sourceAmount }));
    }
  }, [formData.sourceAmount, isSameCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceAccountId || !formData.destinationAccountId || formData.sourceAmount <= 0 || formData.destinationAmount <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    if (formData.sourceAccountId === formData.destinationAccountId) {
      alert("A conta de origem e destino não podem ser a mesma.");
      return;
    }
    
    // Transformar dados para o formato esperado pelo backend
    const exchangeData = {
      fromAccountId: parseInt(formData.sourceAccountId),
      toAccountId: parseInt(formData.destinationAccountId),
      fromAmount: Number(formData.sourceAmount),
      toAmount: Number(formData.destinationAmount),
      fromCurrency: sourceAccount?.currency || Currency.BRL,
      toCurrency: destinationAccount?.currency || Currency.EUR,
      exchangeRate: Number(formData.destinationAmount) / Number(formData.sourceAmount),
      date: formData.date
    };
    
    registerExchange(exchangeData);
    setFormData({
      sourceAccountId: '',
      sourceAmount: 0,
      destinationAccountId: '',
      destinationAmount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">Transferências & Câmbio</h4>
          <p className="text-sm text-indigo-700/80 leading-relaxed">
            Mova saldo entre suas contas. Se as moedas forem iguais, o valor será replicado. Se forem diferentes (BRL ↔ EUR), você deve informar o valor de saída e o valor de entrada conforme a cotação que utilizou.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          
          {/* Origem */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">1</div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Origem</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">De onde sai o dinheiro</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Selecione a Conta</label>
                <select 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  value={formData.sourceAccountId}
                  onChange={e => setFormData({...formData, sourceAccountId: e.target.value})}
                >
                  <option value="">Escolha uma conta...</option>
                  {accounts.map((a: Account) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency}) - Saldo: {a.currency === Currency.BRL ? 'R$' : '€'} {a.balance.toLocaleString('pt-BR')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor de Saída</label>
                <div className="relative">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">
                    {sourceAccount?.currency === Currency.BRL ? 'R$' : (sourceAccount?.currency === Currency.EUR ? '€' : '$')}
                   </div>
                   <input 
                    type="number" step="0.01" required
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xl text-slate-900"
                    value={formData.sourceAmount || ''}
                    onChange={e => setFormData({...formData, sourceAmount: parseFloat(e.target.value)})}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">2</div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Destino</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onde o dinheiro entra</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Selecione a Conta</label>
                <select 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  value={formData.destinationAccountId}
                  onChange={e => setFormData({...formData, destinationAccountId: e.target.value})}
                >
                  <option value="">Escolha uma conta...</option>
                  {accounts.filter((a: Account) => a.id !== formData.sourceAccountId).map((a: Account) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {isSameCurrency ? 'Valor de Entrada (Automático)' : 'Valor de Entrada (Após Câmbio)'}
                </label>
                <div className="relative">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">
                    {destinationAccount?.currency === Currency.BRL ? 'R$' : (destinationAccount?.currency === Currency.EUR ? '€' : '$')}
                   </div>
                   <input 
                    type="number" step="0.01" required
                    disabled={isSameCurrency || !formData.destinationAccountId}
                    className={`w-full pl-14 pr-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xl text-slate-900 ${isSameCurrency ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 border-slate-200'}`}
                    value={formData.destinationAmount || ''}
                    onChange={e => setFormData({...formData, destinationAmount: parseFloat(e.target.value)})}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data da Operação</label>
                <input 
                  type="date" required
                  className="w-full md:w-64 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
             </div>

             {isExchange && formData.sourceAmount > 0 && formData.destinationAmount > 0 && (
               <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 animate-in zoom-in-95">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Taxa de Conversão Efetiva</p>
                 <p className="text-xl font-black text-indigo-900">
                   1 {sourceAccount?.currency} = { (formData.destinationAmount / formData.sourceAmount).toFixed(4) } {destinationAccount?.currency}
                 </p>
               </div>
             )}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-12 bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-4 group"
        >
          {isExchange ? 'Realizar Câmbio entre Moedas' : 'Confirmar Transferência'}
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* Histórico Melhorado */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Histórico de Movimentações</h3>
          <div className="flex gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <RefreshCcw className="w-3 h-3" /> Câmbio
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ArrowLeftRight className="w-3 h-3" /> Transferência
             </div>
          </div>
        </div>
        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-10 py-5">Data / Tipo</th>
              <th className="px-10 py-5">Saída</th>
              <th className="px-10 py-5 text-center">Fluxo</th>
              <th className="px-10 py-5">Entrada</th>
              <th className="px-10 py-5 text-right">Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exchangeOperations.slice().reverse().map((op: any) => {
              const srcAcc = accounts.find((a: any) => a.id === op.sourceAccountId);
              const dstAcc = accounts.find((a: any) => a.id === op.destinationAccountId);
              const isOpExchange = srcAcc?.currency !== dstAcc?.currency;
              
              const srcSym = srcAcc?.currency === Currency.BRL ? 'R$' : '€';
              const dstSym = dstAcc?.currency === Currency.BRL ? 'R$' : '€';
              
              // Calcular taxa sempre como EUR → BRL (moeda menor → maior)
              const rate = srcAcc?.currency === Currency.EUR 
                ? Number(op.destinationAmount) / Number(op.sourceAmount) // EUR → BRL
                : Number(op.sourceAmount) / Number(op.destinationAmount); // BRL → EUR (inverter)

              return (
                <tr key={op.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-slate-900">{new Date(op.date).toLocaleDateString('pt-BR')}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isOpExchange ? 'text-blue-500' : 'text-slate-400'}`}>
                      {isOpExchange ? 'Câmbio' : 'Transferência'}
                    </p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-rose-600 text-base">{srcSym} {Number(op.sourceAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{srcAcc?.name || 'Conta Removida'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${isOpExchange ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-300'}`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-emerald-600 text-base">{dstSym} {Number(op.destinationAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{dstAcc?.name || 'Conta Removida'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {isOpExchange ? (
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        TX: {rate.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">1:1</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {exchangeOperations.length === 0 && (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic font-medium">Nenhuma movimentação registrada.</td></tr>
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {exchangeOperations.slice().reverse().map((op: any) => {
            const srcAcc = accounts.find((a: any) => a.id === op.sourceAccountId);
            const dstAcc = accounts.find((a: any) => a.id === op.destinationAccountId);
            const isOpExchange = srcAcc?.currency !== dstAcc?.currency;
            
            const srcSym = srcAcc?.currency === Currency.BRL ? 'R$' : '€';
            const dstSym = dstAcc?.currency === Currency.BRL ? 'R$' : '€';
            
            const rate = srcAcc?.currency === Currency.EUR 
              ? Number(op.destinationAmount) / Number(op.sourceAmount)
              : Number(op.sourceAmount) / Number(op.destinationAmount);

            return (
              <div key={op.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{new Date(op.date).toLocaleDateString('pt-BR')}</p>
                    <p className={`text-xs font-bold uppercase ${isOpExchange ? 'text-blue-500' : 'text-slate-400'}`}>
                      {isOpExchange ? '🔄 Câmbio' : '↔️ Transferência'}
                    </p>
                  </div>
                  {isOpExchange && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                      TX: {rate.toFixed(4)}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Saída</p>
                      <p className="text-xs text-slate-400">{srcAcc?.name || 'Conta Removida'}</p>
                    </div>
                    <p className="font-bold text-rose-600">{srcSym} {Number(op.sourceAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isOpExchange ? 'bg-blue-100 text-blue-500' : 'bg-slate-200 text-slate-400'}`}>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Entrada</p>
                      <p className="text-xs text-slate-400">{dstAcc?.name || 'Conta Removida'}</p>
                    </div>
                    <p className="font-bold text-emerald-600">{dstSym} {Number(op.destinationAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {exchangeOperations.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic">Nenhuma movimentação registrada.</div>
          )}
        </div>
      </div>
    </div>
  );
};
