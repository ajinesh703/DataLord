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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-saffron-500/20 pb-20">
      {/* Header Search */}
      <div className="bg-white border-b border-slate-200 py-6 sticky top-16 z-20 backdrop-blur-md bg-white/90 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <form action="/datasets" method="GET" className="relative max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search datasets..."
              className="w-full py-3.5 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500/50 focus:border-saffron-500 transition-all"
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
            <div className="sticky top-36 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <Link 
                    href={`/datasets?q=${query}&sort=${currentSort}&type=${currentType}`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!currentCategory ? 'bg-saffron-50 text-saffron-700 border border-saffron-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-saffron-50 text-saffron-700 border border-saffron-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                      >
                        {cat}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* File Types */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">File Type</h3>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map(type => {
                    const slug = type.toLowerCase();
                    const isActive = currentType === slug;
                    return (
                      <Link 
                        key={type}
                        href={isActive ? `/datasets?q=${query}&category=${currentCategory}&sort=${currentSort}` : `/datasets?q=${query}&category=${currentCategory}&sort=${currentSort}&type=${slug}`}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${isActive ? 'bg-saffron-500 text-white border-saffron-500 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
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
              <p className="text-slate-600 font-medium">
                Showing <span className="text-slate-900 font-bold">{total}</span> dataset{total !== 1 ? 's' : ''} {query && <>for <span className="text-slate-900 font-bold">&quot;{query}&quot;</span></>}
              </p>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 mr-1 uppercase font-semibold">Sort by:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sortOptions.map(sort => {
                    const isActive = currentSort === sort.slug;
                    return (
                      <Link
                        key={sort.slug}
                        href={`/datasets?q=${query}&category=${currentCategory}&type=${currentType}&sort=${sort.slug}`}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${isActive ? 'border-saffron-300 bg-saffron-50 text-saffron-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}
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
                  <Link key={dataset.id} href={`/datasets/${dataset.slug}`} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-saffron-300 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-saffron-500/10 group cursor-pointer flex flex-col shadow-xs">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-saffron-100 border border-saffron-200 rounded-md text-[10px] font-bold text-saffron-800 uppercase tracking-wider">{dataset.fileType || 'FILE'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                        <span className="flex items-center gap-1" title="Upvotes">
                          <svg className="w-3.5 h-3.5 text-saffron-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          {dataset._count.votes}
                        </span>
                        <span className="flex items-center gap-1" title="Downloads">
                          <svg className="w-3.5 h-3.5 text-saffron-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {formatNumber(dataset.downloadCount)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-saffron-600 transition-colors line-clamp-2 leading-tight">{dataset.title}</h3>
                    <p className="text-slate-600 text-sm mb-5 line-clamp-3 flex-1">{dataset.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {dataset.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-saffron-400 to-orange-500 flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                          {dataset.owner.username[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">{dataset.owner.username}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{timeAgo(dataset.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No datasets found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {query ? `No results for "${query}". Try a different search term or clear your filters.` : 'No datasets available yet. Be the first to upload!'}
                </p>
                <Link href="/datasets/upload" className="inline-block px-6 py-2.5 bg-gradient-to-r from-saffron-500 to-orange-600 text-white font-medium rounded-xl hover:from-saffron-600 hover:to-orange-700 transition-all shadow-md">
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
                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Previous
                  </Link>
                ) : (
                  <button className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed" disabled>
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
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center font-medium transition-colors ${pageNum === page ? 'bg-saffron-500 border-saffron-500 text-white shadow-xs font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <span className="text-slate-400 px-2">...</span>
                )}

                {page < totalPages ? (
                  <Link
                    href={`/datasets?q=${query}&category=${currentCategory}&type=${currentType}&sort=${currentSort}&page=${page + 1}`}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Next
                  </Link>
                ) : (
                  <button className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed" disabled>
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
