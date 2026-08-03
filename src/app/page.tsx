import Link from 'next/link';
import prisma from '@/lib/prisma';

const categoryDefs = [
  { title: 'Machine Learning', icon: '🤖', slug: 'ml' },
  { title: 'NLP', icon: '💬', slug: 'nlp' },
  { title: 'Computer Vision', icon: '👁️', slug: 'cv' },
  { title: 'Finance & Economics', icon: '📈', slug: 'finance' },
  { title: 'Healthcare', icon: '🏥', slug: 'healthcare' },
  { title: 'Climate & Environment', icon: '🌍', slug: 'climate' },
  { title: 'Sports', icon: '⚽', slug: 'sports' },
  { title: 'Social Science', icon: '👥', slug: 'social-science' },
];

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default async function HomePage() {
  // Fetch all real data from the database
  const [
    totalDatasets,
    totalUsers,
    totalDownloads,
    trendingDatasets,
    recentDatasets,
    categoryCounts,
  ] = await Promise.all([
    prisma.dataset.count(),
    prisma.user.count(),
    prisma.download.count(),
    prisma.dataset.findMany({
      orderBy: { downloadCount: 'desc' },
      take: 6,
      include: {
        owner: { select: { username: true } },
        _count: { select: { votes: true } },
      },
    }),
    prisma.dataset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        owner: { select: { username: true } },
        _count: { select: { votes: true } },
      },
    }),
    prisma.dataset.groupBy({
      by: ['category'],
      _count: { id: true },
    }),
  ]);

  // Build category count map
  const catCountMap: Record<string, number> = {};
  categoryCounts.forEach((c: { category: string; _count: { id: number } }) => {
    catCountMap[c.category] = c._count.id;
  });

  // Match categories to our display definitions
  const categories = categoryDefs.map(def => {
    let count = 0;
    for (const [key, val] of Object.entries(catCountMap)) {
      if (key.toLowerCase().includes(def.slug) || def.title.toLowerCase() === key.toLowerCase()) {
        count += val;
      }
    }
    return { ...def, count };
  }).filter(cat => cat.count > 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-saffron-500/20 font-sans overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-saffron-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-20 text-center max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-orange-600 to-amber-600">
          Discover & Share Datasets
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Explore thousands of datasets for Machine Learning, Data Science, and Analytics.
          The premium platform for data creators and consumers.
        </p>

        <form action="/datasets" method="GET" className="relative max-w-2xl mx-auto mb-16 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-slate-400 group-focus-within:text-saffron-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            name="q"
            placeholder="Search datasets, tags, or creators..."
            className="w-full py-5 pl-14 pr-36 bg-white border border-slate-200 rounded-2xl text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500/50 focus:border-saffron-500 transition-all shadow-xl shadow-slate-200/50"
          />
          <button type="submit" className="absolute right-3 top-3 bottom-3 px-6 bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-saffron-500/25">
            Search
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-slate-700">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-slate-900 mb-1">{formatNumber(totalDatasets)}</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Datasets</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-slate-900 mb-1">{formatNumber(totalUsers)}</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Users</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-slate-900 mb-1">{formatNumber(totalDownloads)}</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Downloads</span>
          </div>
        </div>
      </section>

      {/* Trending Datasets Section */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Trending Datasets</h2>
              <p className="text-slate-500 text-sm mt-1">Most downloaded datasets across all categories</p>
            </div>
            <Link href="/datasets?sort=popular" className="text-saffron-600 hover:text-saffron-700 font-semibold flex items-center transition-colors">
              View all
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {trendingDatasets.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
              {trendingDatasets.map((dataset) => (
                <Link key={dataset.id} href={`/datasets/${dataset.slug}`} className="flex-none w-80 md:w-96 snap-start bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:border-saffron-300 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-saffron-500/10 group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-saffron-100 text-saffron-800 rounded-lg text-xs font-bold uppercase tracking-wider border border-saffron-200">{dataset.fileType || 'FILE'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                      <svg className="w-4 h-4 text-saffron-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>{formatNumber(dataset.downloadCount)}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-saffron-600 transition-colors line-clamp-1">{dataset.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">{dataset.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dataset.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-saffron-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {dataset.owner.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{dataset.owner.username}</span>
                    </div>
                    <span className="text-xs text-slate-400">{timeAgo(dataset.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-lg font-medium text-slate-600">No datasets yet. Be the first to upload!</p>
              <Link href="/datasets/upload" className="mt-4 inline-block px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-medium rounded-xl transition-all shadow-md">Upload Dataset →</Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section - only show if there are datasets */}
      {categories.length > 0 && (
        <section className="py-24 container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Browse by Category</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Explore datasets organized by research and industry domain</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => (
              <Link key={idx} href={`/datasets?category=${cat.slug}`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-saffron-300 hover:shadow-xl hover:shadow-saffron-500/10 transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col items-center justify-center group shadow-sm">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-saffron-600 transition-colors">{cat.title}</h3>
                  <p className="text-sm text-saffron-600 font-semibold">{cat.count} datasets</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Recently Added</h2>
              <p className="text-slate-500 text-sm mt-1">Fresh datasets published by the community</p>
            </div>
            <Link href="/datasets?sort=newest" className="text-saffron-600 hover:text-saffron-700 font-semibold flex items-center transition-colors">
              View all
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {recentDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDatasets.map((dataset) => (
                <Link key={dataset.id} href={`/datasets/${dataset.slug}`} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:border-saffron-300 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-saffron-500/10 group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-saffron-100 text-saffron-800 rounded-lg text-xs font-bold uppercase tracking-wider border border-saffron-200">{dataset.fileType || 'FILE'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <span className="flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4 text-saffron-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        {dataset._count.votes}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4 text-saffron-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {formatNumber(dataset.downloadCount)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-saffron-600 transition-colors line-clamp-1">{dataset.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">{dataset.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">@{dataset.owner.username}</span>
                    </div>
                    <span className="text-xs text-slate-400">{timeAgo(dataset.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-lg">No datasets added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-br from-saffron-500 via-orange-600 to-amber-600 text-white">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Share Your Dataset</h2>
          <p className="text-xl text-saffron-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the community and contribute your data to empower researchers and developers worldwide.
          </p>
          <Link href="/datasets/upload" className="inline-block px-8 py-4 bg-white text-saffron-700 font-bold rounded-xl text-lg hover:bg-saffron-50 transition-all shadow-xl hover:scale-105">
            Upload Dataset
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </main>
  );
}
