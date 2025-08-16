import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GradeInput = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedClass) {
      fetchObjectives();
    } else {
      setObjectives([]);
      setSelectedObjective('');
    }
  }, [selectedSubject, selectedClass]);

  useEffect(() => {
    if (selectedSubject && selectedClass && selectedObjective) {
      fetchStudentsAndGrades();
    } else {
      setStudents([]);
      setGrades({});
      setStudentsLoaded(false);
    }
  }, [selectedSubject, selectedClass, selectedObjective]);

  const fetchInitialData = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        axios.get(`${API}/subjects`),
        axios.get(`${API}/students/classes/list`)
      ]);

      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      alert('Gagal mengambil data');
    }
  };

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/grades/objectives/${selectedSubject}/${selectedClass}`);
      setObjectives(response.data);
    } catch (error) {
      console.error('Error fetching objectives:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API}/grades/${selectedSubject}/${selectedClass}/${selectedObjective}`
      );
      
      const studentsData = response.data;
      setStudents(studentsData);
      
      // Build grades object
      const gradesObj = {};
      studentsData.forEach(item => {
        gradesObj[item.student.id] = item.grade ? item.grade.nilai.toString() : '';
      });
      setGrades(gradesObj);
      setStudentsLoaded(true);
    } catch (error) {
      console.error('Error fetching students and grades:', error);
      alert('Gagal mengambil data siswa dan nilai');
      setStudents([]);
      setGrades({});
      setStudentsLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, value) => {
    // Validate input - only allow numbers 0-100
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setGrades({
        ...grades,
        [studentId]: value
      });
    }
  };

  const saveGrades = async () => {
    try {
      setSaving(true);
      const promises = [];
      
      for (const studentId in grades) {
        const nilai = grades[studentId];
        if (nilai !== '' && !isNaN(parseFloat(nilai))) {
          const gradeData = {
            student_id: studentId,
            subject_id: selectedSubject,
            kelas: selectedClass,
            learning_objective_id: selectedObjective,
            nilai: parseFloat(nilai)
          };
          
          promises.push(axios.post(`${API}/grades`, gradeData));
        }
      }
      
      await Promise.all(promises);
      alert('Nilai berhasil disimpan');
      
      // Refresh data
      await fetchStudentsAndGrades();
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Gagal menyimpan nilai');
    } finally {
      setSaving(false);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.nama_mata_pelajaran : '';
  };

  const getObjectiveName = (objectiveId) => {
    const objective = objectives.find(o => o.id === objectiveId);
    return objective ? objective.tujuan_pembelajaran : '';
  };

  const hasUnsavedChanges = () => {
    return Object.values(grades).some(grade => grade !== '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Input Nilai</h1>
        <p className="text-gray-600 mt-2">Input dan kelola nilai siswa berdasarkan tujuan pembelajaran</p>
      </div>

      {/* Selection Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Pilih Kriteria Penilaian</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpenIcon className="h-4 w-4 inline mr-1" />
              Mata Pelajaran
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedClass('');
                setSelectedObjective('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Mata Pelajaran</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nama_mata_pelajaran}
                </option>
              ))}
            </select>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedObjective('');
              }}
              disabled={!selectedSubject}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Pilih Kelas</option>
              {classes.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>

          {/* Objective Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClipboardDocumentListIcon className="h-4 w-4 inline mr-1" />
              Tujuan Pembelajaran
            </label>
            <select
              value={selectedObjective}
              onChange={(e) => setSelectedObjective(e.target.value)}
              disabled={!selectedSubject || !selectedClass || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Pilih Tujuan Pembelajaran</option>
              {objectives.map((objective) => (
                <option key={objective.id} value={objective.id}>
                  {objective.tujuan_pembelajaran}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        )}
      </div>

      {/* Students Grade Input */}
      {studentsLoaded && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Input Nilai Siswa</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getSubjectName(selectedSubject)} - Kelas {selectedClass}
                </p>
                <p className="text-sm text-gray-500">
                  Tujuan: {getObjectiveName(selectedObjective)}
                </p>
              </div>
              
              <button
                onClick={saveGrades}
                disabled={saving || !hasUnsavedChanges()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white font-medium ${
                  saving || !hasUnsavedChanges()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                <span>{saving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai (0-100)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada siswa di kelas ini atau konfigurasi belum dibuat
                    </td>
                  </tr>
                ) : (
                  students.map((studentData, index) => {
                    const student = studentData.student;
                    const currentGrade = grades[student.id] || '';
                    const hasExistingGrade = studentData.grade !== null;
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.nama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.nis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentGrade}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasExistingGrade ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Sudah Dinilai
                            </span>
                          ) : currentGrade ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Belum Disimpan
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Belum Ada Nilai
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {students.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Siswa: {students.length}</span>
                <span>
                  Sudah Dinilai: {students.filter(s => s.grade !== null).length} | 
                  Belum Dinilai: {students.filter(s => s.grade === null).length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!studentsLoaded && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Petunjuk Penggunaan</h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Pilih mata pelajaran yang akan dinilai</p>
            <p>2. Pilih kelas yang sesuai</p>
            <p>3. Pilih tujuan pembelajaran yang akan dinilai</p>
            <p>4. Masukkan nilai siswa (rentang 0-100)</p>
            <p>5. Klik tombol "Simpan Nilai" untuk menyimpan</p>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Catatan:</strong> Pastikan sudah ada konfigurasi mata pelajaran untuk kelas yang dipilih 
              di menu "Mata Pelajaran > Pengkategorian"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeInput;