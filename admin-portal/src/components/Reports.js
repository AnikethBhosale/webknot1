import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [popularEvents, setPopularEvents] = useState([]);
  const [studentParticipation, setStudentParticipation] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [eventTypeAnalytics, setEventTypeAnalytics] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    fetchPopularEvents();
  }, []);

  const fetchPopularEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/popular_events?limit=10');
      setPopularEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching popular events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentParticipation = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/student_participation?limit=20');
      setStudentParticipation(response.data.students);
    } catch (error) {
      console.error('Error fetching student participation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/top_students?limit=10');
      setTopStudents(response.data.topStudents);
    } catch (error) {
      console.error('Error fetching top students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypeAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/event_type_analytics');
      setEventTypeAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching event type analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceTrends = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/attendance_trends?months=12');
      setAttendanceTrends(response.data.trends);
    } catch (error) {
      console.error('Error fetching attendance trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'popular':
        if (popularEvents.length === 0) fetchPopularEvents();
        break;
      case 'participation':
        if (studentParticipation.length === 0) fetchStudentParticipation();
        break;
      case 'top':
        if (topStudents.length === 0) fetchTopStudents();
        break;
      case 'analytics':
        if (eventTypeAnalytics.length === 0) fetchEventTypeAnalytics();
        break;
      case 'trends':
        if (attendanceTrends.length === 0) fetchAttendanceTrends();
        break;
      default:
        break;
    }
  };

  const tabs = [
    { id: 'popular', name: 'Popular Events', icon: '🔥' },
    { id: 'participation', name: 'Student Participation', icon: '👥' },
    { id: 'top', name: 'Top Students', icon: '🏆' },
    { id: 'analytics', name: 'Event Analytics', icon: '📊' },
    { id: 'trends', name: 'Attendance Trends', icon: '📈' }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'popular':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Events</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={popularEvents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalRegistrations" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularEvents.map((event) => (
                      <tr key={event._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{event.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.totalRegistrations}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.attendanceRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.averageRating || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'participation':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Participation Overview</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={studentParticipation.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendedEvents" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Student Participation Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participation Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedbacks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentParticipation.map((student) => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.totalEvents}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendedEvents}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.participationRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.feedbackCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'top':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topStudents.slice(0, 3).map((student, index) => (
                  <div key={student._id} className="text-center p-6 border rounded-lg">
                    <div className="text-4xl mb-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-500">{student.student_id}</p>
                    <div className="mt-4 space-y-2">
                      <div className="text-2xl font-bold text-primary-600">{student.attendedEvents}</div>
                      <div className="text-sm text-gray-500">Events Attended</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-lg font-semibold text-green-600">{student.participationRate}%</div>
                      <div className="text-sm text-gray-500">Participation Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Complete Rankings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participation Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedbacks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topStudents.map((student, index) => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendedEvents}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.participationRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.feedbackCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Events by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeAnalytics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, totalEvents }) => `${name}: ${totalEvents}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalEvents"
                    >
                      {eventTypeAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Event Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventTypeAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageAttendanceRate" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Event Type Analytics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventTypeAnalytics.map((analytics) => (
                      <tr key={analytics.type}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{analytics.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.totalEvents}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.totalRegistrations}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.averageAttendanceRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytics.averageRating || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends (Last 12 Months)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendanceRate" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Events per Month</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalEvents" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Registrations</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalRegistrations" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into campus events and student engagement</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Reports;
