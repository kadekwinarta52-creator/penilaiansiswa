import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserGroupIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GradeReport = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API}/students/classes/list`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Gagal mengambil data kelas');
    }
  };

  const fetchGradeReport = async () => {
    if (!selectedClass) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API}/reports/grades/${selectedClass}`);
      setReportData(response.data);
      setShowReport(true);
    } catch (error) {
      console.error('Error fetching grade report:', error);
      alert('Gagal mengambil rekapan nilai');
      setReportData([]);
      setShowReport(false);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!selectedClass) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    try {
      setExporting(true);
      const response = await axios.get(`${API}/reports/grades/${selectedClass}/export`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nilai_kelas_${selectedClass}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('File Excel berhasil diunduh');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor ke Excel');
    } finally {
      setExporting(false);
    }
  };

  const getGradeColor = (average) => {
    if (average >= 85) return 'text-green-600';
    if (average >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeStatus = (average) => {
    if (average >= 85) return 'Sangat Baik';
    if (average >= 70) return 'Baik';
    if (average >= 60) return 'Cukup';
    return 'Perlu Perbaikan';
  };

  // Group grades by subject and objective
  const getGroupedGrades = () => {
    if (reportData.length === 0) return {};
    
    const grouped = {};
    
    reportData.forEach(studentData => {
      studentData.grades.forEach(grade => {
        const key = `${grade.subject} - ${grade.objective}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push({
          student: studentData.student.nama,
          nilai: grade.nilai
        });
      });
    });
    
    return grouped;
  };

  const calculateStats = () => {
    if (reportData.length === 0) return null;
    
    const allAverages = reportData
      .map(student => student.average)
      .filter(avg => avg > 0);
    
    if (allAverages.length === 0) return null;
    
    const classAverage = allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length;
    const highest = Math.max(...allAverages);
    const lowest = Math.min(...allAverages);
    
    return {
      classAverage: classAverage.toFixed(2),
      highest: highest.toFixed(2),
      lowest: lowest.toFixed(2),
      totalStudents: reportData.length,
      studentsWithGrades: allAverages.length
    };
  };

  const stats = calculateStats();
  const groupedGrades = getGroupedGrades();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rekapan Nilai</h1>
        <p className="text-gray-600 mt-2">Lihat dan ekspor rekapan nilai siswa per kelas</p>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Pilih Kelas untuk Rekapan</h3>
        
        <div className="flex space-x-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setShowReport(false);
                setReportData([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kelas</option>
              {classes.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={fetchGradeReport}
            disabled={!selectedClass || loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white font-medium ${
              !selectedClass || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
            <span>{loading ? 'Memuat...' : 'Tampilkan Nilai'}</span>
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={!selectedClass || exporting || !showReport}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white font-medium ${
              !selectedClass || exporting || !showReport
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <DocumentArrowDownIcon className="h-4 w-4" />
            )}
            <span>{exporting ? 'Mengekspor...' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {showReport && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Kelas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.classAverage}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">↑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nilai Tertinggi</p>
                <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">↓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nilai Terendah</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Report Table */}
      {showReport && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Rekapan Nilai Kelas {selectedClass}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Menampilkan semua nilai berdasarkan tujuan pembelajaran
            </p>
          </div>

          {reportData.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Tidak ada data nilai untuk kelas ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                    {Object.keys(groupedGrades).map((subjectObjective) => (
                      <th key={subjectObjective} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        {subjectObjective}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((studentData, index) => (
                    <tr key={studentData.student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {studentData.student.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {studentData.student.nis}
                      </td>
                      
                      {/* Grade columns */}
                      {Object.keys(groupedGrades).map((subjectObjective) => {
                        const grade = studentData.grades.find(g => 
                          `${g.subject} - ${g.objective}` === subjectObjective
                        );
                        return (
                          <td key={subjectObjective} className="px-4 py-4 whitespace-nowrap text-center text-sm">
                            {grade && grade.nilai !== null ? (
                              <span className={`font-medium ${getGradeColor(grade.nilai)}`}>
                                {grade.nilai}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {studentData.average > 0 ? (
                          <span className={`font-bold ${getGradeColor(studentData.average)}`}>
                            {studentData.average}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {studentData.average > 0 ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            studentData.average >= 85
                              ? 'bg-green-100 text-green-800'
                              : studentData.average >= 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getGradeStatus(studentData.average)}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Belum Ada Nilai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportData.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                <p>Total siswa: {reportData.length} | 
                   Sudah memiliki nilai: {reportData.filter(s => s.average > 0).length} |
                   Belum memiliki nilai: {reportData.filter(s => s.average === 0).length}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!showReport && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Petunjuk Penggunaan</h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Pilih kelas yang ingin dilihat rekapan nilainya</p>
            <p>2. Klik tombol "Tampilkan Nilai" untuk menampilkan rekapan</p>
            <p>3. Lihat statistik kelas dan detail nilai per siswa</p>
            <p>4. Klik "Export Excel" untuk mengunduh rekapan dalam format Excel</p>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Catatan:</strong> Rekapan akan menampilkan semua nilai berdasarkan tujuan pembelajaran 
              yang sudah dikonfigurasi dan sudah diinput nilainya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeReport;