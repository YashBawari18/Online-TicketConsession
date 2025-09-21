import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { ApplicationTable } from '../../components/ApplicationTable';
import { ExportPDF } from '../../utils/exportPDF';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

type Application = {
  id: string;
  student_name: string;
  year: string;
  category: string;
  branch: string;
  from_station: string;
  to_station: string;
  class_type: string;
  railway_type: string;
  pass_type: string;
  date_of_birth: string;
  concession_form_no: string;
  age: number;
  previous_pass_date: string;
  previous_pass_expiry: string;
  season_ticket_no: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showCharts, setShowCharts] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, branchFilter, yearFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('concession_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setApplications(data);
      setStats({
        total: data.length,
        pending: data.filter((app) => app.status === 'pending').length,
        approved: data.filter((app) => app.status === 'approved').length,
        rejected: data.filter((app) => app.status === 'rejected').length,
      });
    }
    setLoading(false);
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.concession_form_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.from_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.to_station.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (branchFilter !== 'all') {
      filtered = filtered.filter((app) => app.branch === branchFilter);
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter((app) => app.year === yearFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('concession_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      fetchApplications();
    }
  };

  const exportApprovedApplications = () => {
    const approvedApps = applications.filter((app) => app.status === 'approved');
    ExportPDF(approvedApps);
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    color: string;
  }> = ({ icon, title, value, color }) => (
    <div
      className="bg-white rounded-xl shadow-md p-6 border-l-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0" style={{ color }}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  // Chart Data
  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
  ];
  const COLORS = ['#F59E0B', '#10B981', '#EF4444'];

  const branchData = Object.values(
    applications.reduce((acc, app) => {
      acc[app.branch] = acc[app.branch] || { branch: app.branch, count: 0 };
      acc[app.branch].count += 1;
      return acc;
    }, {} as Record<string, { branch: string; count: number }>)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage student concession applications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FileText className="h-8 w-8" />}
          title="Total Applications"
          value={stats.total}
          color="#3B82F6"
        />
        <StatCard
          icon={<Clock className="h-8 w-8" />}
          title="Pending"
          value={stats.pending}
          color="#F59E0B"
        />
        <StatCard
          icon={<CheckCircle className="h-8 w-8" />}
          title="Approved"
          value={stats.approved}
          color="#10B981"
        />
        <StatCard
          icon={<XCircle className="h-8 w-8" />}
          title="Rejected"
          value={stats.rejected}
          color="#EF4444"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, form no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Branches</option>
              <option value="Civil">Civil</option>
              <option value="Computer">Computer</option>
              <option value="Chemical">Chemical</option>
              <option value="Electronics">Electronics</option>
              <option value="IT">IT</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              <option value="FE">FE</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export
            </label>
            <button
              onClick={exportApprovedApplications}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Charts Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          {showCharts ? 'Hide Charts' : 'Show Charts'}
        </button>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Application Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Applications by Branch</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <ApplicationTable
        applications={filteredApplications}
        onUpdateStatus={updateApplicationStatus}
      />
    </div>
  );
};
