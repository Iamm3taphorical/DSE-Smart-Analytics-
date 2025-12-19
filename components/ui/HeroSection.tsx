import * as React from "react";
import { TrendingUp, ShieldCheck, Zap, ArrowRight, Activity, Globe, Smartphone } from "lucide-react";
import { MOCK_STOCKS } from "../../services/marketService";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  // Dual ticker tape for infinite scroll effect
  const tickerStocks = [...MOCK_STOCKS, ...MOCK_STOCKS];

  return (
    <div className="relative overflow-hidden bg-background pt-[100px] pb-20 lg:pt-[140px] lg:pb-32 min-h-screen flex flex-col justify-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border mb-8 animate-fade-in-up hover:border-primary/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">
              DSE Live Data Feed Active
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-6 leading-[1.1] animate-fade-in-up delay-100">
            Master the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-emerald-400 animate-gradient-x bg-[length:200%_auto]">
              Bangladesh Market
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed animate-fade-in-up delay-200">
            Replace speculation with data. The first AI-powered analytics platform designed for the Dhaka Stock Exchange.
            Real-time insights, machine learning forecasts, and zero broker bias.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fade-in-up delay-300">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
            >
              Start Analyzing Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-secondary hover:bg-accent border border-border hover:border-foreground/20 text-foreground font-semibold text-lg transition-all"
            >
              View Live Demo
            </button>
          </div>

          {/* Scrolling Ticker Tape */}
          <div className="w-full mt-20 mb-12 relative h-20 overflow-hidden mask-gradient-x">
            <div className="absolute flex gap-8 animate-marquee whitespace-nowrap left-0 top-1/2 -translate-y-1/2">
              {tickerStocks.map((stock, idx) => (
                <div key={`${stock.ticker}-${idx}`} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border border-border backdrop-blur-sm">
                  <span className="font-bold text-foreground">{stock.ticker}</span>
                  <span className={`text-sm font-mono ${stock.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.price.toFixed(2)}
                  </span>
                  <span className={`text-xs ${stock.changePercent >= 0 ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'} px-1.5 py-0.5 rounded`}>
                    {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-8 animate-fade-in-up delay-300">
            <div className="p-8 rounded-3xl bg-secondary/30 border border-border hover:border-primary/50 transition-all duration-300 group hover:bg-secondary/50">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 block-gradient-border">
                <Activity className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">ML-Powered Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">Proprietary algorithms analyze DSE trends, volume anomalies, and sentiment to forecast potential market moves with 85% accuracy confidence.</p>
            </div>

            <div className="p-8 rounded-3xl bg-secondary/30 border border-border hover:border-blue-500/50 transition-all duration-300 group hover:bg-secondary/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Gemini AI Assistant</h3>
              <p className="text-muted-foreground leading-relaxed">Ask complex financial questions in Bangla or English. Our AI interprets balance sheets, news impacts, and technical indicators instantly.</p>
            </div>

            <div className="p-8 rounded-3xl bg-secondary/30 border border-border hover:border-purple-500/50 transition-all duration-300 group hover:bg-secondary/50">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Institutional Grade</h3>
              <p className="text-muted-foreground leading-relaxed">Built with secure, scalable architecture. 2FA protected accounts, real-time data streaming, and bank-level data encryption standards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;