import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusIcon, 
  BookOpenIcon,
  PencilIcon, 
  TrashIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubjectManagement = () => {
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects', 'objectives', 'configurations'
  const [subjects, setSubjects] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Subject form state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState('add');
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ nama_mata_pelajaran: '' });
  
  // Objective form state
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [objectiveModalMode, setObjectiveModalMode] = useState('add');
  const [editingObjective, setEditingObjective] = useState(null);
  const [objectiveForm, setObjectiveForm] = useState({ tujuan_pembelajaran: '' });
  
  // Configuration form state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configModalMode, setConfigModalMode] = useState('add');
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    subject_id: '',
    kelas: '',
    learning_objective_ids: []
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, objectivesRes, configurationsRes, classesRes] = await Promise.all([
        axios.get(`${API}/subjects`),
        axios.get(`${API}/learning-objectives`),
        axios.get(`${API}/subject-class-objectives`),
        axios.get(`${API}/students/classes/list`)
      ]);

      setSubjects(subjectsRes.data);
      setObjectives(objectivesRes.data);
      setConfigurations(configurationsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  // Subject Management Functions
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (subjectModalMode === 'add') {
        await axios.post(`${API}/subjects`, subjectForm);
        alert('Mata pelajaran berhasil ditambahkan');
      } else {
        await axios.put(`${API}/subjects/${editingSubject.id}`, subjectForm);
        alert('Mata pelajaran berhasil diperbarui');
      }
      
      setShowSubjectModal(false);
      resetSubjectForm();
      fetchAllData();
    } catch (error) {
      console.error('Error saving subject:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Gagal menyimpan mata pelajaran');
      }
    }
  };

  const handleSubjectEdit = (subject) => {
    setSubjectForm({ nama_mata_pelajaran: subject.nama_mata_pelajaran });
    setEditingSubject(subject);
    setSubjectModalMode('edit');
    setShowSubjectModal(true);
  };

  const handleSubjectDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/subjects/${subjectId}`);
      alert('Mata pelajaran berhasil dihapus');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Gagal menghapus mata pelajaran');
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({ nama_mata_pelajaran: '' });
    setEditingSubject(null);
    setSubjectModalMode('add');
  };

  // Objective Management Functions
  const handleObjectiveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (objectiveModalMode === 'add') {
        await axios.post(`${API}/learning-objectives`, objectiveForm);
        alert('Tujuan pembelajaran berhasil ditambahkan');
      } else {
        await axios.put(`${API}/learning-objectives/${editingObjective.id}`, objectiveForm);
        alert('Tujuan pembelajaran berhasil diperbarui');
      }
      
      setShowObjectiveModal(false);
      resetObjectiveForm();
      fetchAllData();
    } catch (error) {
      console.error('Error saving objective:', error);
      alert('Gagal menyimpan tujuan pembelajaran');
    }
  };

  const handleObjectiveEdit = (objective) => {
    setObjectiveForm({ tujuan_pembelajaran: objective.tujuan_pembelajaran });
    setEditingObjective(objective);
    setObjectiveModalMode('edit');
    setShowObjectiveModal(true);
  };

  const handleObjectiveDelete = async (objectiveId, objectiveName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tujuan pembelajaran "${objectiveName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/learning-objectives/${objectiveId}`);
      alert('Tujuan pembelajaran berhasil dihapus');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting objective:', error);
      alert('Gagal menghapus tujuan pembelajaran');
    }
  };

  const resetObjectiveForm = () => {
    setObjectiveForm({ tujuan_pembelajaran: '' });
    setEditingObjective(null);
    setObjectiveModalMode('add');
  };

  // Configuration Management Functions
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      if (configModalMode === 'add') {
        await axios.post(`${API}/subject-class-objectives`, configForm);
        alert('Konfigurasi berhasil ditambahkan');
      } else {
        await axios.put(`${API}/subject-class-objectives/${editingConfig.id}`, configForm);
        alert('Konfigurasi berhasil diperbarui');
      }
      
      setShowConfigModal(false);
      resetConfigForm();
      fetchAllData();
    } catch (error) {
      console.error('Error saving configuration:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Gagal menyimpan konfigurasi');
      }
    }
  };

  const handleConfigEdit = (config) => {
    setConfigForm({
      subject_id: config.subject.id,
      kelas: config.kelas,
      learning_objective_ids: config.learning_objectives.map(obj => obj.id)
    });
    setEditingConfig(config);
    setConfigModalMode('edit');
    setShowConfigModal(true);
  };

  const handleConfigDelete = async (configId, subjectName, kelas) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus konfigurasi "${subjectName}" untuk kelas "${kelas}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/subject-class-objectives/${configId}`);
      alert('Konfigurasi berhasil dihapus');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Gagal menghapus konfigurasi');
    }
  };

  const resetConfigForm = () => {
    setConfigForm({
      subject_id: '',
      kelas: '',
      learning_objective_ids: []
    });
    setEditingConfig(null);
    setConfigModalMode('add');
  };

  const handleObjectiveToggle = (objectiveId) => {
    const currentIds = configForm.learning_objective_ids;
    const newIds = currentIds.includes(objectiveId)
      ? currentIds.filter(id => id !== objectiveId)
      : [...currentIds, objectiveId];
    
    setConfigForm({ ...configForm, learning_objective_ids: newIds });
  };

  const openSubjectModal = () => {
    resetSubjectForm();
    setShowSubjectModal(true);
  };

  const openObjectiveModal = () => {
    resetObjectiveForm();
    setShowObjectiveModal(true);
  };

  const openConfigModal = () => {
    resetConfigForm();
    setShowConfigModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mata Pelajaran</h1>
        <p className="text-gray-600 mt-2">Kelola mata pelajaran, tujuan pembelajaran, dan konfigurasi kelas</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subjects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpenIcon className="h-5 w-5 inline mr-2" />
              Mata Pelajaran
            </button>
            
            <button
              onClick={() => setActiveTab('objectives')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'objectives'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
              Tujuan Pembelajaran
            </button>
            
            <button
              onClick={() => setActiveTab('configurations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configurations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 inline mr-2" />
              Pengkategorian
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Mata Pelajaran</h3>
                <button
                  onClick={openSubjectModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Tambah Mata Pelajaran</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Mata Pelajaran</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {subjects.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            Belum ada mata pelajaran
                          </td>
                        </tr>
                      ) : (
                        subjects.map((subject, index) => (
                          <tr key={subject.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.nama_mata_pelajaran}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(subject.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleSubjectEdit(subject)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleSubjectDelete(subject.id, subject.nama_mata_pelajaran)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Objectives Tab */}
          {activeTab === 'objectives' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Tujuan Pembelajaran</h3>
                <button
                  onClick={openObjectiveModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Tambah Tujuan Pembelajaran</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tujuan Pembelajaran</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {objectives.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            Belum ada tujuan pembelajaran
                          </td>
                        </tr>
                      ) : (
                        objectives.map((objective, index) => (
                          <tr key={objective.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{objective.tujuan_pembelajaran}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(objective.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleObjectiveEdit(objective)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleObjectiveDelete(objective.id, objective.tujuan_pembelajaran)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Configurations Tab */}
          {activeTab === 'configurations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Konfigurasi Kelas - Mata Pelajaran</h3>
                <button
                  onClick={openConfigModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Tambah Konfigurasi</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {configurations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada konfigurasi kelas
                    </div>
                  ) : (
                    configurations.map((config) => (
                      <div key={config.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {config.subject?.nama_mata_pelajaran || 'Mata Pelajaran Tidak Ditemukan'} - Kelas {config.kelas}
                            </h4>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-2">Tujuan Pembelajaran:</p>
                              <div className="flex flex-wrap gap-2">
                                {config.learning_objectives.map((objective) => (
                                  <span
                                    key={objective.id}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {objective.tujuan_pembelajaran}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleConfigEdit(config)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleConfigDelete(
                                config.id, 
                                config.subject?.nama_mata_pelajaran, 
                                config.kelas
                              )}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 modal-backdrop flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {subjectModalMode === 'add' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'}
            </h3>
            
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.nama_mata_pelajaran}
                  onChange={(e) => setSubjectForm({...subjectForm, nama_mata_pelajaran: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Matematika"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {subjectModalMode === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Objective Modal */}
      {showObjectiveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 modal-backdrop flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {objectiveModalMode === 'add' ? 'Tambah Tujuan Pembelajaran' : 'Edit Tujuan Pembelajaran'}
            </h3>
            
            <form onSubmit={handleObjectiveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tujuan Pembelajaran
                </label>
                <textarea
                  required
                  rows={3}
                  value={objectiveForm.tujuan_pembelajaran}
                  onChange={(e) => setObjectiveForm({...objectiveForm, tujuan_pembelajaran: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Memahami konsep bilangan bulat"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowObjectiveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {objectiveModalMode === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 modal-backdrop flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {configModalMode === 'add' ? 'Tambah Konfigurasi Kelas' : 'Edit Konfigurasi Kelas'}
            </h3>
            
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    required
                    value={configForm.subject_id}
                    onChange={(e) => setConfigForm({...configForm, subject_id: e.target.value})}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas
                  </label>
                  <select
                    required
                    value={configForm.kelas}
                    onChange={(e) => setConfigForm({...configForm, kelas: e.target.value})}
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tujuan Pembelajaran
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {objectives.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada tujuan pembelajaran</p>
                  ) : (
                    <div className="space-y-2">
                      {objectives.map((objective) => (
                        <label key={objective.id} className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configForm.learning_objective_ids.includes(objective.id)}
                            onChange={() => handleObjectiveToggle(objective.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{objective.tujuan_pembelajaran}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {configModalMode === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;