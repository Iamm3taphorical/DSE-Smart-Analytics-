import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, Bell, Menu, TrendingUp, TrendingDown, LayoutDashboard, Briefcase, FileText, PieChart, Activity, Brain, User, Settings, Command } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Stock, NewsItem } from '../types';
import { MOCK_STOCKS, MOCK_NEWS, generateMockChartData, simulatePriceUpdate } from '../services/marketService';
import { getTechnicalIndicators } from '../services/analyticsService';
import StockChart from './StockChart';
import AIAssistant from './AIAssistant';
import TopMovers from './TopMovers';
import SectorHeatmap from './SectorHeatmap';
import TechnicalIndicators from './TechnicalIndicators';
import ThemeToggle from './ui/ThemeToggle';
import LegalDisclaimer from './ui/LegalDisclaimer';
import VolatilityAlert from './ui/VolatilityAlert';
import Portfolio from '../pages/Portfolio';
import Alerts from '../pages/Alerts';
import AnalysisMode from '../pages/AnalysisMode';
import UserProfileModal from './UserProfileModal';
import SearchModal from './SearchModal';
import { UserProfileProvider, useUserProfile } from '../context/UserProfileContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  user: { id?: string; name: string; email: string };
  onLogout: () => void;
}

type ActiveTab = 'overview' | 'analysis' | 'news' | 'portfolio' | 'alerts';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [selectedStock, setSelectedStock] = useState<Stock>(MOCK_STOCKS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentTimeframe, setCurrentTimeframe] = useState('1M');
  const userId = user.id || user.email || 'demo-user';

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter stocks based on search
  const filteredStocks = MOCK_STOCKS.filter(s =>
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [chartData, setChartData] = useState(generateMockChartData(selectedStock.ticker));
  // Calculate indicators for selected stock
  const technicalIndicators = getTechnicalIndicators(chartData);

  useEffect(() => {
    setChartData(generateMockChartData(selectedStock.ticker, timeframeToDays(currentTimeframe)));
  }, [selectedStock, currentTimeframe]);

  function timeframeToDays(tf: string): number {
    switch (tf) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 30;
    }
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { profile } = useUserProfile();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mr-3">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">DSE<span className="text-emerald-500">Analytics</span></span>
          </div>

          <div className="flex-1 py-6 px-4 space-y-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'analysis' ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                <Brain className="w-5 h-5 mr-3" />
                Analysis Mode
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">NEW</span>
              </button>
            </nav>

            <div className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personal</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <Briefcase className="w-5 h-5 mr-3" />
                  Portfolio
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">SIM</span>
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'alerts' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Alerts
                </button>
              </nav>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab('overview'); setTimeout(() => scrollToSection('top-movers'), 100); }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-secondary transition-colors"
              >
                <Activity className="w-5 h-5 mr-3" />
                Market Movers
              </button>
              <button
                onClick={() => { setActiveTab('overview'); setTimeout(() => scrollToSection('sector-analysis'), 100); }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-secondary transition-colors"
              >
                <PieChart className="w-5 h-5 mr-3" />
                Sector Analysis
              </button>
              <button
                onClick={() => { setActiveTab('overview'); setTimeout(() => scrollToSection('news-feed'), 100); }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-secondary transition-colors"
              >
                <FileText className="w-5 h-5 mr-3" />
                News & Reports
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-500 font-bold">{profile?.name?.charAt(0) || user.name.charAt(0) || 'U'}</span>
                )}
              </button>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-white truncate">{profile?.name || user.name}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.email || user.email}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit Profile"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onLogout} className="w-full py-2 px-4 rounded-lg bg-secondary hover:bg-red-500/10 hover:text-red-500 text-xs text-gray-400 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-background/50 backdrop-blur border-b border-border flex items-center justify-between px-6 z-20 sticky top-0">
          <div className="flex items-center md:hidden">
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. GP, BATBC)..."
                className="w-full bg-secondary border border-border rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {searchQuery && (
                <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map(s => (
                      <button
                        key={s.ticker}
                        onClick={() => {
                          setSelectedStock(s);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
                      >
                        <div className="text-left">
                          <p className="font-bold text-sm text-white">{s.ticker}</p>
                          <p className="text-xs text-gray-500">{s.name}</p>
                        </div>
                        <span className="text-xs font-mono text-emerald-500">৳{s.price}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No stocks found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 p-4">
                  <h4 className="text-sm font-bold mb-2">Notifications</h4>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">DUTCHBANGL Price Alert: Below ৳52.30</p>
                    <p className="text-xs text-muted-foreground p-2">DSE Market is now OPEN</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'portfolio' ? (
                  <Portfolio />
                ) : activeTab === 'alerts' ? (
                  <Alerts />
                ) : activeTab === 'analysis' ? (
                  <AnalysisMode initialStock={selectedStock} />
                ) : (
                  <>
                    {/* Market Ticker Tape (Static Mock) */}
                    <div className="w-full overflow-hidden bg-emerald-900/10 border border-emerald-500/20 rounded-lg py-2 flex items-center">
                      <div className="flex gap-8 animate-marquee whitespace-nowrap px-4 text-sm font-mono">
                        {MOCK_STOCKS.map(s => (
                          <span key={s.ticker} className="flex items-center gap-2">
                            <span className="font-bold text-white">{s.ticker}</span>
                            <span className={s.change >= 0 ? "text-emerald-500" : "text-red-500"}>
                              {s.price.toFixed(2)} ({s.change > 0 ? '+' : ''}{s.changePercent}%)
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Chart Section */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {selectedStock.ticker}
                                <span className="text-sm font-normal text-gray-500 px-2 py-0.5 rounded-full bg-secondary border border-border">{selectedStock.sector}</span>
                              </h2>
                              <div className="flex items-end gap-3 mt-1">
                                <span className="text-3xl font-bold text-white">৳ {selectedStock.price}</span>
                                <span className={`text-lg font-medium flex items-center ${selectedStock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {selectedStock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                  {selectedStock.change} ({selectedStock.changePercent}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {['1D', '1W', '1M', '6M', '1Y'].map(tf => (
                                <button
                                  key={tf}
                                  onClick={() => setCurrentTimeframe(tf)}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${tf === currentTimeframe ? 'bg-primary text-white border-primary' : 'bg-secondary text-gray-400 hover:text-white border-transparent'} border`}
                                >
                                  {tf}
                                </button>
                              ))}
                            </div>
                          </div>

                          <StockChart data={chartData} color={selectedStock.change >= 0 ? '#10b981' : '#ef4444'} />

                          <div className="grid grid-cols-3 gap-4 mt-6 border-t border-border pt-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Volume</p>
                              <p className="font-mono text-white">{selectedStock.volume.toLocaleString()}</p>
                            </div>
                            <div className="text-center border-l border-border">
                              <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                              <p className={`font-medium ${selectedStock.sentiment === 'Bullish' ? 'text-emerald-500' : selectedStock.sentiment === 'Bearish' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedStock.sentiment}</p>
                            </div>
                            <div className="text-center border-l border-border">
                              <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
                              <p className="font-mono text-blue-500">{selectedStock.confidence}%</p>
                            </div>
                          </div>
                        </div>

                        <div id="sector-analysis">
                          <SectorHeatmap />
                        </div>

                        {/* News Feed */}
                        <div id="news-feed" className="bg-card border border-border rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Latest Market News</h3>
                          <div className="space-y-4">
                            {MOCK_NEWS.map(news => (
                              <div
                                key={news.id}
                                onClick={() => alert(`Opening news article: ${news.title}\nFull analysis feature coming soon!`)}
                                className="flex gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer"
                              >
                                <div className={`w-1 h-full rounded-full self-stretch ${news.impact === 'Positive' ? 'bg-emerald-500' : news.impact === 'Negative' ? 'bg-red-500' : 'bg-gray-500'}`} />
                                <div>
                                  <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{news.title}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{news.source} • {news.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Watchlist, Top Movers, AI */}
                      <div className="lg:col-span-1 space-y-6">
                        <VolatilityAlert stock={selectedStock} />

                        <div id="top-movers">
                          <TopMovers onSelectStock={setSelectedStock} />
                        </div>

                        <TechnicalIndicators
                          indicators={technicalIndicators}
                          ticker={selectedStock.ticker}
                        />

                        {/* Watchlist */}
                        <div className="bg-card border border-border rounded-xl p-6 h-full">
                          <h3 className="text-lg font-semibold text-white mb-4">Watchlist</h3>
                          <div className="space-y-2">
                            {MOCK_STOCKS.map(stock => (
                              <div
                                key={stock.ticker}
                                onClick={() => setSelectedStock(stock)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selectedStock.ticker === stock.ticker ? 'bg-secondary border-primary/50' : 'bg-transparent border-transparent hover:bg-secondary'}`}
                              >
                                <div>
                                  <p className="font-bold text-sm text-white">{stock.ticker}</p>
                                  <p className="text-xs text-gray-500">{stock.name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-mono text-white">৳ {stock.price}</p>
                                  <p className={`text-xs ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => alert('Trading feature coming soon! Available for registered brokerage users.')}
                            className="w-full mt-4 py-2 text-sm text-emerald-500 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 transition-colors"
                          >
                            + Add Symbol
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <LegalDisclaimer variant="full" className="mt-8" />
          </div>

          <footer className="max-w-7xl mx-auto mt-12 py-8 border-t border-border text-center space-y-2">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} DSE Smart Analytics. All rights reserved.</p>
            <p className="text-xs text-gray-500">
              Made with ❤️ by{' '}
              <a
                href="https://iamm3taphorical.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Mahir Dyan
              </a>
            </p>
          </footer>
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant
        currentContext={{
          stock: selectedStock.ticker,
          page: activeTab,
          indicators: technicalIndicators
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectStock={(stock) => {
          setSelectedStock(stock);
          if (activeTab === 'analysis') {
            // Force re-analysis if needed or just switch stock
          }
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div >
  );
};

// Wrap Dashboard with UserProfileProvider
const DashboardWithProfile: React.FC<DashboardProps> = (props) => (
  <UserProfileProvider initialUser={{ id: props.user.id || 'default', name: props.user.name, email: props.user.email }}>
    <Dashboard {...props} />
  </UserProfileProvider>
);

export default DashboardWithProfile;