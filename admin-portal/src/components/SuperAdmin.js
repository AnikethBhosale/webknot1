import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperAdmin = () => {
  const [colleges, setColleges] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [collegeForm, setCollegeForm] = useState({
    name: '',
    address: ''
  });

  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collegesRes, adminsRes] = await Promise.all([
        axios.get('/api/superadmin/colleges'),
        axios.get('/api/superadmin/admins')
      ]);
      setColleges(collegesRes.data);
      setAdmins(adminsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('/api/superadmin/colleges/create', collegeForm);
      setMessage('College created successfully!');
      setShowCollegeModal(false);
      setCollegeForm({ name: '', address: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating college:', error);
      setError(error.response?.data?.message || 'Failed to create college');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post(`/api/superadmin/colleges/${selectedCollege._id}/admins/create`, adminForm);
      setMessage('College admin created successfully!');
      setShowAdminModal(false);
      setAdminForm({ email: '', password: '' });
      setSelectedCollege(null);
      fetchData();
    } catch (error) {
      console.error('Error creating admin:', error);
      setError(error.response?.data?.message || 'Failed to create college admin');
    }
  };

  const openAdminModal = (college) => {
    setSelectedCollege(college);
    setShowAdminModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-600">Create and manage colleges and their administrators</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCollegeModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            + Create College
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Colleges List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Colleges</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => {
              const collegeAdmin = admins.find(admin => 
                admin.college_id && admin.college_id._id === college._id
              );
              
              return (
                <div key={college._id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{college.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{college.address}</p>
                    </div>
                    {collegeAdmin && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    {collegeAdmin ? (
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-sm text-green-800 font-medium">Admin Assigned</p>
                        <p className="text-sm text-green-600">{collegeAdmin.email}</p>
                      </div>
                    ) : (
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-sm text-red-800 font-medium mb-2">No Admin Assigned</p>
                        <button
                          onClick={() => openAdminModal(college)}
                          className="w-full bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition-colors"
                        >
                          + Create Admin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create College Modal */}
      {showCollegeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New College</h3>
              <form onSubmit={handleCollegeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">College Name</label>
                  <input
                    type="text"
                    value={collegeForm.name}
                    onChange={(e) => setCollegeForm({...collegeForm, name: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={collegeForm.address}
                    onChange={(e) => setCollegeForm({...collegeForm, address: e.target.value})}
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCollegeModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Create College
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showAdminModal && selectedCollege && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Admin for {selectedCollege.name}
              </h3>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    required
                    minLength={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
