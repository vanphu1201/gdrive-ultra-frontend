'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  ArrowLeft, 
  Save, 
  History,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const ADMIN_EMAIL = 'phu0348880746@gmail.com';

export default function AdminDashboard() {
  const router = useRouter();
  const getApiUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    if (url.endsWith('/')) url = url.slice(0, -1);
    if (!url.endsWith('/api')) url = `${url}/api`;
    return url;
  };
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'transactions'>('users');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else if (session.user.email !== ADMIN_EMAIL) {
        setIsAdmin(false);
        setLoading(false);
      } else {
        setSession(session);
        setIsAdmin(true);
        fetchData(session.access_token);
      }
    });
  }, [router]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const API_URL = getApiUrl();
      
      const [usersRes, txRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          } 
        }),
        fetch(`${API_URL}/admin/transactions`, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          } 
        })
      ]);

      const usersData = await usersRes.json();
      const txData = await txRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (txData.success) setTransactions(txData.transactions);
    } catch (e) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.supabaseId === userId ? data.user : u));
        alert('Cập nhật thành công!');
      }
    } catch (e) {
      alert('Lỗi cập nhật!');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-white font-mono uppercase tracking-widest animate-pulse">
      Verifying Admin Access...
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-center p-8">
      <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="text-2xl font-black text-white uppercase mb-2 tracking-tighter">Access Denied</h1>
      <p className="text-white/40 mb-8 max-w-md">You do not have permission to access the management console.</p>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all uppercase text-xs font-bold tracking-widest border border-white/10">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12 font-sans selection:bg-primary selection:text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80">Management Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              Admin <span className="text-primary">Panel</span>
            </h1>
          </div>
          
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setTab('users')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${tab === 'users' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button 
              onClick={() => setTab('transactions')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${tab === 'transactions' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              <History className="w-4 h-4" /> Billing
            </button>
          </div>
        </div>

        {/* Content */}
        {tab === 'users' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {users.map(user => (
                <div key={user._id} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-white tracking-tight">{user.email}</span>
                        {user.isLifetime && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-full">Lifetime</span>
                        )}
                      </div>
                      <code className="text-[10px] text-white/20 block truncate">{user.supabaseId}</code>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/20 uppercase font-black">Credits</span>
                        <input 
                          type="number" 
                          defaultValue={user.credits}
                          onBlur={(e) => handleUpdateUser(user.supabaseId, { credits: parseInt(e.target.value) })}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-24 focus:border-primary/50 outline-none transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/20 uppercase font-black">Sub Expiry</span>
                        <input 
                          type="date" 
                          defaultValue={user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleUpdateUser(user.supabaseId, { subscriptionExpiry: e.target.value || null })}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:border-primary/50 outline-none transition-all"
                        />
                      </div>

                      <button 
                        onClick={() => handleUpdateUser(user.supabaseId, { isLifetime: !user.isLifetime })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${user.isLifetime ? 'bg-primary border-primary text-black' : 'border-white/10 text-white/40 hover:text-white'}`}
                      >
                        {user.isLifetime ? 'Remove Lifetime' : 'Give Lifetime'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Content</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[10px] font-mono text-white/20">{tx.transactionId}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-primary tracking-tighter">
                          {tx.amount?.toLocaleString()}đ
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-md">{tx.content}</code>
                      </td>
                      <td className="px-6 py-4 text-xs text-white/20">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-12 flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
