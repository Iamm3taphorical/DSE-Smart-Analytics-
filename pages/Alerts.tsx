import * as React from 'react';
import { useState } from 'react';
import { Bell, Plus as PlusIcon, Trash2, BellRing } from 'lucide-react';

const Alerts: React.FC = () => {
    console.log("Alerts: Rendering Price Alerts page...");
    const [alerts, setAlerts] = useState([
        { id: 1, symbol: 'BRACBANK', condition: 'Above', price: 60.00, active: true },
        { id: 2, symbol: 'SQURPHARMA', condition: 'Below', price: 210.50, active: true },
        { id: 3, symbol: 'GP', condition: 'Above', price: 300.00, active: false }
    ]);

    const deleteAlert = (id: number) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const toggleAlert = (id: number) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    };

    const addAlert = () => {
        const newAlert = {
            id: Date.now(),
            symbol: 'BATBC',
            condition: 'Above',
            price: 520.00,
            active: true
        };
        setAlerts(prev => [newAlert, ...prev]);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Price Alerts</h1>
                    <p className="text-muted-foreground">Manage your real-time notifications for market movements.</p>
                </div>
                <button
                    onClick={addAlert}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Create Alert
                </button>
            </div>

            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert.id} className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${alert.active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                <BellRing className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{alert.symbol}</h3>
                                <p className="text-sm text-muted-foreground">Alert when price goes <span className="font-semibold text-foreground">{alert.condition} ৳{alert.price.toFixed(2)}</span></p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={alert.active}
                                    onChange={() => toggleAlert(alert.id)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                            <button
                                onClick={() => deleteAlert(alert.id)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No alerts configured</h3>
                        <p className="text-muted-foreground">Set up your first price alert to stay ahead of the market.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
