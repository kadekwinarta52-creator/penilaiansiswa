import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserGroupIcon, BookOpenIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalObjectives: 0,
    totalClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [studentsRes, subjectsRes, objectivesRes, classesRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/subjects`),
        axios.get(`${API}/learning-objectives`),
        axios.get(`${API}/students/classes/list`)
      ]);

      setStats({
        totalStudents: studentsRes.data.length,
        totalSubjects: subjectsRes.data.length,
        totalObjectives: objectivesRes.data.length,
        totalClasses: classesRes.data.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0`}>
          <Icon className={`h-8 w-8 text-gray-600`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-3xl font-semibold text-gray-900">
              {loading ? '...' : value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang di Aplikasi Penilaian Guru</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserGroupIcon}
          title="Total Siswa"
          value={stats.totalStudents}
          color="border-blue-500"
        />
        <StatCard
          icon={BookOpenIcon}
          title="Total Mata Pelajaran"
          value={stats.totalSubjects}
          color="border-green-500"
        />
        <StatCard
          icon={ClipboardDocumentListIcon}
          title="Total Tujuan Pembelajaran"
          value={stats.totalObjectives}
          color="border-yellow-500"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Total Kelas"
          value={stats.totalClasses}
          color="border-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Tambah Siswa Baru
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
            Buat Mata Pelajaran
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors">
            Input Nilai
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
            Lihat Rekapan
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terkini</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            Sistem siap digunakan
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            Database terhubung dengan sukses
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
            Siap menerima data siswa dan nilai
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;