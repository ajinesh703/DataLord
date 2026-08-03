"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Edit, Trash2, Database, Download, Eye, Heart, Coins, Gift, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

interface DatasetRow {
  id: string;
  title: string;
  slug: string;
  fileType: string | null;
  downloadCount: number;
  viewCount: number;
  voteCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Derived stats from real datasets
  const totalDatasets = datasets.length;
  const totalDownloads = datasets.reduce((sum, d) => sum + d.downloadCount, 0);
  const totalViews = datasets.reduce((sum, d) => sum + d.viewCount, 0);
  const totalVotes = datasets.reduce((sum, d) => sum + d.voteCount, 0);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/rewards/me', { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        setCoinBalance(data.coins || 0);
        setCheckInStreak(data.checkInStreak || 0);

        if (data.lastCheckIn) {
          const lastDate = new Date(data.lastCheckIn).toDateString();
          const today = new Date().toDateString();
          setCanCheckIn(lastDate !== today);
        } else {
          setCanCheckIn(true);
        }
      }
    } catch (e) {
      console.error("Error fetching user reward data in dashboard:", e);
    }
  };

  const fetchMyDatasets = async () => {
    try {
      const res = await fetch('/api/datasets/my', { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        setDatasets(data.datasets || []);
      }
    } catch (e) {
      console.error("Error fetching user datasets:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchMyDatasets();
  }, []);

  const handleCheckIn = async () => {
    if (!canCheckIn) return;

    try {
      const res = await fetch('/api/rewards/checkin', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCoinBalance(data.coins);
        setCheckInStreak(data.checkInStreak);
        setCanCheckIn(false);
        setShowCheckInSuccess(true);
        setTimeout(() => setShowCheckInSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to check in from dashboard:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/datasets/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setDatasets(datasets.filter(d => d.id !== id));
        }
      } catch (e) {
        console.error("Error deleting dataset:", e);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link 
              href="/rewards"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-saffron-50 border border-saffron-200 hover:bg-saffron-100 text-saffron-700 font-medium rounded-xl transition-all duration-200"
            >
              <Gift className="w-4 h-4 text-saffron-500" />
              Rewards
            </Link>
            <Link 
              href="/datasets/upload" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-md shadow-saffron-500/20 transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              Upload Dataset
            </Link>
          </div>
        </div>

        {/* Check-in Success Toast */}
        {showCheckInSuccess && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
            <div className="p-2 bg-emerald-100 rounded-full">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Daily Check-in Complete! +10 coins 🪙</p>
              <p className="text-sm text-emerald-700">Day {checkInStreak} streak — Keep it up!</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Coin Balance Card */}
          <div className="bg-gradient-to-br from-saffron-500 to-orange-600 text-white rounded-xl p-6 shadow-lg shadow-saffron-500/15 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-2 right-2 opacity-20 text-6xl">🪙</div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg text-white">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-saffron-100">Coin Balance</p>
                <p className="text-2xl font-bold text-white">{formatNumber(coinBalance)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {canCheckIn ? (
                <button
                  onClick={handleCheckIn}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Daily Check-in (+10)
                </button>
              ) : (
                <div className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white/20 text-white text-center flex items-center justify-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Checked in today ✓
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-saffron-50 rounded-lg text-saffron-600"><Database className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Datasets</p>
                <p className="text-2xl font-bold text-slate-900">{isLoading ? '—' : totalDatasets}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Download className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Downloads</p>
                <p className="text-2xl font-bold text-slate-900">{isLoading ? '—' : formatNumber(totalDownloads)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Eye className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Views</p>
                <p className="text-2xl font-bold text-slate-900">{isLoading ? '—' : formatNumber(totalViews)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg text-red-600"><Heart className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Votes</p>
                <p className="text-2xl font-bold text-slate-900">{isLoading ? '—' : formatNumber(totalVotes)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Datasets Table */}
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900">
          My Datasets
        </h2>
        
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Downloads</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Votes</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Loading your datasets...
                    </td>
                  </tr>
                ) : datasets.length > 0 ? (
                  datasets.map(dataset => (
                    <tr key={dataset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/datasets/${dataset.slug}`} className="font-semibold text-slate-800 hover:text-saffron-600 transition-colors block truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                          {dataset.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-saffron-100 text-saffron-800 border border-saffron-200">
                          {dataset.fileType || 'FILE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{formatNumber(dataset.downloadCount)}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{formatNumber(dataset.viewCount)}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{formatNumber(dataset.voteCount)}</td>
                      <td className="px-6 py-4 text-slate-500">{format(new Date(dataset.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/datasets/${dataset.slug}/edit`} className="p-2 text-slate-500 hover:text-saffron-600 hover:bg-slate-100 rounded-md transition-colors">
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button onClick={() => handleDelete(dataset.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No datasets found. Start by uploading one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
