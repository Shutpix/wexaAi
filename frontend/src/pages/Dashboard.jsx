import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, companies: 0, jobs: 0, skills: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, companiesRes, jobsRes, skillsRes] = await Promise.all([
          api.get('/users'),
          api.get('/companies'),
          api.get('/jobs'),
          api.get('/skills')
        ]);
        setStats({
          users: usersRes.data.length,
          companies: companiesRes.data.length,
          jobs: jobsRes.data.length,
          skills: skillsRes.data.length
        });
      } catch (err) {
        setError('Failed to load dashboard data. Ensure the database is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} color="bg-blue-500" />
        <StatCard title="Companies" value={stats.companies} color="bg-green-500" />
        <StatCard title="Jobs" value={stats.jobs} color="bg-purple-500" />
        <StatCard title="Skills" value={stats.skills} color="bg-yellow-500" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
    <div className={`p-4 rounded-full text-white ${color}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
