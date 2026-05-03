import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Bell, Shield, Palette, User, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      setProfile(snap.data());
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const updateSettings = async (key: string, value: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`settings.${key}`]: value
      });
      setProfile({ ...profile, settings: { ...profile.settings, [key]: value } });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  const sections = [
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        { label: 'Notifications', description: 'Enable real-time task alerts', type: 'toggle', key: 'notificationsEnabled' },
        { label: 'Dark Mode', description: 'Switch to a darker interface', type: 'toggle', key: 'darkMode' },
      ]
    },
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Language', description: 'Select your preferred language', type: 'select', options: ['English', 'Spanish', 'French'], key: 'language' },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 uppercase">Settings</h1>
        <p className="text-gray-500">Configure your personal experience and notification preferences.</p>
      </header>

      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <section.icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{section.title}</h2>
            </div>

            <div className="space-y-6">
              {section.items.map(item => (
                <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-4 px-4 transition-colors rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  {item.type === 'toggle' ? (
                    <button 
                      onClick={() => updateSettings(item.key, !profile.settings?.[item.key])}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300",
                        profile.settings?.[item.key] ? "bg-indigo-600" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                        profile.settings?.[item.key] ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  ) : (
                    <select 
                      className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => updateSettings(item.key, e.target.value)}
                      value={profile.settings?.[item.key] || 'English'}
                    >
                      {item.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
