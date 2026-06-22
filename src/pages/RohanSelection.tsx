import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HUBS, INVENTORY } from '../data/inventory';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RohanSelection() {
  const { hubId, subId } = useParams<{ hubId?: string; subId?: string }>();

  const currentHub = HUBS.find(h => h.id === hubId);
  const currentSub = INVENTORY.find(p => p.id === subId);
  const hubItems = INVENTORY.filter(p => p.category === hubId);

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = currentSub ? currentSub.label : currentHub ? currentHub.label : "Top Picks";
    document.title = `${title} | Guiderr`;
  }, [currentHub, currentSub]);

  const backLink = currentSub ? `/top-picks/${hubId}` : '/top-picks';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20">
        
        {/* BACK NAV */}
        <div className="mb-8">
          {hubId ? (
            <Link to={backLink} className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {currentSub ? `Back to ${currentHub?.label}` : "Back to Hubs"}
              </span>
            </Link>
          ) : (
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Rohan's Recommendations</div>
          )}
        </div>

        {currentSub ? (
          /* BRIDGE VIEW (Bio Links) */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto text-center px-4">
             <div className="aspect-square w-full max-w-sm mx-auto mb-10 bg-slate-50 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-2xl shadow-orange-100 border border-slate-100 relative">
               <img 
  src={optimizeCloudinaryUrl(currentSub.imageId, { width: 800, height: 800, crop: 'fill', quality: 'auto', format: 'auto' })} 
  alt={currentSub.label} 
  className="w-full h-full object-cover" 
/>
               <div className="absolute inset-0 border-[12px] border-white/10 pointer-events-none" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">{currentSub.label}</h1>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed max-w-md mx-auto">{currentSub.description}</p>
            <a href={currentSub.amazonUrl} target="_blank" rel="noopener noreferrer sponsored" 
               className="inline-block w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-orange-500 transition-all active:scale-95">
              {currentSub.amazonUrl.includes('amazon') ? "Shop on Amazon →" : "Check Offer Now →"}
            </a>
          </div>
        ) : (
          /* GRID VIEW */
          <>
            <div className="mb-12">
              <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] mb-6">
                {currentHub ? currentHub.label : "Top Picks."}
              </h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md leading-relaxed">
                {currentHub ? currentHub.description : "My curated selection of gear and tools for a better lifestyle."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {(currentHub ? hubItems : HUBS).map((item) => {
                const isHubList = !hubId;
                const Component = isHubList ? Link : 'a';
                const props = isHubList 
                  ? { to: `/top-picks/${item.id}` } 
                  : { href: (item as any).amazonUrl, target: '_blank', rel: 'noopener noreferrer sponsored' };

                return (
                  <Component key={item.id} {...(props as any)}
                    className="group flex flex-col bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="aspect-square flex items-center justify-center bg-white m-2 rounded-[2rem] overflow-hidden relative">
                       <img 
  src={optimizeCloudinaryUrl(item.imageId, { width: 600, height: 600, crop: 'fill', quality: 'auto', format: 'auto' })} 
  alt={item.label} 
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
  loading="lazy" 
/>
                       <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none" />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1">{item.label}</h3>
                      <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">
                        {!isHubList ? ((item as any).amazonUrl?.includes('amazon') ? "Amazon →" : "Check Offer →") : "Explore Hub →"}
                    </p>          </div>
                  </Component>
                );
              })}
            </div>
          </>
        )}

        <footer className="mt-24 pt-10 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-lg mx-auto">
            Disclosure: As an Amazon Associate, Guiderr earns from qualifying purchases. This helps support our free content.
          </p>
        </footer>
      </main>
      <Footer />
    </div>
  );
}