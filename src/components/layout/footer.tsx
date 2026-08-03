import Link from 'next/link';
import { Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#070710] border-t border-white/5 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="bg-gradient-to-br from-teal-400 to-indigo-500 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(45,212,191,0.5)] transition-all">
                <Database className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                DataLord
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The premium platform for discovering, sharing, and collaborating on high-quality datasets.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/datasets" className="text-sm hover:text-white transition-colors">
                  Browse Datasets
                </Link>
              </li>
              <li>
                <Link href="/datasets/upload" className="text-sm hover:text-white transition-colors">
                  Upload Dataset
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-sm hover:text-white transition-colors">
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/datasets?category=ml" className="text-sm hover:text-white transition-colors">
                  Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/datasets?category=nlp" className="text-sm hover:text-white transition-colors">
                  NLP
                </Link>
              </li>
              <li>
                <Link href="/datasets?category=cv" className="text-sm hover:text-white transition-colors">
                  Computer Vision
                </Link>
              </li>
              <li>
                <Link href="/datasets?category=finance" className="text-sm hover:text-white transition-colors">
                  Finance
                </Link>
              </li>
              <li>
                <Link href="/datasets?category=healthcare" className="text-sm hover:text-white transition-colors">
                  Healthcare
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} DataLord. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              API Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
