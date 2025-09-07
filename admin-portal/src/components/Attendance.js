import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events/list');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async (eventId) => {
    try {
      const response = await axios.get(`/api/attendance/${eventId}/report`);
      setAttendanceReport(response.data);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchAttendanceReport(event._id);
  };

  const markAttendance = async (studentId, status) => {
    try {
      await axios.post('/api/attendance/mark', {
        student_id: studentId,
        event_id: selectedEvent._id,
        status: status
      });
      fetchAttendanceReport(selectedEvent._id);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'attended': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'registered': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600">Mark and track student attendance for events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Event</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {events.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleEventSelect(event)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEvent?._id === event._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{event.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.start_time).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{event.type}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Report */}
        <div className="lg:col-span-2">
          {selectedEvent && attendanceReport ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {attendanceReport.event.name} - Attendance Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {attendanceReport.summary.totalRegistered}
                    </div>
                    <div className="text-sm text-gray-500">Total Registered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceReport.summary.attended}
                    </div>
                    <div className="text-sm text-gray-500">Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceReport.summary.absent}
                    </div>
                    <div className="text-sm text-gray-500">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendanceReport.summary.attendancePercentage}%
                    </div>
                    <div className="text-sm text-gray-500">Attendance Rate</div>
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Student Attendance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceReport.registrations.map((registration) => (
                        <tr key={registration._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {registration.student_id.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {registration.student_id.student_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                              {registration.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {registration.status === 'registered' && (
                              <>
                                <button
                                  onClick={() => markAttendance(registration.student_id._id, 'attended')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Mark Present
                                </button>
                                <button
                                  onClick={() => markAttendance(registration.student_id._id, 'absent')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Mark Absent
                                </button>
                              </>
                            )}
                            {registration.status === 'attended' && (
                              <button
                                onClick={() => markAttendance(registration.student_id._id, 'absent')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Mark Absent
                              </button>
                            )}
                            {registration.status === 'absent' && (
                              <button
                                onClick={() => markAttendance(registration.student_id._id, 'attended')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Mark Present
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p>Select an event to view attendance details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
