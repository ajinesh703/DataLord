export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 text-slate-900 selection:bg-saffron-500/20">
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 z-0 opacity-60"
        style={{
          background: 'linear-gradient(-45deg, #f8fafc, #fff9ed, #ffefcd, #f8fafc)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />
      
      {/* Floating Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-saffron-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-saffron-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `
      }} />

      {/* Main Content */}
      {children}
    </div>
  );
}
