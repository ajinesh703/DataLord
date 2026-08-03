import Link from 'next/link';
import prisma from '@/lib/prisma';

const categoryLabels = [
  'Machine Learning', 'NLP', 'Computer Vision', 'Finance & Economics', 'Healthcare', 'Climate & Environment', 'Sports', 'Social Science'
];
const fileTypes = ['CSV', 'JSON', 'XLSX', 'ZIP'];
const sortOptions = [
  { label: 'Newest', slug: 'newest' },
  { label: 'Most Popular', slug: 'most-popular' },
  { label: 'Most Downloaded', slug: 'most-downloaded' },
  { label: 'Most Viewed', slug: 'most-viewed' },
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

export default async function DatasetsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await (searchParams || Promise.resolve({}))) as { [key: string]: string | string[] | undefined };
  const query = (params?.q as string) || '';
  const currentCategory = (params?.category as string) || '';
  const currentSort = (params?.sort as string) || 'newest';
  const currentType = (params?.type as string) || '';
  const page = parseInt((params?.page as string) || '1', 10);
  const limit = 12;

  // Build where clause
  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { has: query.toLowerCase() } },
    ];
  }

  if (currentCategory) {
    const categoryMap: Record<string, string> = {
      'machine-learning': 'Machine Learning',
      'nlp': 'NLP',
      'computer-vision': 'Computer Vision',
      'finance-&-economics': 'Finance & Economics',
      'healthcare': 'Healthcare',
      'climate-&-environment': 'Climate & Environment',
      'sports': 'Sports',
      'social-science': 'Social Science',
      'ml': 'Machine Learning',
      'cv': 'Computer Vision',
      'finance': 'Finance & Economics',
      'climate': 'Climate & Environment',
      'social': 'Social Science',
    };
    const categoryName = categoryMap[currentCategory.toLowerCase()] || currentCategory;
    where.category = { equals: categoryName, mode: 'insensitive' };
  }

  if (currentType) {
    where.fileType = { equals: currentType.toUpperCase() };
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  switch (currentSort) {
    case 'most-popular':
      orderBy = { viewCount: 'desc' };
      break;
    case 'most-downloaded':
      orderBy = { downloadCount: 'desc' };
      break;
    case 'most-viewed':
      orderBy = { viewCount: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [datasets, total] = await Promise.all([
    prisma.dataset.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { username: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
    }),
    prisma.dataset.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
      {/* Header Search */}
      <div className="bg-[#0d0d14] border-b border-white/5 py-8 sticky top-0 z-20 backdrop-blur-md bg-[#0d0d14]/80">
        <div className="container mx-auto px-6 max-w-7xl">
          <form action="/datasets" method="GET" className="relative max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search datasets..."
              className="w-full py-3.5 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
            {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
            {currentSort && currentSort !== 'newest' && <input type="hidden" name="sort" value={currentSort} />}
            {currentType && <input type="hidden" name="type" value={currentType} />}
          </form>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-32 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <Link 
                    href={`/datasets?q=${query}&sort=${currentSort}&type=${currentType}`}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!currentCategory ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                  >
                    All Categories
                  </Link>
                  {categoryLabels.map(cat => {
                    const slug = cat.toLowerCase().replace(/\s+/g, '-');
                    const isActive = currentCategory === slug;
                    return (
                      <Link 
                        key={cat}
                        href={`/datasets?q=${query}&category=${slug}&sort=${currentSort}&type=${currentType}`}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                      >
                        {cat}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* File Types */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">File Type</h3>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map(type => {
                    const slug = type.toLowerCase();
                    const isActive = currentType === slug;
                    return (
                      <Link 
                        key={type}
                        href={isActive ? `/datasets?q=${query}&category=${currentCategory}&sort=${currentSort}` : `/datasets?q=${query}&category=${currentCategory}&sort=${currentSort}&type=${slug}`}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${isActive ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                      >
                        {type}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Results Area */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <p className="text-slate-400 font-medium">
                Showing <span className="text-white">{total}</span> dataset{total !== 1 ? 's' : ''} {query && <>for <span className="text-white">&quot;{query}&quot;</span></>}
              </p>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 mr-2">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(sort => {
                    const isActive = currentSort === sort.slug;
                    return (
                      <Link
                        key={sort.slug}
                        href={`/datasets?q=${query}&category=${currentCategory}&type=${currentType}&sort=${sort.slug}`}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${isActive ? 'border-white/20 bg-white/10 text-white' : 'border-transparent text-slate-400 hover:bg-white/5'}`}
                      >
                        {sort.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {datasets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {datasets.map((dataset) => (
                  <Link key={dataset.id} href={`/datasets/${dataset.slug}`} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 group cursor-pointer flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold text-cyan-300 uppercase tracking-wider">{dataset.fileType || 'FILE'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                        <span className="flex items-center gap-1" title="Upvotes">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          {dataset._count.votes}
                        </span>
                        <span className="flex items-center gap-1" title="Downloads">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {formatNumber(dataset.downloadCount)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">{dataset.title}</h3>
                    <p className="text-slate-400 text-sm mb-5 line-clamp-3 flex-1">{dataset.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      {dataset.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-medium text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                          {dataset.owner.username[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-slate-300 truncate max-w-[100px]">{dataset.owner.username}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{timeAgo(dataset.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">No datasets found</h3>
                <p className="text-slate-400">
                  {query ? `No results for "${query}". Try a different search term.` : 'No datasets available yet. Be the first to upload!'}
                </p>
                <Link href="/datasets/upload" className="mt-6 inline-block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all">
                  Upload Dataset
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`/datasets?q=${query}&category=${currentCategory}&type=${currentType}&sort=${currentSort}&page=${page - 1}`}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Previous
                  </Link>
                ) : (
                  <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                )}
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Link
                      key={pageNum}
                      href={`/datasets?q=${query}&category=${currentCategory}&type=${currentType}&sort=${currentSort}&page=${pageNum}`}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center font-medium transition-colors ${pageNum === page ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <span className="text-slate-500 px-2">...</span>
                )}

                {page < totalPages ? (
                  <Link
                    href={`/datasets?q=${query}&category=${currentCategory}&type=${currentType}&sort=${currentSort}&page=${page + 1}`}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Next
                  </Link>
                ) : (
                  <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Next
                  </button>
                )}
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
}
