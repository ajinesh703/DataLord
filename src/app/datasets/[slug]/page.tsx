"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Download, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  FileText, 
  Calendar, 
  Database, 
  Tag as TagIcon,
  FileBox,
  Scale,
  MoreVertical,
  Check
} from "lucide-react";

// Mock Data
const mockDataset = {
  id: '1',
  title: 'Global Climate Indicators 2024',
  slug: 'global-climate-indicators-2024',
  description: 'This comprehensive dataset contains global temperature records, CO2 levels, sea level measurements, and other key climate indicators from 1950 to 2024. The data is sourced from NASA, NOAA, and the World Meteorological Organization.\n\nThe dataset includes:\n- Monthly average temperatures by region\n- Atmospheric CO2 concentration (ppm)\n- Sea level rise measurements (mm)\n- Arctic sea ice extent (million km²)\n- Annual precipitation anomalies\n\nPerfect for climate change research, time series analysis, and environmental modeling.',
  category: 'Climate & Environment',
  tags: ['climate', 'environment', 'temperature', 'CO2', 'time-series'],
  license: 'CC-BY-4.0',
  fileType: 'CSV',
  fileSize: 15728640, // bytes
  downloadCount: 2341,
  viewCount: 8923,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-06-20T14:22:00Z',
  owner: { name: 'Climate Research Lab', username: 'climate_lab', avatarUrl: null },
  voteCount: 89,
  hasVoted: false,
};

const mockPreviewData = {
  headers: ['Year', 'Month', 'Avg_Temp_C', 'CO2_ppm', 'Sea_Level_mm', 'Ice_Extent_M_km2'],
  rows: [
    ['2020', 'January', '13.4', '413.4', '3.1', '13.06'],
    ['2020', 'February', '13.5', '414.1', '3.2', '14.28'],
    ['2020', 'March', '13.1', '414.5', '3.3', '14.52'],
    ['2020', 'April', '13.3', '416.2', '3.4', '13.73'],
    ['2020', 'May', '13.1', '417.1', '3.5', '12.68'],
    ['2020', 'June', '13.5', '416.4', '3.6', '10.58'],
    ['2020', 'July', '13.7', '414.4', '3.6', '7.28'],
    ['2020', 'August', '13.6', '412.5', '3.7', '5.26'],
    ['2020', 'September', '13.4', '411.3', '3.8', '3.92'],
    ['2020', 'October', '13.0', '411.5', '3.8', '5.28'],
  ],
  totalRows: 8400,
};

const mockComments = [
  { id: '1', content: 'Great dataset! Used it for my climate modeling project.', user: { name: 'Alex Chen', username: 'alexc' }, createdAt: '2024-06-15T08:30:00Z' },
  { id: '2', content: 'Would love to see data from 2024 Q3 and Q4 added.', user: { name: 'Sarah Kim', username: 'sarahk' }, createdAt: '2024-06-18T14:22:00Z' },
  { id: '3', content: 'The CO2 measurements align well with NOAA records. Verified!', user: { name: 'Dr. James', username: 'drjames' }, createdAt: '2024-06-20T09:15:00Z' },
];

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function DatasetDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'comments'>('overview');
  const [hasVoted, setHasVoted] = useState(mockDataset.hasVoted);
  const [voteCount, setVoteCount] = useState(mockDataset.voteCount);
  const [newComment, setNewComment] = useState("");

  const handleVote = () => {
    setHasVoted(!hasVoted);
    setVoteCount(prev => hasVoted ? prev - 1 : prev + 1);
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Main Content */}
          <div className="w-full lg:w-[70%] space-y-8">
            
            {/* Header Section */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {mockDataset.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(mockDataset.owner.name)}
                  </div>
                  <Link href={`/users/${mockDataset.owner.username}`} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">
                    {mockDataset.owner.name}
                  </Link>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Updated {formatDistanceToNow(new Date(mockDataset.updatedAt))} ago
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {mockDataset.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded-full text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.05)] hover:border-cyan-500/50 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-800">
              <nav className="flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'preview', label: 'Data Preview', icon: Database },
                  { id: 'comments', label: `Comments (${mockComments.length})`, icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      relative py-4 px-1 flex items-center gap-2 text-sm font-medium transition-colors duration-200
                      ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(34,211,238,0.5)]"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                    {mockDataset.description.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed whitespace-pre-wrap">{paragraph}</p>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold text-white mt-10 mb-4 border-b border-slate-800 pb-2">Metadata</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <Scale className="w-5 h-5 text-cyan-400 mb-2" />
                      <div className="text-xs text-slate-500 mb-1">License</div>
                      <div className="font-medium text-slate-200">{mockDataset.license}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <TagIcon className="w-5 h-5 text-blue-400 mb-2" />
                      <div className="text-xs text-slate-500 mb-1">Category</div>
                      <div className="font-medium text-slate-200">{mockDataset.category}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <FileBox className="w-5 h-5 text-indigo-400 mb-2" />
                      <div className="text-xs text-slate-500 mb-1">File Type</div>
                      <div className="font-medium text-slate-200">{mockDataset.fileType}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <Database className="w-5 h-5 text-purple-400 mb-2" />
                      <div className="text-xs text-slate-500 mb-1">Size</div>
                      <div className="font-medium text-slate-200">{formatBytes(mockDataset.fileSize)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* DATA PREVIEW TAB */}
              {activeTab === 'preview' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      Showing 10 of {mockPreviewData.totalRows.toLocaleString()} rows
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-white/[0.02] shadow-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700">
                          {mockPreviewData.headers.map((header, i) => (
                            <th key={i} className="px-4 py-3 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-mono text-sm">
                        {mockPreviewData.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            {row.map((cell, j) => (
                              <td key={j} className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* COMMENTS TAB */}
              {activeTab === 'comments' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..." 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none min-h-[100px]"
                    />
                    <div className="flex justify-end mt-3">
                      <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
                        Post Comment
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockComments.map(comment => (
                      <div key={comment.id} className="flex gap-4 p-4 rounded-xl border border-slate-800/50 bg-slate-900/30">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold border border-slate-700">
                          {getInitials(comment.user.name)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-200">{comment.user.name}</span>
                              <span className="text-xs text-slate-500">@{comment.user.username}</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[30%] space-y-6">
            
            {/* Download Card */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <button className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-[0.98]">
                <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                Download Dataset
              </button>
              
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-2"><FileBox className="w-4 h-4"/> Format</span>
                  <span className="font-medium text-slate-200">{mockDataset.fileType}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-2"><Database className="w-4 h-4"/> Size</span>
                  <span className="font-medium text-slate-200">{formatBytes(mockDataset.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-2"><Scale className="w-4 h-4"/> License</span>
                  <span className="font-medium text-slate-200">{mockDataset.license}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <Eye className="w-5 h-5 text-slate-400 mb-1" />
                <div className="text-lg font-semibold text-slate-200">{mockDataset.viewCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Views</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <Download className="w-5 h-5 text-slate-400 mb-1" />
                <div className="text-lg font-semibold text-slate-200">{mockDataset.downloadCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Downloads</div>
              </div>
              <button 
                onClick={handleVote}
                className={`bg-slate-900/50 border rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all ${
                  hasVoted ? 'border-pink-500/50 bg-pink-500/5' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <Heart className={`w-5 h-5 mb-1 transition-colors ${hasVoted ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`} />
                <div className={`text-lg font-semibold ${hasVoted ? 'text-pink-400' : 'text-slate-200'}`}>{voteCount}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Votes</div>
              </button>
            </div>

            {/* Share / Actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="w-11 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Owner Card */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-900/50 transition-colors">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Dataset Provider</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 text-lg font-bold border-2 border-slate-700">
                  {getInitials(mockDataset.owner.name)}
                </div>
                <div>
                  <Link href={`/users/${mockDataset.owner.username}`} className="font-medium text-slate-200 hover:text-cyan-400 transition-colors block">
                    {mockDataset.owner.name}
                  </Link>
                  <span className="text-sm text-slate-500">@{mockDataset.owner.username}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
