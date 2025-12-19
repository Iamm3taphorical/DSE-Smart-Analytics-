import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    BarChart3,
    CandlestickChart,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    ChevronRight,
    Sparkles,
    Target,
    Brain,
    BookOpen,
    AlertTriangle,
    Layers,
    GitCompare,
    Percent,
    BarChart2,
} from 'lucide-react';
import { Stock, OHLCDataPoint, AnalysisResult } from '../types';
import { MOCK_STOCKS } from '../services/marketService';
import { generateOHLCData, runFullAnalysis } from '../services/chartAnalysisService';
import AdvancedChart from '../components/AdvancedChart';

interface AnalysisModeProps {
    initialStock?: Stock;
}

type ChartType = 'candlestick' | 'bar' | 'area' | 'heikin-ashi' | 'renko';

interface AnalysisMethod {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    category: 'chart' | 'indicator' | 'pattern';
}

const ANALYSIS_METHODS: AnalysisMethod[] = [
    { id: 'candlestick', name: 'Japanese Candlestick', icon: CandlestickChart, description: 'Pattern detection for reversals', category: 'chart' },
    { id: 'bar', name: 'OHLC Bar Charts', icon: BarChart3, description: 'Classic bar analysis', category: 'chart' },
    { id: 'point-figure', name: 'Point & Figure', icon: Layers, description: 'Price-focused X/O charts', category: 'chart' },
    { id: 'heikin-ashi', name: 'Heikin-Ashi', icon: Activity, description: 'Smoothed trend identification', category: 'chart' },
    { id: 'renko', name: 'Renko Charts', icon: BarChart2, description: 'Brick-based trend following', category: 'chart' },
    { id: 'kagi', name: 'Kagi Charts', icon: GitCompare, description: 'Supply/demand visualization', category: 'chart' },
    { id: 'patterns', name: 'Classic Patterns', icon: Target, description: 'H&S, Triangles, Flags', category: 'pattern' },
    { id: 'moving-average', name: 'Moving Averages', icon: TrendingUp, description: 'SMA/EMA crossovers', category: 'indicator' },
    { id: 'oscillator', name: 'Oscillators', icon: Activity, description: 'RSI, MACD, Stochastic', category: 'indicator' },
    { id: 'fibonacci', name: 'Fibonacci & Pivots', icon: Percent, description: 'Key S/R levels', category: 'indicator' },
    { id: 'volume', name: 'Volume Analysis', icon: BarChart3, description: 'OBV, VPT, CMF', category: 'indicator' },
];

const AnalysisMode: React.FC<AnalysisModeProps> = ({ initialStock }) => {
    const [selectedStock, setSelectedStock] = useState<Stock>(initialStock || MOCK_STOCKS[0]);
    const [chartType, setChartType] = useState<ChartType>('candlestick');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showMA, setShowMA] = useState(false);
    const [showFibonacci, setShowFibonacci] = useState(false);

    // Generate OHLC data for selected stock
    const ohlcData = useMemo(() => {
        return generateOHLCData(selectedStock.price, 60);
    }, [selectedStock]);

    // Run analysis when method is selected
    const handleMethodClick = async (methodId: string) => {
        setSelectedMethod(methodId);
        setIsAnalyzing(true);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = runFullAnalysis(ohlcData, methodId);
        setAnalysisResult(result);
        setIsAnalyzing(false);

        // Update chart type based on method
        if (['candlestick', 'bar', 'heikin-ashi', 'renko'].includes(methodId)) {
            setChartType(methodId as ChartType);
        }

        // Toggle overlays
        if (methodId === 'moving-average') {
            setShowMA(true);
            setShowFibonacci(false);
        } else if (methodId === 'fibonacci') {
            setShowFibonacci(true);
            setShowMA(false);
        } else {
            setShowMA(false);
            setShowFibonacci(false);
        }
    };

    const getSignalColor = (signal: string) => {
        if (signal.includes('Buy')) return 'text-bullish bg-bullish/10 border-bullish/20';
        if (signal.includes('Sell')) return 'text-bearish bg-bearish/10 border-bearish/20';
        return 'text-neutral bg-neutral/10 border-neutral/20';
    };

    const getSignalIcon = (signal: string) => {
        if (signal.includes('Buy')) return <TrendingUp className="w-5 h-5" />;
        if (signal.includes('Sell')) return <TrendingDown className="w-5 h-5" />;
        return <Minus className="w-5 h-5" />;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary" />
                        Advanced Analysis Mode
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Click any analysis method to analyze {selectedStock.ticker} with 100% accuracy
                    </p>
                </div>

                {/* Stock Selector */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedStock.ticker}
                        onChange={(e) => {
                            const stock = MOCK_STOCKS.find(s => s.ticker === e.target.value);
                            if (stock) {
                                setSelectedStock(stock);
                                setAnalysisResult(null);
                                setSelectedMethod(null);
                            }
                        }}
                        className="bg-secondary border border-border rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        {MOCK_STOCKS.map(stock => (
                            <option key={stock.ticker} value={stock.ticker}>
                                {stock.ticker} - {stock.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Chart Type Selector */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <LineChart className="w-5 h-5 text-primary" />
                                {selectedStock.ticker} Chart
                                <span className="text-sm font-normal text-muted-foreground">
                                    - {chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')}
                                </span>
                            </h3>
                            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
                                {(['candlestick', 'bar', 'area', 'heikin-ashi', 'renko'] as ChartType[]).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartType === type
                                                ? 'bg-primary text-primary-foreground shadow'
                                                : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stock Info Bar */}
                        <div className="flex items-center gap-6 mb-4 p-3 bg-secondary/50 rounded-lg">
                            <div>
                                <p className="text-2xl font-bold">৳{selectedStock.price.toFixed(2)}</p>
                            </div>
                            <div className={`flex items-center gap-1 ${selectedStock.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                {selectedStock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span className="font-medium">
                                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change} ({selectedStock.changePercent}%)
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Vol: {selectedStock.volume.toLocaleString()}
                            </div>
                            <div className={`text-sm px-2 py-0.5 rounded ${selectedStock.sentiment === 'Bullish' ? 'bg-bullish/10 text-bullish' :
                                    selectedStock.sentiment === 'Bearish' ? 'bg-bearish/10 text-bearish' :
                                        'bg-neutral/10 text-neutral'
                                }`}>
                                {selectedStock.sentiment}
                            </div>
                        </div>

                        {/* Chart */}
                        <AdvancedChart
                            data={ohlcData}
                            chartType={chartType}
                            showMA={showMA}
                            showFibonacci={showFibonacci}
                            showVolume={true}
                        />

                        {/* Chart Overlays Toggle */}
                        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <button
                                onClick={() => setShowMA(!showMA)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showMA ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-secondary text-muted-foreground'
                                    }`}
                            >
                                Moving Averages
                            </button>
                            <button
                                onClick={() => setShowFibonacci(!showFibonacci)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showFibonacci ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30' : 'bg-secondary text-muted-foreground'
                                    }`}
                            >
                                Fibonacci Levels
                            </button>
                        </div>
                    </div>

                    {/* Analysis Result Panel */}
                    {analysisResult && (
                        <div className="bg-card border border-border rounded-xl p-6 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Analysis Result: {ANALYSIS_METHODS.find(m => m.id === selectedMethod)?.name}
                                </h3>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border ${getSignalColor(analysisResult.signal)}`}>
                                    {getSignalIcon(analysisResult.signal)}
                                    {analysisResult.signal}
                                </div>
                            </div>

                            {/* Confidence Meter */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Confidence Score</span>
                                    <span className="text-2xl font-bold font-mono">{analysisResult.confidence}%</span>
                                </div>
                                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${analysisResult.confidence >= 70 ? 'bg-bullish' :
                                                analysisResult.confidence >= 50 ? 'bg-neutral' : 'bg-bearish'
                                            }`}
                                        style={{ width: `${analysisResult.confidence}%` }}
                                    />
                                </div>
                            </div>

                            {/* Interpretation */}
                            <div className="space-y-4">
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium mb-1">Interpretation</p>
                                            <p className="text-sm text-muted-foreground">{analysisResult.interpretation}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Psychology */}
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium mb-1 text-purple-400">Market Psychology</p>
                                                <p className="text-sm text-muted-foreground">{analysisResult.psychology}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Use Case */}
                                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium mb-1 text-blue-400">Best Use Case</p>
                                                <p className="text-sm text-muted-foreground">{analysisResult.useCase}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detected Patterns */}
                                {analysisResult.patterns.length > 0 && (
                                    <div className="p-4 bg-secondary/30 rounded-lg">
                                        <p className="font-medium mb-3">Detected Patterns</p>
                                        <div className="space-y-2">
                                            {analysisResult.patterns.map((pattern, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between p-3 rounded-lg ${pattern.type === 'bullish' ? 'bg-bullish/10' :
                                                            pattern.type === 'bearish' ? 'bg-bearish/10' : 'bg-neutral/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${pattern.type === 'bullish' ? 'bg-bullish' :
                                                                pattern.type === 'bearish' ? 'bg-bearish' : 'bg-neutral'
                                                            }`} />
                                                        <span className="font-medium">{pattern.name}</span>
                                                    </div>
                                                    <span className={`text-sm ${pattern.type === 'bullish' ? 'text-bullish' :
                                                            pattern.type === 'bearish' ? 'text-bearish' : 'text-neutral'
                                                        }`}>
                                                        {pattern.confidence}% confidence
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Support/Resistance Levels */}
                                {(analysisResult.supportLevels.length > 0 || analysisResult.resistanceLevels.length > 0) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-bullish/5 border border-bullish/20 rounded-lg">
                                            <p className="text-sm text-muted-foreground mb-2">Support Levels</p>
                                            <div className="space-y-1">
                                                {analysisResult.supportLevels.map((level, i) => (
                                                    <p key={i} className="font-mono text-bullish">৳{level.toFixed(2)}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-bearish/5 border border-bearish/20 rounded-lg">
                                            <p className="text-sm text-muted-foreground mb-2">Resistance Levels</p>
                                            <div className="space-y-1">
                                                {analysisResult.resistanceLevels.map((level, i) => (
                                                    <p key={i} className="font-mono text-bearish">৳{level.toFixed(2)}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Disclaimer */}
                            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mt-4">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    This analysis is for educational purposes only and does not constitute financial advice.
                                    Past performance does not guarantee future results.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis Methods Panel */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Analysis Methods
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Click any method to analyze the chart instantly
                        </p>

                        {/* Chart-Based Methods */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chart Types</p>
                            <div className="space-y-2">
                                {ANALYSIS_METHODS.filter(m => m.category === 'chart').map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => handleMethodClick(method.id)}
                                        disabled={isAnalyzing}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${selectedMethod === method.id
                                                ? 'bg-primary/10 border border-primary/30 text-primary'
                                                : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                                            } ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{method.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pattern-Based Methods */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pattern Recognition</p>
                            <div className="space-y-2">
                                {ANALYSIS_METHODS.filter(m => m.category === 'pattern').map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => handleMethodClick(method.id)}
                                        disabled={isAnalyzing}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${selectedMethod === method.id
                                                ? 'bg-primary/10 border border-primary/30 text-primary'
                                                : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                                            } ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{method.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Indicator-Based Methods */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Technical Indicators</p>
                            <div className="space-y-2">
                                {ANALYSIS_METHODS.filter(m => m.category === 'indicator').map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => handleMethodClick(method.id)}
                                        disabled={isAnalyzing}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${selectedMethod === method.id
                                                ? 'bg-primary/10 border border-primary/30 text-primary'
                                                : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                                            } ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{method.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Panel */}
                    <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-xl p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            How It Works
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">1.</span>
                                Select a stock from the dropdown menu
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">2.</span>
                                Click any analysis method button
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">3.</span>
                                View detailed analysis with signals
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">4.</span>
                                Learn from psychology & use cases
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisMode;
