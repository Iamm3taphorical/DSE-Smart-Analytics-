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

// Custom Candlestick Component
const CandlestickShape = (props: any) => {
    const { x, y, width, height, payload, yAxisMap } = props;
    if (!payload || !yAxisMap) return null;

    const { open, high, low, close } = payload;
    const yScale = yAxisMap[0];
    if (!yScale) return null;

    const isBullish = close >= open;
    const color = isBullish ? '#10b981' : '#ef4444';

    const candleWidth = Math.max(width * 0.6, 4);
    const candleX = x + (width - candleWidth) / 2;

    const openY = yScale.scale(open);
    const closeY = yScale.scale(close);
    const highY = yScale.scale(high);
    const lowY = yScale.scale(low);

    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY) || 1;

    return (
        <g>
            {/* Wick */}
            <line
                x1={x + width / 2}
                y1={highY}
                x2={x + width / 2}
                y2={lowY}
                stroke={color}
                strokeWidth={1}
            />
            {/* Body */}
            <rect
                x={candleX}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isBullish ? color : color}
                stroke={color}
                strokeWidth={1}
            />
        </g>
    );
};

// Custom Bar (OHLC) Shape
const OHLCBarShape = (props: any) => {
    const { x, y, width, height, payload, yAxisMap } = props;
    if (!payload || !yAxisMap) return null;

    const { open, high, low, close } = payload;
    const yScale = yAxisMap[0];
    if (!yScale) return null;

    const isBullish = close >= open;
    const color = isBullish ? '#10b981' : '#ef4444';

    const centerX = x + width / 2;
    const tickWidth = width * 0.3;

    const openY = yScale.scale(open);
    const closeY = yScale.scale(close);
    const highY = yScale.scale(high);
    const lowY = yScale.scale(low);

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
};

// Renko Bar Shape
const RenkoShape = (props: any) => {
    const { x, width, payload, yAxisMap } = props;
    if (!payload || !yAxisMap) return null;

    const yScale = yAxisMap[0];
    if (!yScale) return null;

    const { type, price, brickSize } = payload;
    const color = type === 'up' ? '#10b981' : '#ef4444';

    const brickWidth = Math.max(width * 0.8, 6);
    const brickX = x + (width - brickWidth) / 2;

    const priceY = yScale.scale(price);
    const brickHeight = Math.abs(yScale.scale(price) - yScale.scale(price + (brickSize || 1)));

    return (
        <rect
            x={brickX}
            y={type === 'up' ? priceY - brickHeight : priceY}
            width={brickWidth}
            height={brickHeight || 10}
            fill={color}
            stroke={color}
            strokeWidth={1}
            rx={2}
        />
    );
};

const AdvancedChart: React.FC<AdvancedChartProps> = ({
    data,
    chartType,
    showMA = false,
    showFibonacci = false,
    showVolume = true
}) => {
    // Process data based on chart type
    const processedData = useMemo(() => {
        switch (chartType) {
            case 'heikin-ashi': {
                const result = calculateHeikinAshi(data);
                return result.candles;
            }
            case 'renko': {
                const result = generateRenko(data);
                return result.bricks.map((brick, i) => ({
                    ...brick,
                    index: i,
                    brickSize: result.brickSize,
                }));
            }
            default:
                return data;
        }
    }, [data, chartType]);

    // Calculate moving averages if enabled
    const maData = useMemo(() => {
        if (!showMA || data.length < 20) return null;
        return analyzeMovingAverages(data);
    }, [data, showMA]);

    // Calculate Fibonacci levels if enabled
    const fibData = useMemo(() => {
        if (!showFibonacci || data.length < 10) return null;
        return analyzeFibonacci(data);
    }, [data, showFibonacci]);

    const minPrice = Math.min(...data.map(d => d.low)) * 0.98;
    const maxPrice = Math.max(...data.map(d => d.high)) * 1.02;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const d = payload[0]?.payload;
        if (!d) return null;

        if (chartType === 'renko') {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                    <p className="text-xs text-muted-foreground mb-1">{d.date}</p>
                    <p className={`font-bold ${d.type === 'up' ? 'text-bullish' : 'text-bearish'}`}>
                        {d.type === 'up' ? '▲ Up Brick' : '▼ Down Brick'}
                    </p>
                    <p className="text-sm">Price: ৳{d.price?.toFixed(2)}</p>
                </div>
            );
        }

        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                <p className="text-xs text-muted-foreground mb-2">{d.date}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Open:</span>
                    <span className="font-mono">৳{d.open?.toFixed(2)}</span>
                    <span className="text-muted-foreground">High:</span>
                    <span className="font-mono text-bullish">৳{d.high?.toFixed(2)}</span>
                    <span className="text-muted-foreground">Low:</span>
                    <span className="font-mono text-bearish">৳{d.low?.toFixed(2)}</span>
                    <span className="text-muted-foreground">Close:</span>
                    <span className={`font-mono font-bold ${d.close >= d.open ? 'text-bullish' : 'text-bearish'}`}>
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

    const renderChartContent = () => {
        switch (chartType) {
            case 'candlestick':
            case 'heikin-ashi':
                return (
                    <Bar
                        dataKey="close"
                        shape={<CandlestickShape />}
                        isAnimationActive={false}
                    />
                );
            case 'bar':
                return (
                    <Bar
                        dataKey="close"
                        shape={<OHLCBarShape />}
                        isAnimationActive={false}
                    />
                );
            case 'renko':
                return (
                    <Bar
                        dataKey="price"
                        shape={<RenkoShape />}
                        isAnimationActive={false}
                    />
                );
            case 'area':
            default:
                return (
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorClose)"
                    />
                );
        }
    };

    return (
        <div className="w-full">
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={processedData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

                        <XAxis
                            dataKey="date"
                            stroke="#52525b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (!value) return '';
                                const d = new Date(value);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                        />

                        <YAxis
                            yAxisId={0}
                            stroke="#52525b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={chartType === 'renko' ? ['auto', 'auto'] : [minPrice, maxPrice]}
                            tickFormatter={(value) => `৳${value.toFixed(0)}`}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Fibonacci Reference Lines */}
                        {fibData && showFibonacci && fibData.levels.map((level, i) => (
                            <ReferenceLine
                                key={i}
                                yAxisId={0}
                                y={level.price}
                                stroke={i === 3 ? '#f59e0b' : '#6366f1'}
                                strokeDasharray={i === 3 ? "none" : "5 5"}
                                strokeWidth={i === 3 ? 2 : 1}
                                label={{
                                    value: level.level,
                                    position: 'right',
                                    fill: '#a1a1aa',
                                    fontSize: 10,
                                }}
                            />
                        ))}

                        {/* Moving Averages */}
                        {maData && showMA && (
                            <>
                                <Line
                                    yAxisId={0}
                                    type="monotone"
                                    dataKey={() => maData.sma20}
                                    stroke="#f59e0b"
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="SMA 20"
                                />
                                <Line
                                    yAxisId={0}
                                    type="monotone"
                                    dataKey={() => maData.sma50}
                                    stroke="#8b5cf6"
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="SMA 50"
                                />
                            </>
                        )}

                        {renderChartContent()}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            {showVolume && chartType !== 'renko' && (
                <div className="h-[80px] mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={processedData as OHLCDataPoint[]}
                            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                        >
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <Bar
                                dataKey="volume"
                                fill="#3b82f6"
                                opacity={0.5}
                                isAnimationActive={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default AdvancedChart;
