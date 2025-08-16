import React from 'react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  PencilIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'students', name: 'Manajemen Siswa', icon: UserGroupIcon },
    { id: 'subjects', name: 'Mata Pelajaran', icon: BookOpenIcon },
    { id: 'grades', name: 'Input Nilai', icon: PencilIcon },
    { id: 'reports', name: 'Rekapan Nilai', icon: ChartBarIcon },
  ];

  return (
    <div className="bg-blue-900 text-white w-64 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-center">Aplikasi Penilaian Guru</h1>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-800 transition-colors ${
                activeMenu === item.id ? 'bg-blue-800 border-r-4 border-blue-300' : ''
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;