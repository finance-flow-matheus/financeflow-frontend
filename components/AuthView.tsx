
import React, { useState } from 'react';
import { Layers, Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { User as UserType } from '../types.ts';
import { api } from '../services/api.ts';

interface AuthViewProps {
  onLogin: (user: UserType) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.auth.login({ email: formData.email, password: formData.password });
        localStorage.setItem('ff_token', response.token);
        onLogin(response.user);
      } else {
        const response = await api.auth.register(formData);
        localStorage.setItem('ff_token', response.token);
        onLogin(response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl rotate-6 flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/40">
              <Layers className="w-10 h-10 text-white -rotate-6" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {isLogin ? 'Conectando ao servidor Asset Pro' : 'Sua gestão agora em nuvem segura'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" required disabled={loading}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" required disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" required disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Acessar Sistema' : 'Criar minha Conta'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-slate-400 text-sm font-bold hover:text-white transition-colors"
            >
              {isLogin ? (
                <>Não tem conta no servidor? <span className="text-indigo-400">Cadastre-se</span></>
              ) : (
                <>Já possui acesso? <span className="text-indigo-400">Fazer login</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
