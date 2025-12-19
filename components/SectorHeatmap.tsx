import * as React from 'react';
import { SECTOR_DATA } from '../services/marketService';

interface SectorHeatmapProps {
    className?: string;
}

const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ className = '' }) => {
    // Sort sectors by volume for layout
    const sortedSectors = [...SECTOR_DATA].sort((a, b) => b.volume - a.volume);

    const getColorClass = (change: number) => {
        if (change >= 2) return 'bg-emerald-600';
        if (change >= 1) return 'bg-emerald-500';
        if (change >= 0.5) return 'bg-emerald-400/80';
        if (change > 0) return 'bg-emerald-400/50';
        if (change === 0) return 'bg-zinc-600';
        if (change > -0.5) return 'bg-red-400/50';
        if (change > -1) return 'bg-red-400/80';
        if (change > -2) return 'bg-red-500';
        return 'bg-red-600';
    };

    const getSize = (volume: number, maxVolume: number) => {
        const ratio = volume / maxVolume;
        if (ratio > 0.7) return 'col-span-2 row-span-2';
        if (ratio > 0.4) return 'col-span-2';
        return '';
    };

    const maxVolume = Math.max(...sortedSectors.map(s => s.volume));

    return (
        <div className={`card ${className}`}>
            <h3 className="text-lg font-semibold mb-4">Sector Performance</h3>

            <div className="grid grid-cols-4 gap-2">
                {sortedSectors.map((sector) => (
                    <div
                        key={sector.name}
                        className={`${getColorClass(sector.change)} ${getSize(sector.volume, maxVolume)} 
                       rounded-lg p-3 flex flex-col justify-between min-h-[80px] 
                       cursor-pointer transition-transform hover:scale-[1.02] hover:z-10`}
                    >
                        <div>
                            <p className="text-xs font-medium text-white/90 truncate">{sector.name}</p>
                            <p className="text-[10px] text-white/60">{sector.companies} companies</p>
                        </div>
                        <p className="text-sm font-bold text-white">
                            {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(1)}%
                        </p>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-red-600" />
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <div className="w-3 h-3 rounded-sm bg-red-400/80" />
                    </div>
                    <span className="text-xs text-muted-foreground">Bearish</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-zinc-600" />
                    <span className="text-xs text-muted-foreground">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-emerald-400/50" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-600" />
                    </div>
                    <span className="text-xs text-muted-foreground">Bullish</span>
                </div>
            </div>
        </div>
    );
};

export default SectorHeatmap;
