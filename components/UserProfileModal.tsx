import * as React from 'react';
import { useState } from 'react';
import { X, User, Phone, Mail, Camera, Star, Eye, Globe, Palette, Upload, Link as LinkIcon, Check } from 'lucide-react';
import { useUserProfile, AVATAR_OPTIONS } from '../context/UserProfileContext';
import { UserProfile } from '../types';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { profile, updateProfile } = useUserProfile();

    const [formData, setFormData] = useState({
        name: profile?.name || '',
        phone: profile?.phone || '',
        gender: profile?.gender || 'prefer-not-to-say',
        avatar: profile?.avatar || AVATAR_OPTIONS[0],
        preferredLanguage: profile?.preferredLanguage || 'en',
    });

    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [customAvatarUrl, setCustomAvatarUrl] = useState('');

    // Update form when profile changes
    React.useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                phone: profile.phone || '',
                gender: profile.gender || 'prefer-not-to-say',
                avatar: profile.avatar,
                preferredLanguage: profile.preferredLanguage,
            });
        }
    }, [profile]);

    if (!isOpen || !profile) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({
            name: formData.name,
            phone: formData.phone || undefined,
            gender: formData.gender as UserProfile['gender'],
            avatar: formData.avatar,
            preferredLanguage: formData.preferredLanguage as 'en' | 'bn',
        });
        onClose();
    };

    const handleCustomAvatarSubmit = () => {
        if (customAvatarUrl) {
            setFormData(prev => ({ ...prev, avatar: customAvatarUrl }));
            setCustomAvatarUrl('');
            setShowAvatarPicker(false);
        }
    };

    const genderOptions: { value: 'male' | 'female' | 'other' | 'prefer-not-to-say'; label: string }[] = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-5 duration-300 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 p-8 text-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

                    {/* Avatar */}
                    <div className="relative inline-block">
                        <div className="w-24 h-24 rounded-full border-4 border-primary/30 overflow-hidden bg-secondary mx-auto">
                            <img
                                src={formData.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mt-4">Edit Profile</h2>
                    <p className="text-muted-foreground text-sm">{profile.email}</p>
                </div>

                {/* Avatar Picker */}
                {showAvatarPicker && (
                    <div className="p-4 border-b border-border bg-secondary/30">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium">Choose Avatar</p>
                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {AVATAR_OPTIONS.map((avatar, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, avatar }));
                                        setShowAvatarPicker(false);
                                    }}
                                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${formData.avatar === avatar
                                        ? 'border-primary scale-110'
                                        : 'border-transparent hover:border-muted-foreground'
                                        }`}
                                >
                                    <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full" />
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <label className="text-xs text-muted-foreground mb-1 block">Or use custom URL:</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={customAvatarUrl}
                                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCustomAvatarSubmit}
                                    disabled={!customAvatarUrl}
                                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Your name"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="+880 1XXX-XXXXXX"
                        />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Gender</label>
                        <div className="grid grid-cols-2 gap-2">
                            {genderOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.gender === option.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Preferred Language
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, preferredLanguage: 'en' }))}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.preferredLanguage === 'en'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                                    }`}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, preferredLanguage: 'bn' }))}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.preferredLanguage === 'bn'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                                    }`}
                            >
                                বাংলা
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                            <Eye className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-lg font-bold">{profile.watchlist.length}</p>
                                <p className="text-xs text-muted-foreground">Watchlist</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <div>
                                <p className="text-lg font-bold">{profile.favorites.length}</p>
                                <p className="text-xs text-muted-foreground">Favorites</p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-lg bg-secondary text-foreground font-medium hover:bg-accent transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 bg-secondary/30 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Member since {profile.createdAt.toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
