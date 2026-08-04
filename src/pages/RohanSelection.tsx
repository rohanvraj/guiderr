import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HUBS, INVENTORY } from '../data/inventory';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RohanSelection() {
  const { hubId, subId } = useParams<{ hubId?: string; subId?: string }>();

  // Smart Resolution: Handle /top-picks/:hubId, /top-picks/:hubId/:subId, AND direct product links like /top-picks/:productId
  let currentHub = HUBS.find(h => h.id === hubId);
  let currentSub = INVENTORY.find(p => p.id === subId);

  if (!currentSub && hubId) {
    const directProduct = INVENTORY.find(p => p.id === hubId);
    if (directProduct) {
      currentSub = directProduct;
      currentHub = HUBS.find(h => h.id === directProduct.category);
    }
  }

  const hubItems = INVENTORY.filter(p => p.category === (currentSub ? currentSub.category : hubId));
  const backLink = currentSub ? `/top-picks/${currentSub.category}` : '/top-picks';

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = currentSub ? currentSub.label : currentHub ? currentHub.label : "Top Picks";
    document.title = `${title} | Guiderr`;
  }, [currentHub, currentSub]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-20 sm:pt-20 pb-16">
        
        {/* BACK NAV */}
        <div className="mb-4 sm:mb-6">
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
            <Link to="/" className="group inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-all border border-slate-100 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Back to Home</span>
            </Link>
          )}
        </div>

        {currentSub ? (
          /* BRIDGE VIEW (Bio Links) - Fits above the fold on mobile */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto text-center px-4">
             <div className="aspect-square w-full max-w-[210px] sm:max-w-xs mx-auto mb-5 bg-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl shadow-orange-100 border border-slate-100 relative">
               <img 
                 src={optimizeCloudinaryUrl(currentSub.imageId, { width: 800, height: 800, crop: 'fill', quality: 'auto', format: 'auto' })} 
                 alt={currentSub.label} 
                 className="w-full h-full object-cover" 
               />
               <div className="absolute inset-0 border-[10px] border-white/10 pointer-events-none" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">{currentSub.label}</h1>
            
            {/* Description with space preserved */}
            {/* Description with space preserved */}
<p className="text-slate-500 mb-10 sm:mb-12 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">{currentSub.description}</p>
            
            {/* Primary CTA */}
           <a href={currentSub.amazonUrl} target="_blank" rel="noopener noreferrer sponsored" 
   className="inline-block w-full py-4 sm:py-5 bg-orange-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-500/25 hover:bg-orange-600 border border-orange-400 transition-all active:scale-95 text-xs sm:text-sm">
  {(currentSub.amazonUrl.includes('amazon') || currentSub.amazonUrl.includes('amzn.to')) ? "Shop on Amazon →" : "Check Offer Now →"}
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
                const destination = isHubList 
                  ? `/top-picks/${item.id}` 
                  : `/top-picks/${hubId}/${item.id}`;

                return (
                  <Link 
                    key={item.id} 
                    to={destination}
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
                        {isHubList ? "Explore Hub →" : "View Pick →"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <footer className="mt-16 sm:mt-24 pt-8 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-lg mx-auto">
            Disclosure: As an Amazon Associate, Guiderr earns from qualifying purchases. This helps support our free content. Images maybe AI generated and are for representational purposes only. Appearance & features may differ. Availability is subject to change. Please check the product page for the most up-to-date information.
          </p>
        </footer>
      </main>
      <Footer />
    </div>
  );
}