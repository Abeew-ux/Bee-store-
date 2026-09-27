import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProfileHeader, ProfileTab } from './profile/ProfileHeader';
import { ProfileAccountTab } from './profile/ProfileAccountTab';
import { ProfilePaymentsTab } from './profile/ProfilePaymentsTab';
import { ProfileVendorTab } from './profile/ProfileVendorTab';
import { ProfileSettingsTab } from './profile/ProfileSettingsTab';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode, orders, currentUser, deliveryAddress, currentVendorShop } = useStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('compte');

  if (!isOpen) return null;

  const myOrdersCount = orders.filter(
    (o) =>
      o.customer.phone === (currentUser?.phone || deliveryAddress.phone) ||
      (currentVendorShop && (o.shopId === currentVendorShop.id || o.shopName === currentVendorShop.name))
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border z-10 overflow-hidden max-h-[92dvh] flex flex-col transition-all ${
          isDarkMode
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 🖼️ HEADER WITH COVER PHOTO AT THE VERY TOP & NAVIGATION TABS */}
        <ProfileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
          ordersCount={myOrdersCount}
        />

        {/* 📄 STRUCTURED CONTENT BODY BY CATEGORY */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 scrollbar-none">
          {activeTab === 'compte' && (
            <ProfileAccountTab onClose={onClose} myOrdersCount={myOrdersCount} />
          )}

          {activeTab === 'paiements' && <ProfilePaymentsTab />}

          {activeTab === 'boutique' && <ProfileVendorTab onClose={onClose} />}

          {activeTab === 'reglages' && <ProfileSettingsTab onClose={onClose} />}
        </div>
      </div>
    </div>
  );
};
