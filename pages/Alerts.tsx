import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Bell, Plus, Edit2, Trash2, X,
    TrendingUp, TrendingDown, Mail, BellOff,
    CheckCircle, AlertCircle, Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MOCK_STOCKS } from '../services/marketService';
import { getAlerts, createAlert, updateAlert, deleteAlert, DBAlert } from '../services/supabaseService';
import toast, { Toaster } from 'react-hot-toast';

interface AlertsProps {
    userId?: string;
}

const Alerts: React.FC<AlertsProps> = ({ userId = 'demo-user' }) => {
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState<DBAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState<DBAlert | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        ticker: MOCK_STOCKS[0].ticker,
        condition: 'above' as 'above' | 'below',
        target_price: 100,
        is_active: true,
        email_notify: false,
    });

    useEffect(() => {
        loadAlerts();
    }, [userId]);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await getAlerts(userId);
            setAlerts(data);
        } catch (error) {
            console.error('Error loading alerts:', error);
            toast.error('Failed to load alerts');
        }
        setLoading(false);
    };

    const handleOpenModal = (alert?: DBAlert) => {
        if (alert) {
            setEditingAlert(alert);
            setFormData({
                ticker: alert.ticker,
                condition: alert.condition,
                target_price: alert.target_price,
                is_active: alert.is_active,
                email_notify: alert.email_notify,
            });
        } else {
            setEditingAlert(null);
            setFormData({
                ticker: MOCK_STOCKS[0].ticker,
                condition: 'above',
                target_price: MOCK_STOCKS[0].price,
                is_active: true,
                email_notify: false,
            });
        }
        setShowModal(true);
    };

    const handleSaveAlert = async () => {
        if (editingAlert) {
            // Update existing alert
            const success = await updateAlert(editingAlert.id, {
                ticker: formData.ticker,
                condition: formData.condition,
                target_price: formData.target_price,
                is_active: formData.is_active,
                email_notify: formData.email_notify,
            }, userId);

            if (success) {
                toast.success('Alert updated successfully');
            } else {
                toast.error('Failed to update alert');
            }
        } else {
            // Create new alert
            const alert = await createAlert({
                user_id: userId,
                ticker: formData.ticker,
                condition: formData.condition,
                target_price: formData.target_price,
                is_active: formData.is_active,
                email_notify: formData.email_notify,
            });

            if (alert) {
                toast.success('Alert created successfully');
            } else {
                toast.error('Failed to create alert');
            }
        }

        setShowModal(false);
        loadAlerts();
    };

    const handleDeleteAlert = async (alertId: string) => {
        if (confirm('Are you sure you want to delete this alert?')) {
            const success = await deleteAlert(alertId, userId);
            if (success) {
                toast.success('Alert deleted');
                loadAlerts();
            } else {
                toast.error('Failed to delete alert');
            }
        }
    };

    const handleToggleActive = async (alert: DBAlert) => {
        const success = await updateAlert(alert.id, { is_active: !alert.is_active }, userId);
        if (success) {
            toast.success(alert.is_active ? 'Alert paused' : 'Alert activated');
            loadAlerts();
        }
    };

    const handleToggleEmail = async (alert: DBAlert) => {
        const success = await updateAlert(alert.id, { email_notify: !alert.email_notify }, userId);
        if (success) {
            toast.success(alert.email_notify ? 'Email notifications disabled' : 'Email notifications enabled');
            loadAlerts();
        }
    };

    // Check if any alerts are triggered
    const checkTriggeredAlerts = () => {
        alerts.forEach(alert => {
            if (!alert.is_active) return;

            const stock = MOCK_STOCKS.find(s => s.ticker === alert.ticker);
            if (!stock) return;

            const isTriggered = alert.condition === 'above'
                ? stock.price >= alert.target_price
                : stock.price <= alert.target_price;

            if (isTriggered && !alert.triggered_at) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-card border border-primary shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <Bell className="h-10 w-10 text-primary" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Alert Triggered: {alert.ticker}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Price {alert.condition === 'above' ? 'rose above' : 'fell below'} ৳{alert.target_price}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ), { duration: 5000 });

                // Mark as triggered
                updateAlert(alert.id, { triggered_at: new Date().toISOString(), is_active: false }, userId);
            }
        });
    };

    useEffect(() => {
        const interval = setInterval(checkTriggeredAlerts, 10000);
        return () => clearInterval(interval);
    }, [alerts]);

    const filteredStocks = MOCK_STOCKS.filter(s =>
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStockPrice = (ticker: string): number => {
        return MOCK_STOCKS.find(s => s.ticker === ticker)?.price || 0;
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Bell className="w-8 h-8 text-primary" />
                        {t('alerts.title', 'Price Alerts')}
                    </h1>
                    <p className="text-muted-foreground mt-1">Get notified when stocks reach your target prices</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {t('alerts.createAlert', 'Create Alert')}
                </button>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{t('alerts.noAlerts', 'No alerts created yet')}</h3>
                    <p className="text-muted-foreground mb-4">Create an alert to be notified when a stock reaches your target price</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Create Your First Alert
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {alerts.map((alert) => {
                        const currentPrice = getStockPrice(alert.ticker);
                        const priceDiff = alert.condition === 'above'
                            ? alert.target_price - currentPrice
                            : currentPrice - alert.target_price;
                        const percentAway = (priceDiff / currentPrice) * 100;

                        return (
                            <div
                                key={alert.id}
                                className={`bg-card border rounded-xl p-4 transition-all ${alert.triggered_at ? 'border-amber-500/50 bg-amber-500/5' :
                                    alert.is_active ? 'border-border hover:border-primary/50' : 'border-border opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Stock Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alert.condition === 'above' ? 'bg-green-500/10' : 'bg-red-500/10'
                                            }`}>
                                            {alert.condition === 'above'
                                                ? <TrendingUp className="w-6 h-6 text-green-500" />
                                                : <TrendingDown className="w-6 h-6 text-red-500" />
                                            }
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg">{alert.ticker}</span>
                                                {alert.triggered_at && (
                                                    <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-500 font-medium">
                                                        TRIGGERED
                                                    </span>
                                                )}
                                                {!alert.is_active && !alert.triggered_at && (
                                                    <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground font-medium">
                                                        PAUSED
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {alert.condition === 'above' ? 'Price rises above' : 'Price falls below'}{' '}
                                                <span className="font-mono font-medium text-foreground">৳{alert.target_price.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price Info */}
                                    <div className="text-right mr-4">
                                        <p className="text-sm text-muted-foreground">Current Price</p>
                                        <p className="font-mono font-bold">৳{currentPrice.toFixed(2)}</p>
                                        <p className={`text-xs ${percentAway > 0 ? 'text-muted-foreground' : 'text-green-500'}`}>
                                            {percentAway > 0 ? `${percentAway.toFixed(1)}% away` : 'Target reached!'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleEmail(alert)}
                                            className={`p-2 rounded-lg transition-colors ${alert.email_notify
                                                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                                                }`}
                                            title={alert.email_notify ? 'Email notifications on' : 'Email notifications off'}
                                        >
                                            {alert.email_notify ? <Mail className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                        </button>

                                        <button
                                            onClick={() => handleToggleActive(alert)}
                                            className={`p-2 rounded-lg transition-colors ${alert.is_active
                                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                                                }`}
                                            title={alert.is_active ? 'Active' : 'Paused'}
                                        >
                                            {alert.is_active ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        </button>

                                        <button
                                            onClick={() => handleOpenModal(alert)}
                                            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteAlert(alert.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Alert Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-bold">
                                {editingAlert ? t('alerts.editAlert', 'Edit Alert') : t('alerts.createAlert', 'Create Alert')}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Stock Selection */}
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">{t('alerts.stock', 'Stock')}</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search stocks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm"
                                    />
                                </div>
                                <div className="mt-2 max-h-32 overflow-y-auto bg-secondary/50 rounded-lg">
                                    {filteredStocks.slice(0, 8).map(stock => (
                                        <button
                                            key={stock.ticker}
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, ticker: stock.ticker, target_price: stock.price }));
                                                setSearchQuery('');
                                            }}
                                            className={`w-full flex items-center justify-between p-2 text-sm hover:bg-secondary transition-colors ${formData.ticker === stock.ticker ? 'bg-primary/10 text-primary' : ''
                                                }`}
                                        >
                                            <span className="font-medium">{stock.ticker}</span>
                                            <span className="text-muted-foreground">৳{stock.price.toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">{t('alerts.condition', 'Condition')}</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, condition: 'above' }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${formData.condition === 'above'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        {t('alerts.above', 'Price Above')}
                                    </button>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, condition: 'below' }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${formData.condition === 'below'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <TrendingDown className="w-4 h-4" />
                                        {t('alerts.below', 'Price Below')}
                                    </button>
                                </div>
                            </div>

                            {/* Target Price */}
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">{t('alerts.targetPrice', 'Target Price')} (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.target_price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, target_price: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-lg font-mono"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Current price: ৳{getStockPrice(formData.ticker).toFixed(2)}
                                </p>
                            </div>

                            {/* Email Notification Toggle */}
                            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{t('alerts.emailNotify', 'Email Notification')}</p>
                                        <p className="text-xs text-muted-foreground">Get notified via email when triggered</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, email_notify: !prev.email_notify }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.email_notify ? 'bg-primary' : 'bg-muted'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${formData.email_notify ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 px-4 rounded-lg bg-secondary text-foreground font-medium hover:bg-accent transition-colors"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={handleSaveAlert}
                                className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                            >
                                {editingAlert ? t('common.save', 'Save') : t('alerts.createAlert', 'Create Alert')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alerts;
