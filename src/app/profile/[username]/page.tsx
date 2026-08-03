"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Heart, Database, Coins, Trophy, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';

const mockDatasets = [
  { id: '1', title: 'Global Climate Indicators 2024', slug: 'global-climate-indicators-2024', description: 'Comprehensive dataset of global temperature records, CO2 levels...', tags: ['climate', 'environment'], fileType: 'CSV', fileSize: 15728640, downloadCount: 2341, voteCount: 89, createdAt: '2024-01-15T10:30:00Z' },
  { id: '2', title: 'Ocean Temperature Anomalies', slug: 'ocean-temperature-anomalies', description: 'Monthly sea surface temperature anomalies from 1880 to present...', tags: ['ocean', 'climate'], fileType: 'CSV', fileSize: 8388608, downloadCount: 1567, voteCount: 45, createdAt: '2023-11-20T08:00:00Z' },
  { id: '3', title: 'Wildfire Incidents Database', slug: 'wildfire-incidents-database', description: 'Comprehensive record of wildfire incidents across continents...', tags: ['wildfire', 'environment'], fileType: 'JSON', fileSize: 25165824, downloadCount: 892, voteCount: 34, createdAt: '2024-03-10T12:15:00Z' },
];

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ProfilePage() {
  const params = useParams();
  const usernameParam = params?.username as string || 'me';

  const [userInfo, setUserInfo] = useState({
    name: 'Test User',
    username: 'test_user',
    bio: 'Data scientist & machine learning enthusiast building open datasets for the community.',
    avatarUrl: null as string | null,
    createdAt: '2024-01-01T00:00:00Z',
    coins: 0,
    checkInStreak: 0,
  });

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch('/api/rewards/me');
        if (res.ok) {
          const data = await res.json();
          setUserInfo(prev => ({
            ...prev,
            coins: data.coins || 0,
            checkInStreak: data.checkInStreak || 0,
          }));
        }
      } catch (e) {
        console.error('Failed to load profile data', e);
      }
    }
    loadUserProfile();
  }, []);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      {/* Profile Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-r from-teal-900/40 via-cyan-900/30 to-indigo-900/40 border-b border-white/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="h-32 w-32 rounded-full ring-4 ring-slate-950 bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl flex-shrink-0">
              {userInfo.avatarUrl ? (
                <img src={userInfo.avatarUrl} alt={userInfo.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(userInfo.name)
              )}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-white">{userInfo.name}</h1>
              <p className="text-slate-400 font-medium">@{usernameParam === 'me' ? userInfo.username : usernameParam}</p>
              <p className="mt-4 text-slate-300 max-w-2xl">{userInfo.bio}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                <span>Member since {format(new Date(userInfo.createdAt), 'MMMM yyyy')}</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Coins className="w-4 h-4" /> {userInfo.coins.toLocaleString()} coins
                </span>
              </div>
            </div>
            
            <div className="flex gap-6 mt-6 md:mt-0 bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">3</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Datasets</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent flex items-center justify-center gap-1">
                  <Coins className="w-5 h-5 text-amber-400 inline" />
                  {formatNumber(userInfo.coins)}
                </div>
                <div className="text-xs text-amber-400 uppercase tracking-wider font-semibold mt-1">Coins</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">4.8K</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Datasets Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-teal-400" />
          Datasets by {userInfo.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDatasets.map(dataset => (
            <Link href={`/datasets/${dataset.slug}`} key={dataset.id} className="group flex flex-col bg-slate-900 rounded-xl border border-white/10 overflow-hidden hover:border-teal-500/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300 h-full">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-2">{dataset.title}</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-3">{dataset.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dataset.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{dataset.fileType}</span>
                  <span>{formatBytes(dataset.fileSize)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {formatNumber(dataset.downloadCount)}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {formatNumber(dataset.voteCount)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
