import * as React from 'react';
import { useState, useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    Cell,
} from 'recharts';
import { OHLCDataPoint } from '../types';
import {
    calculateHeikinAshi,
    generateRenko,
    analyzeMovingAverages,
    analyzeFibonacci
} from '../services/chartAnalysisService';

interface AdvancedChartProps {
    data: OHLCDataPoint[];
    chartType: 'candlestick' | 'bar' | 'area' | 'heikin-ashi' | 'renko';
    showMA?: boolean;
    showFibonacci?: boolean;
    showVolume?: boolean;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
    data,
    chartType,
    showMA = false,
    showFibonacci = false,
    showVolume = true
}) => {
    // Process data based on chart type
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        switch (chartType) {
            case 'heikin-ashi': {
                const result = calculateHeikinAshi(data);
                return result.candles.map(c => ({
                    ...c,
                    isUp: c.close >= c.open,
                }));
            }
            case 'renko': {
                const result = generateRenko(data);
                return result.bricks.map((brick, i) => ({
                    ...brick,
                    index: i,
                    brickSize: result.brickSize,
                    low: brick.type === 'up' ? brick.price - result.brickSize : brick.price,
                    high: brick.type === 'up' ? brick.price : brick.price + result.brickSize,
                }));
            }
            default:
                return data.map(d => ({
                    ...d,
                    isUp: d.close >= d.open,
                }));
        }
    }, [data, chartType]);

    // Calculate moving averages if enabled
    const maData = useMemo(() => {
        if (!showMA || !data || data.length < 20) return null;
        return analyzeMovingAverages(data);
    }, [data, showMA]);

    // Calculate Fibonacci levels if enabled
    const fibData = useMemo(() => {
        if (!showFibonacci || !data || data.length < 10) return null;
        return analyzeFibonacci(data);
    }, [data, showFibonacci]);

    // Calculate SMA values for each data point
    const dataWithMA = useMemo(() => {
        if (!showMA || !data || data.length < 20) return processedData;

        return processedData.map((d, i) => {
            const closes = data.slice(0, i + 1).map(x => x.close);
            const sma20 = closes.length >= 20
                ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20
                : null;
            const sma50 = closes.length >= 50
                ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
                : null;
            return { ...d, sma20, sma50 };
        });
    }, [processedData, data, showMA]);

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-secondary/20 rounded-lg">
                <p className="text-muted-foreground">No chart data available</p>
            </div>
        );
    }

    const allData = chartType === 'renko' ? processedData : dataWithMA;

    // Calculate price range
    const prices = chartType === 'renko'
        ? processedData.flatMap(d => [d.low || d.price, d.high || d.price])
        : data.flatMap(d => [d.low, d.high]);
    const minPrice = Math.min(...prices) * 0.98;
    const maxPrice = Math.max(...prices) * 1.02;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const d = payload[0]?.payload;
        if (!d) return null;

        if (chartType === 'renko') {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                    <p className="text-xs text-muted-foreground mb-1">{d.date}</p>
                    <p className={`font-bold ${d.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {d.type === 'up' ? '▲ Up Brick' : '▼ Down Brick'}
                    </p>
                    <p>Price: ৳{d.price?.toFixed(2)}</p>
                </div>
            );
        }

        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                <p className="text-xs text-muted-foreground mb-2">{d.date}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-muted-foreground">Open:</span>
                    <span className="font-mono">৳{d.open?.toFixed(2)}</span>
                    <span className="text-muted-foreground">High:</span>
                    <span className="font-mono text-green-500">৳{d.high?.toFixed(2)}</span>
                    <span className="text-muted-foreground">Low:</span>
                    <span className="font-mono text-red-500">৳{d.low?.toFixed(2)}</span>
                    <span className="text-muted-foreground">Close:</span>
                    <span className={`font-mono font-bold ${d.close >= d.open ? 'text-green-500' : 'text-red-500'}`}>
                        ৳{d.close?.toFixed(2)}
                    </span>
                    {d.volume && (
                        <>
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="font-mono">{d.volume.toLocaleString()}</span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={allData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCloseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />

                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (!value) return '';
                                const d = new Date(value);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />

                        <YAxis
                            stroke="#6b7280"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={[minPrice, maxPrice]}
                            tickFormatter={(value) => `৳${value.toFixed(0)}`}
                            width={60}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Fibonacci Reference Lines */}
                        {fibData && showFibonacci && fibData.levels.map((level, i) => (
                            <ReferenceLine
                                key={i}
                                y={level.price}
                                stroke={i === 3 ? '#f59e0b' : '#6366f1'}
                                strokeDasharray={i === 3 ? "none" : "5 5"}
                                strokeWidth={i === 3 ? 2 : 1}
                            />
                        ))}

                        {/* Chart Content Based on Type */}
                        {chartType === 'area' && (
                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#colorCloseGradient)"
                                isAnimationActive={false}
                            />
                        )}

                        {(chartType === 'candlestick' || chartType === 'heikin-ashi') && (
                            <>
                                {/* Candlestick wicks (high-low) */}
                                <Bar
                                    dataKey="high"
                                    fill="transparent"
                                    isAnimationActive={false}
                                    shape={(props: any) => {
                                        const { x, width, payload } = props;
                                        if (!payload) return null;
                                        const { high, low, open, close } = payload;
                                        const isUp = close >= open;
                                        const color = isUp ? '#10b981' : '#ef4444';

                                        // Scale calculation
                                        const yScale = (val: number) => {
                                            const range = maxPrice - minPrice;
                                            const chartHeight = 380;
                                            return ((maxPrice - val) / range) * chartHeight + 10;
                                        };

                                        const highY = yScale(high);
                                        const lowY = yScale(low);
                                        const openY = yScale(open);
                                        const closeY = yScale(close);
                                        const bodyTop = Math.min(openY, closeY);
                                        const bodyBottom = Math.max(openY, closeY);
                                        const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
                                        const candleWidth = Math.max(width * 0.6, 4);
                                        const centerX = x + width / 2;

                                        return (
                                            <g>
                                                {/* Wick */}
                                                <line
                                                    x1={centerX}
                                                    y1={highY}
                                                    x2={centerX}
                                                    y2={lowY}
                                                    stroke={color}
                                                    strokeWidth={1}
                                                />
                                                {/* Body */}
                                                <rect
                                                    x={centerX - candleWidth / 2}
                                                    y={bodyTop}
                                                    width={candleWidth}
                                                    height={bodyHeight}
                                                    fill={isUp ? color : color}
                                                    stroke={color}
                                                    strokeWidth={1}
                                                />
                                            </g>
                                        );
                                    }}
                                />
                            </>
                        )}

                        {chartType === 'bar' && (
                            <Bar
                                dataKey="high"
                                fill="transparent"
                                isAnimationActive={false}
                                shape={(props: any) => {
                                    const { x, width, payload } = props;
                                    if (!payload) return null;
                                    const { high, low, open, close } = payload;
                                    const isUp = close >= open;
                                    const color = isUp ? '#10b981' : '#ef4444';

                                    const yScale = (val: number) => {
                                        const range = maxPrice - minPrice;
                                        const chartHeight = 380;
                                        return ((maxPrice - val) / range) * chartHeight + 10;
                                    };

                                    const highY = yScale(high);
                                    const lowY = yScale(low);
                                    const openY = yScale(open);
                                    const closeY = yScale(close);
                                    const centerX = x + width / 2;
                                    const tickWidth = width * 0.3;

                                    return (
                                        <g>
                                            {/* Vertical Line */}
                                            <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={color} strokeWidth={1.5} />
                                            {/* Open Tick (Left) */}
                                            <line x1={centerX - tickWidth} y1={openY} x2={centerX} y2={openY} stroke={color} strokeWidth={1.5} />
                                            {/* Close Tick (Right) */}
                                            <line x1={centerX} y1={closeY} x2={centerX + tickWidth} y2={closeY} stroke={color} strokeWidth={1.5} />
                                        </g>
                                    );
                                }}
                            />
                        )}

                        {chartType === 'renko' && (
                            <Bar
                                dataKey="price"
                                isAnimationActive={false}
                                shape={(props: any) => {
                                    const { x, width, payload } = props;
                                    if (!payload) return null;
                                    const { price, type, brickSize } = payload;
                                    const color = type === 'up' ? '#10b981' : '#ef4444';

                                    const yScale = (val: number) => {
                                        const range = maxPrice - minPrice;
                                        const chartHeight = 380;
                                        return ((maxPrice - val) / range) * chartHeight + 10;
                                    };

                                    const priceY = yScale(price);
                                    const brickHeight = Math.abs(yScale(price) - yScale(price + (brickSize || 1)));
                                    const brickWidth = Math.max(width * 0.8, 6);
                                    const brickX = x + (width - brickWidth) / 2;

                                    return (
                                        <rect
                                            x={brickX}
                                            y={type === 'up' ? priceY - brickHeight : priceY}
                                            width={brickWidth}
                                            height={Math.max(brickHeight, 5)}
                                            fill={color}
                                            stroke={color}
                                            strokeWidth={1}
                                            rx={2}
                                        />
                                    );
                                }}
                            />
                        )}

                        {/* Moving Averages */}
                        {showMA && (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="sma20"
                                    stroke="#f59e0b"
                                    strokeWidth={1.5}
                                    dot={false}
                                    connectNulls
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sma50"
                                    stroke="#8b5cf6"
                                    strokeWidth={1.5}
                                    dot={false}
                                    connectNulls
                                    isAnimationActive={false}
                                />
                            </>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            {showVolume && chartType !== 'renko' && (
                <div className="h-[80px] mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={processedData}
                            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        >
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <Bar dataKey="volume" isAnimationActive={false}>
                                {processedData.map((entry: any, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isUp ? '#10b981' : '#ef4444'}
                                        fillOpacity={0.5}
                                    />
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default AdvancedChart;
