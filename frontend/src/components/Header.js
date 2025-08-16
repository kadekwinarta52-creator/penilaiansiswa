import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Sistem Penilaian</h2>
          <p className="text-sm text-gray-600">Kelola nilai siswa dengan mudah</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Admin Guru</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;