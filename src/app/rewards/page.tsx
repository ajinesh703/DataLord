"use client";

import React, { useState, useEffect } from 'react';
import { 
  Coins, Gift, Calendar, Upload, Trophy, Star, CheckCircle, Clock, 
  ArrowUpRight, ArrowDownRight, Sparkles, Lock, ShoppingBag, Award, Crown 
} from 'lucide-react';

// Types
type Transaction = {
  id: string;
  type: 'CHECKIN' | 'UPLOAD' | 'REDEMPTION' | 'BONUS';
  amount: number;
  description: string;
  createdAt: string;
};

type Redemption = {
  id: string;
  rewardId: string;
  rewardName: string;
  coinsSpent: number;
  status: 'completed' | 'pending' | 'processing';
  createdAt: string;
};

const REWARDS = [
  { id: 'tshirt', name: 'DataLord T-Shirt', cost: 10000, emoji: '🎽', description: 'Exclusive premium cotton t-shirt.' },
  { id: 'cap', name: 'DataLord Cap', cost: 5000, emoji: '🧢', description: 'Stylish baseball cap with embroidered logo.' },
  { id: 'backpack', name: 'DataLord Backpack', cost: 15000, emoji: '🎒', description: 'High-quality tech backpack for your gear.' },
  { id: 'badge', name: 'Verified Badge', cost: 2000, emoji: '🏅', description: 'Stand out with a verified profile badge.' },
  { id: 'featured', name: 'Featured Dataset Slot', cost: 8000, emoji: '⭐', description: 'Boost your dataset visibility for 7 days.' },
  { id: 'certificate', name: 'Premium Certificate', cost: 3000, emoji: '📜', description: 'Official DataLord top contributor certificate.' },
];

export default function RewardsPage() {
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/rewards/me');
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins || 0);
        setStreak(data.checkInStreak || 0);
        setLastCheckIn(data.lastCheckIn);
        setTransactions(data.transactions || []);
        setRedemptions(data.redemptions || []);
      }
    } catch (e) {
      console.error("Failed to fetch user reward data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const isCheckedInToday = () => {
    if (!lastCheckIn) return false;
    const last = new Date(lastCheckIn);
    const now = new Date();
    return last.toDateString() === now.toDateString();
  };

  const handleCheckIn = async () => {
    if (isCheckedInToday()) return;

    try {
      const res = await fetch('/api/rewards/checkin', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
        setStreak(data.checkInStreak);
        setLastCheckIn(data.lastCheckIn);
        if (data.transaction) {
          setTransactions(prev => [data.transaction, ...prev]);
        }
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (e) {
      console.error("Failed to check in", e);
    }
  };

  const handleRedeem = async (reward: typeof REWARDS[0]) => {
    if (coins < reward.cost) return;

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: reward.id,
          rewardName: reward.name,
          coinsSpent: reward.cost,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
        if (data.transaction) {
          setTransactions(prev => [data.transaction, ...prev]);
        }
        if (data.redemption) {
          setRedemptions(prev => [data.redemption, ...prev]);
        }
      }
    } catch (e) {
      console.error("Failed to redeem reward", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading rewards...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header / Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-white/10 p-10 md:p-16 flex flex-col items-center text-center shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />
          
          <Crown className="w-16 h-16 text-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            DataLord <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Rewards</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mb-10">
            Contribute to the community, earn coins, and redeem them for exclusive premium gear and platform perks.
          </p>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-slate-950 border border-amber-500/30 rounded-2xl px-10 py-6 flex items-center space-x-6">
              <Coins className="w-12 h-12 text-amber-400 animate-pulse" />
              <div className="text-left">
                <p className="text-sm font-medium text-amber-500/80 uppercase tracking-widest mb-1">Your Balance</p>
                <div className="text-5xl font-black text-white tracking-tighter tabular-nums">
                  {coins.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Daily Check-in */}
          <section className="lg:col-span-1 bg-slate-900 rounded-3xl border border-white/10 p-8 flex flex-col relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent animate-ping duration-1000" />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-cyan-400" /> Daily Check-in
              </h2>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-white/5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">{streak} Day Streak</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {isCheckedInToday() ? (
                <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Checked in!</h3>
                    <p className="text-slate-400 mt-2">Come back tomorrow for more.</p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleCheckIn}
                  className="relative group w-full py-4 px-8 rounded-xl font-bold text-lg text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-all blur-md" />
                  <span className="relative flex items-center justify-center gap-2">
                    Claim Daily Reward <ArrowUpRight className="w-5 h-5" />
                  </span>
                </button>
              )}
            </div>
            {!isCheckedInToday() && (
              <p className="text-center text-sm text-slate-500 mt-6">
                Earn 10 coins. Build a streak for bonuses!
              </p>
            )}
          </section>

          {/* How to Earn */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> How to Earn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-xl transition-all hover:border-cyan-500/30">
                <div className="bg-cyan-500/20 p-3 rounded-xl">
                  <Upload className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Upload Dataset</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-3">Contribute high-quality data to the platform.</p>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Coins className="w-4 h-4" /> +100 Coins
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-xl transition-all hover:border-amber-500/30">
                <div className="bg-amber-500/20 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Daily Check-in</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-3">Visit the platform every day to claim.</p>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Coins className="w-4 h-4" /> +10 Coins
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-start gap-4 opacity-50 grayscale select-none">
                <div className="bg-slate-800 p-3 rounded-xl">
                  <Star className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    Review Dataset <Lock className="w-4 h-4" />
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 mb-3">Help maintain data quality.</p>
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                    Coming Soon
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-start gap-4 opacity-50 grayscale select-none">
                <div className="bg-slate-800 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    Win Bounties <Lock className="w-4 h-4" />
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 mb-3">Solve data requests for huge rewards.</p>
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Rewards Catalog */}
        <section className="space-y-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-cyan-400" /> Rewards Catalog
              </h2>
              <p className="text-slate-400 mt-2">Redeem your hard-earned coins for exclusive items.</p>
            </div>
            <div className="text-sm font-medium bg-slate-900 border border-white/10 px-4 py-2 rounded-lg text-amber-400 flex items-center gap-2 shadow-inner">
              <Coins className="w-4 h-4" /> Available: {coins.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REWARDS.map(reward => {
              const canAfford = coins >= reward.cost;
              const progress = Math.min(100, (coins / reward.cost) * 100);
              
              return (
                <div key={reward.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                  <div className="text-5xl mb-4 p-4 bg-slate-950 rounded-2xl w-max border border-white/5 shadow-inner">
                    {reward.emoji}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                  <p className="text-sm text-slate-400 mb-6 flex-1">{reward.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-sm">
                      <span className="text-slate-500 font-medium">Cost</span>
                      <span className="font-bold text-amber-400 text-lg flex items-center gap-1.5">
                        {reward.cost.toLocaleString()} <Coins className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${canAfford ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-cyan-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                        ${canAfford 
                          ? 'bg-white text-slate-950 hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        }
                      `}
                      title={!canAfford ? `Need ${(reward.cost - coins).toLocaleString()} more coins` : ''}
                    >
                      {canAfford ? 'Redeem Now' : 'Not Enough Coins'}
                      {canAfford && <Gift className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* History Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          
          {/* Transactions */}
          <section className="bg-slate-900 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-400" /> Coin History
            </h2>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No transactions yet.</div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="bg-slate-950 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        tx.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{tx.description}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <div className={`font-bold tabular-nums ${tx.amount > 0 ? 'text-green-400' : 'text-slate-300'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Redemptions */}
          <section className="bg-slate-900 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Gift className="w-5 h-5 text-slate-400" /> My Redemptions
            </h2>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
              {redemptions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No rewards redeemed yet.</div>
              ) : (
                redemptions.map(red => (
                  <div key={red.id} className="bg-slate-950 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
                    <div>
                      <p className="font-bold text-slate-200">{red.rewardName}</p>
                      <p className="text-xs text-slate-500">{new Date(red.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-amber-500/70 font-medium">-{red.coinsSpent}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        red.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        red.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {red.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
