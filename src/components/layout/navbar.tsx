"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database, Search, Upload, User, Menu, X, LogOut, LayoutDashboard, Gift, Coins } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchCoins = async () => {
      try {
        const res = await fetch('/api/rewards/me', { cache: 'no-store' }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          if (isMounted && data.coins !== undefined) {
            setCoinBalance(data.coins || 0);
          }
        }
      } catch {
        // Silently ignore network failures in background polling
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const formatCoins = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-saffron-400 to-saffron-600 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(255,132,0,0.4)] transition-all">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-saffron-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                DataLord
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/datasets" className="text-sm font-medium text-slate-600 hover:text-saffron-600 transition-colors">
              Browse Datasets
            </Link>
            <Link href="/rewards" className="text-sm font-medium text-slate-600 hover:text-saffron-600 transition-colors flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-saffron-500" />
              Rewards
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/datasets" className="p-2 text-slate-500 hover:text-saffron-600 hover:bg-saffron-50 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            
            {user ? (
              <>
                <Link href="/datasets/upload" className="hidden lg:flex items-center gap-2 text-sm font-medium text-saffron-600 hover:text-saffron-700 px-3 py-2 rounded-md hover:bg-saffron-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>

                {/* Coin Balance Badge */}
                <Link
                  href="/rewards"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-saffron-50 border border-saffron-200 hover:bg-saffron-100 transition-all group"
                >
                  <Coins className="w-4 h-4 text-saffron-500 group-hover:rotate-12 transition-transform" />
                  <span className="text-sm font-semibold text-saffron-700">{formatCoins(coinBalance)}</span>
                </Link>
                
                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                    className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-slate-200 hover:border-saffron-300 hover:bg-slate-50 transition-all focus:outline-none bg-white"
                  >
                    <span className="text-sm font-medium text-slate-700 hidden xl:block max-w-[100px] truncate">
                      {user.user_metadata?.name || 'User'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 overflow-hidden transform origin-top-right transition-all">
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-saffron-600">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/rewards" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-saffron-600">
                        <Gift className="w-4 h-4 text-saffron-500" /> Rewards
                        <span className="ml-auto text-xs font-semibold text-saffron-600">{formatCoins(coinBalance)}</span>
                      </Link>
                      <Link href="/profile/me" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-saffron-600">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-saffron-600 px-3 py-2 transition-colors">
                  Log in
                </Link>
                <Link href="/auth/signup" className="text-sm font-medium bg-saffron-500 text-white hover:bg-saffron-600 px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <Link
                href="/rewards"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-saffron-50 border border-saffron-200"
              >
                <Coins className="w-3.5 h-3.5 text-saffron-500" />
                <span className="text-xs font-semibold text-saffron-700">{formatCoins(coinBalance)}</span>
              </Link>
            )}
            <Link href="/datasets" className="text-slate-500 hover:text-saffron-600">
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-saffron-600 p-1"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-md">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link href="/datasets" className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-saffron-600 hover:bg-slate-50">
              Browse Datasets
            </Link>
            <Link href="/rewards" className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-saffron-600 hover:bg-slate-50">
              <Gift className="w-5 h-5 text-saffron-500" />
              Rewards
            </Link>
            
            {user ? (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center px-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-900">{user.user_metadata?.name || 'User'}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Coins className="w-3.5 h-3.5 text-saffron-500" />
                      <span className="text-sm font-semibold text-saffron-600">{formatCoins(coinBalance)} coins</span>
                    </div>
                  </div>
                </div>
                <Link href="/datasets/upload" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-saffron-600 hover:bg-slate-50">
                  <Upload className="w-5 h-5" /> Upload Dataset
                </Link>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-saffron-600 hover:bg-slate-50">
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
                <Link href="/profile/me" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-saffron-600 hover:bg-slate-50">
                  <User className="w-5 h-5" /> Profile
                </Link>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 text-left">
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4 px-3">
                <Link href="/auth/login" className="flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">
                  Log in
                </Link>
                <Link href="/auth/signup" className="flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-saffron-500 text-white hover:bg-saffron-600 shadow-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
