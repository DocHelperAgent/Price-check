
import React, { useState, useCallback } from 'react';
import { AppState, ProductDetails } from './types';
import { identifyProductFromImage, fetchPriceComparisons } from './services/geminiService';
import Scanner from './components/Scanner';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ProductDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setAppState(AppState.SEARCHING);
    setLoadingMsg(`Searching for "${query}"...`);
    try {
      const data = await fetchPriceComparisons(query);
      setResults(data);
      setAppState(AppState.RESULTS);
    } catch (err) {
      setErrorMsg("Failed to find price information. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const onScanCapture = async (base64: string) => {
    setAppState(AppState.SEARCHING);
    setLoadingMsg("Identifying product...");
    try {
      const name = await identifyProductFromImage(base64);
      setLoadingMsg(`Finding prices for ${name}...`);
      const data = await fetchPriceComparisons(name);
      setResults(data);
      setAppState(AppState.RESULTS);
    } catch (err) {
      setErrorMsg("Could not identify the product. Try searching manually.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setResults(null);
    setSearchQuery('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2" onClick={reset}>
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <i className="fas fa-magnifying-glass-dollar text-white text-sm"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight text-gray-900">PriceLens</h1>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <i className="fas fa-cog text-xl"></i>
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {appState === AppState.IDLE && (
          <div className="px-6 py-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-barcode text-4xl text-blue-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Save on every purchase</h2>
            <p className="text-gray-500 mb-8 max-w-[280px]">Scan a barcode or search to compare prices across top retailers instantly.</p>
            
            <div className="w-full space-y-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search product name or SKU"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleSearch(searchQuery)}
                  className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-transform"
                >
                  Search
                </button>
                <button 
                  onClick={() => setAppState(AppState.SCANNING)}
                  className="w-16 bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-blue-200"
                >
                  <i className="fas fa-expand"></i>
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full">
              <div className="bg-orange-50 p-4 rounded-2xl text-left border border-orange-100">
                <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center mb-3">
                  <i className="fas fa-fire text-orange-600 text-xs"></i>
                </div>
                <h3 className="font-semibold text-sm text-gray-800">Hot Deals</h3>
                <p className="text-xs text-gray-500">Daily price drops</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl text-left border border-green-100">
                <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mb-3">
                  <i className="fas fa-history text-green-600 text-xs"></i>
                </div>
                <h3 className="font-semibold text-sm text-gray-800">History</h3>
                <p className="text-xs text-gray-500">Tracked items</p>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.SEARCHING && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-magnifying-glass text-blue-600"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{loadingMsg}</h3>
            <p className="text-gray-500">Comparing millions of prices across retailers...</p>
          </div>
        )}

        {appState === AppState.RESULTS && results && (
          <div className="px-6 py-6 space-y-6 bg-gray-50 min-h-full">
            <button onClick={reset} className="flex items-center gap-2 text-blue-600 font-medium mb-2">
              <i className="fas fa-arrow-left"></i>
              Back to search
            </button>

            {/* Main Product Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                  {results.image ? (
                    <img src={results.image} alt={results.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <i className="fas fa-image text-gray-300 text-2xl"></i>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">{results.name}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">{results.description || "Found current prices from multiple online stores."}</p>
                </div>
              </div>

              {results.prices.length > 0 && (
                <div className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-100">
                  <div>
                    <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Best Price</span>
                    <div className="text-2xl font-black">${results.prices[0].price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs opacity-80 block">at {results.prices[0].source}</span>
                    <a 
                      href={results.prices[0].url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-1 bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold active:scale-95 transition-transform"
                    >
                      Buy Now
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* List of Retailers */}
            <div className="space-y-3 pb-24">
              <h3 className="font-bold text-gray-800 px-1">Other Retailers</h3>
              {results.prices.slice(1).map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <i className="fas fa-store text-gray-400"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.source}</h4>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{item.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 font-semibold"
                    >
                      View Link
                    </a>
                  </div>
                </div>
              ))}
              {results.prices.length <= 1 && (
                <div className="p-8 text-center text-gray-400 italic">No other retailers found for this specific item.</div>
              )}
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-triangle-exclamation text-3xl text-red-500"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-8">{errorMsg}</p>
            <button onClick={reset} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-semibold">Try Again</button>
          </div>
        )}
      </main>

      {/* Modals */}
      {appState === AppState.SCANNING && (
        <Scanner 
          onClose={() => setAppState(AppState.IDLE)} 
          onCapture={onScanCapture} 
        />
      )}

      {/* Bottom Tab Bar (Visible on main screens) */}
      {(appState === AppState.IDLE || appState === AppState.RESULTS) && (
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t px-8 py-3 flex justify-between safe-area-inset-bottom z-30">
          <button onClick={reset} className={`flex flex-col items-center gap-1 ${appState === AppState.IDLE ? 'text-blue-600' : 'text-gray-400'}`}>
            <i className="fas fa-house"></i>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button onClick={() => setAppState(AppState.SCANNING)} className="flex flex-col items-center gap-1 -mt-8">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 border-4 border-white">
              <i className="fas fa-expand"></i>
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-1">Scan</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <i className="fas fa-heart"></i>
            <span className="text-[10px] font-bold">Saved</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
