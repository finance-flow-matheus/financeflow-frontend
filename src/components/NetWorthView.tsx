
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Wallet, 
  Landmark, 
  ShieldCheck, 
  ArrowRightLeft,
  CreditCard,
  Home,
  AlertCircle,
  Gem,
  Scale,
  Car,
  HardHat,
  Box,
  RefreshCw
} from 'lucide-react';
import { Account, Liability, Currency, LiabilityCategory, Asset, AssetCategory } from '../types';

export const NetWorthView: React.FC<{ data: any }> = ({ data }) => {
  const { accounts, liabilities, assets, addLiability, deleteLiability, addAsset, deleteAsset } = data;
  
  const [exchangeRate, setExchangeRate] = useState<number>(6.0); // Fallback: 1 EUR = 6 BRL
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [liabilityForm, setLiabilityForm] = useState({
    name: '',
    amount: 0,
    currency: Currency.BRL,
    category: 'other' as LiabilityCategory
  });

  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    value: 0,
    currency: Currency.BRL,
    category: 'other' as AssetCategory
  });

  // Busca cotação real no momento da requisição
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsLoadingRate(true);
        const response = await fetch('https://open.er-api.com/v6/latest/EUR');
        const json = await response.json();
        if (json && json.rates && json.rates.BRL) {
          setExchangeRate(json.rates.BRL);
        }
      } catch (error) {
        console.error("Erro ao buscar cotação:", error);
      } finally {
        setIsLoadingRate(false);
      }
    };
    fetchRate();
  }, []);

  // Cálculos consolidados financeiros (Contas)
  const totalAccBRL = accounts.filter((a: Account) => a.currency === Currency.BRL).reduce((acc: number, curr: Account) => acc + curr.balance, 0);
  const totalAccEUR = accounts.filter((a: Account) => a.currency === Currency.EUR).reduce((acc: number, curr: Account) => acc + curr.balance, 0);
  
  // Cálculos bens físicos
  const totalPhysBRL = assets.filter((as: Asset) => as.currency === Currency.BRL).reduce((acc: number, curr: Asset) => acc + curr.value, 0);
  const totalPhysEUR = assets.filter((as: Asset) => as.currency === Currency.EUR).reduce((acc: number, curr: Asset) => acc + curr.value, 0);

  // Totais Ativos
  const totalAssetsBRL = totalAccBRL + totalPhysBRL;
  const totalAssetsEUR = totalAccEUR + totalPhysEUR;

  // Passivos
  const totalLiabilitiesBRL = liabilities.filter((l: Liability) => l.currency === Currency.BRL).reduce((acc: number, curr: Liability) => acc + curr.amount, 0);
  const totalLiabilitiesEUR = liabilities.filter((l: Liability) => l.currency === Currency.EUR).reduce((acc: number, curr: Liability) => acc + curr.amount, 0);

  // Lógica de Consolidação em Euro e Real
  const consolidatedAssetsEUR = totalAssetsEUR + (totalAssetsBRL / exchangeRate);
  const consolidatedAssetsBRL = totalAssetsBRL + (totalAssetsEUR * exchangeRate);
  
  const consolidatedLiabilitiesEUR = totalLiabilitiesEUR + (totalLiabilitiesBRL / exchangeRate);
  const consolidatedLiabilitiesBRL = totalLiabilitiesBRL + (totalLiabilitiesEUR * exchangeRate);
  
  const consolidatedNetWorthEUR = consolidatedAssetsEUR - consolidatedLiabilitiesEUR;
  const consolidatedNetWorthBRL = consolidatedAssetsBRL - consolidatedLiabilitiesBRL;

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityForm.name || liabilityForm.amount <= 0) return;
    addLiability(liabilityForm);
    setLiabilityForm({ name: '', amount: 0, currency: Currency.BRL, category: 'other' });
    setIsAddingLiability(false);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || assetForm.value <= 0) return;
    addAsset(assetForm);
    setAssetForm({ name: '', value: 0, currency: Currency.BRL, category: 'other' });
    setIsAddingAsset(false);
  };

  const getLiabilityIcon = (cat: LiabilityCategory) => {
    switch (cat) {
      case 'loan': return <ArrowRightLeft className="w-5 h-5" />;
      case 'credit_card': return <CreditCard className="w-5 h-5" />;
      case 'mortgage': return <Home className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAssetIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'property': return <Home className="w-5 h-5" />;
      case 'vehicle': return <Car className="w-5 h-5" />;
      case 'equipment': return <HardHat className="w-5 h-5" />;
      case 'jewelry': return <Gem className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  const SummaryCard = ({ title, brlValue, eurValue, consolidatedEur, consolidatedBrl, icon: Icon, color, isDark = false }: any) => (
    <div className={`${isDark ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'bg-white text-slate-900 border border-slate-100 shadow-sm'} p-8 rounded-[2.5rem] relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 ${color} rounded-full opacity-5 group-hover:scale-110 transition-transform`}></div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${isDark ? 'bg-white/10' : 'bg-slate-50'} rounded-2xl`}>
            <Icon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-slate-600'}`} />
          </div>
          <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{title}</h3>
        </div>
        {isLoadingRate && <RefreshCw className="w-3 h-3 animate-spin text-slate-300" />}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Euro Primeiro agora */}
        <div>
          <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saldo Euro</p>
          <p className="text-xl font-black tracking-tight leading-none">€ {eurValue.toLocaleString('pt-BR')}</p>
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saldo Real</p>
          <p className="text-xl font-black tracking-tight leading-none">R$ {brlValue.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-50'} flex flex-col`}>
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Consolidado</span>
        <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-indigo-300' : 'text-slate-400'}`}>
          € {consolidatedEur.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | R$ {consolidatedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Balanço de Patrimônio</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cotação Atualizada:</p>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black">
              1 EUR = R$ {exchangeRate.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Net Worth Cards com Consolidação Dupla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard 
          title="Ativos Totais"
          brlValue={totalAssetsBRL}
          eurValue={totalAssetsEUR}
          consolidatedEur={consolidatedAssetsEUR}
          consolidatedBrl={consolidatedAssetsBRL}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <SummaryCard 
          title="Passivos Totais"
          brlValue={totalLiabilitiesBRL}
          eurValue={totalLiabilitiesEUR}
          consolidatedEur={consolidatedLiabilitiesEUR}
          consolidatedBrl={consolidatedLiabilitiesBRL}
          icon={TrendingDown}
          color="bg-rose-500"
        />
        <SummaryCard 
          title="Patrimônio Líquido"
          brlValue={totalAssetsBRL - totalLiabilitiesBRL}
          eurValue={totalAssetsEUR - totalLiabilitiesEUR}
          consolidatedEur={consolidatedNetWorthEUR}
          consolidatedBrl={consolidatedNetWorthBRL}
          icon={Gem}
          color="bg-indigo-500"
          isDark={true}
        />
      </div>

      {/* Seção de Bens Físicos e Imobilizados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Bens Físicos & Imobilizados</h3>
          </div>
          <button 
            onClick={() => setIsAddingAsset(true)}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Bem
          </button>
        </div>

        {isAddingAsset && (
          <form onSubmit={handleAddAsset} className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição do Bem</label>
                <input 
                  type="text" required placeholder="Ex: Apartamento em SP, Corolla 2023"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={assetForm.name}
                  onChange={e => setAssetForm({ ...assetForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor de Mercado</label>
                <input 
                  type="number" step="0.01" required placeholder="0,00"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={assetForm.value || ''}
                  onChange={e => setAssetForm({ ...assetForm, value: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria & Moeda</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={assetForm.category}
                    onChange={e => setAssetForm({ ...assetForm, category: e.target.value as AssetCategory })}
                  >
                    <option value="property">Imóvel</option>
                    <option value="vehicle">Veículo</option>
                    <option value="jewelry">Joias/Ouro</option>
                    <option value="equipment">Equipamento</option>
                    <option value="other">Outro</option>
                  </select>
                  <select 
                    className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={assetForm.currency}
                    onChange={e => setAssetForm({ ...assetForm, currency: e.target.value as Currency })}
                  >
                    <option value={Currency.BRL}>BRL</option>
                    <option value={Currency.EUR}>EUR</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20">Salvar Bem</button>
              <button type="button" onClick={() => setIsAddingAsset(false)} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl font-bold">Cancelar</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((as: Asset) => (
            <div key={as.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl transition-colors">
                  {getAssetIcon(as.category)}
                </div>
                <button 
                  onClick={() => deleteAsset(as.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-black text-slate-800 mb-1">{as.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                {as.category === 'property' ? 'Imóvel' : as.category === 'vehicle' ? 'Veículo' : as.category === 'jewelry' ? 'Joia' : 'Outro'}
              </p>
              <p className="text-xl font-black text-slate-900">
                {as.currency === Currency.BRL ? 'R$' : '€'} {as.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
          {assets.length === 0 && !isAddingAsset && (
            <div className="lg:col-span-3 py-10 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
              Nenhum bem físico cadastrado. Imóveis, carros e objetos de valor aumentam seu patrimônio!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-emerald-500" />
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ativos Financeiros (Liquidez)</h3>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conta / Investimento</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Atual</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {accounts.map((acc: Account) => (
                <div key={acc.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${acc.isInvestment ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      {acc.isInvestment ? <ShieldCheck className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{acc.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{acc.isInvestment ? 'Investimento' : 'Liquidez'}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 text-sm">
                    {acc.currency === Currency.BRL ? 'R$' : '€'} {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-rose-500" />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Detalhamento de Passivos</h3>
            </div>
            <button onClick={() => setIsAddingLiability(true)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><Plus className="w-5 h-5" /></button>
          </div>
          {isAddingLiability && (
            <form onSubmit={handleAddLiability} className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm animate-in zoom-in-95">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><input type="text" required placeholder="Nome do Passivo" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={liabilityForm.name} onChange={e => setLiabilityForm({ ...liabilityForm, name: e.target.value })} /></div>
                <div><input type="number" required placeholder="Valor" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={liabilityForm.amount || ''} onChange={e => setLiabilityForm({ ...liabilityForm, amount: parseFloat(e.target.value) })} /></div>
                <div><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={liabilityForm.currency} onChange={e => setLiabilityForm({ ...liabilityForm, currency: e.target.value as Currency })}><option value={Currency.BRL}>BRL</option><option value={Currency.EUR}>EUR</option></select></div>
                <div className="col-span-2"><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={liabilityForm.category} onChange={e => setLiabilityForm({ ...liabilityForm, category: e.target.value as LiabilityCategory })}><option value="other">Outros</option><option value="loan">Empréstimo</option><option value="credit_card">Cartão</option><option value="mortgage">Financiamento</option></select></div>
              </div>
              <div className="mt-4 flex gap-2"><button type="submit" className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold">Adicionar</button><button type="button" onClick={() => setIsAddingLiability(false)} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold">X</button></div>
            </form>
          )}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dívida / Passivo</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor de Quitação</span></div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {liabilities.length > 0 ? liabilities.map((l: Liability) => (
                <div key={l.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 group transition-colors">
                  <div className="flex items-center gap-3"><div className="p-2 bg-rose-50 text-rose-500 rounded-xl">{getLiabilityIcon(l.category)}</div><div><p className="font-bold text-slate-800 text-sm">{l.name}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{l.category}</p></div></div>
                  <div className="flex items-center gap-4"><p className="font-black text-rose-600 text-sm">{l.currency === Currency.BRL ? 'R$' : '€'} {l.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><button onClick={() => deleteLiability(l.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              )) : <div className="p-10 text-center text-slate-300 italic font-medium">Sem passivos registrados.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
