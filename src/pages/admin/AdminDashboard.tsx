import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  LayoutDashboard,
  BarChart as BarChartIcon,
} from "lucide-react";
import { ApplicationTable } from "../../components/ApplicationTable";
import { ViewDocs } from "../../components/ViewDocs";
import { ExportPDF } from "../../utils/exportPDF";
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
} from "recharts";

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
  valid_from?: string;
  valid_until?: string;
  is_expired?: boolean;
};

export const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "view-docs" | "analytics">("dashboard");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Extend Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    // Listen for Extend Pass event
    const handleExtendPass = (event: any) => {
      const { application } = event.detail;
      setSelectedApp(application);
      setExtendModalOpen(true);
    };

    window.addEventListener("extend-pass", handleExtendPass);
    return () => window.removeEventListener("extend-pass", handleExtendPass);
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, branchFilter, yearFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("concession_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setApplications(data);
      setStats({
        total: data.length,
        pending: data.filter((app) => app.status === "pending").length,
        approved: data.filter((app) => app.status === "approved").length,
        rejected: data.filter((app) => app.status === "rejected").length,
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

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((app) => app.branch === branchFilter);
    }

    if (yearFilter !== "all") {
      filtered = filtered.filter((app) => app.year === yearFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (
    id: string,
    status: "approved" | "rejected",
    passData?: { issueDate: string; expiryDate: string }
  ) => {
    const updateData: any = { status, updated_at: new Date().toISOString() };

    if (passData) {
      updateData.previous_pass_date = passData.issueDate;
      updateData.previous_pass_expiry = passData.expiryDate;
    }

    const { error } = await supabase
      .from("concession_applications")
      .update(updateData)
      .eq("id", id);

    if (!error) {
      fetchApplications();
    }
  };

  // Extend Pass Logic
  const extendPass = async (months: number) => {
    if (!selectedApp) return;

    const currentExpiry = selectedApp.valid_until
      ? new Date(selectedApp.valid_until)
      : new Date();

    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    const { error } = await supabase
      .from("concession_applications")
      .update({
        valid_until: newExpiry.toISOString(),
        is_expired: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedApp.id);

    if (error) {
      alert("Error extending pass: " + error.message);
    } else {
      alert(`Pass extended until ${newExpiry.toLocaleDateString()} successfully!`);
      fetchApplications();
    }

    setExtendModalOpen(false);
    setSelectedApp(null);
  };

  const exportApprovedApplications = () => {
    const approvedApps = applications.filter((app) => app.status === "approved");
    ExportPDF(approvedApps);
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    color: string;
  }> = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: color }}>
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

  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
  ];
  const COLORS = ["#F59E0B", "#10B981", "#EF4444"];

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

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "view-docs", label: "View Documents", icon: Eye },
              { id: "analytics", label: "Analytics", icon: BarChartIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FileText className="h-8 w-8" />} title="Total Applications" value={stats.total} color="#3B82F6" />
            <StatCard icon={<Clock className="h-8 w-8" />} title="Pending" value={stats.pending} color="#F59E0B" />
            <StatCard icon={<CheckCircle className="h-8 w-8" />} title="Approved" value={stats.approved} color="#10B981" />
            <StatCard icon={<XCircle className="h-8 w-8" />} title="Rejected" value={stats.rejected} color="#EF4444" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Export</label>
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

          {/* Charts */}
          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Application Status Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

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
          <ApplicationTable applications={filteredApplications} onUpdateStatus={updateApplicationStatus} />
        </div>
      )}

      {/* View Docs */}
      {activeTab === "view-docs" && <ViewDocs />}

      {/* Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Application Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

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
        </div>
      )}

      {/* Extend Pass Modal */}
  {extendModalOpen && selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Extend Pass for {selectedApp.student_name}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Current Expiry:{" "}
              {selectedApp.valid_until
                ? new Date(selectedApp.valid_until).toLocaleDateString()
                : "Not Set"}
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => extendPass(1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Extend 1 Month
              </button>
              <button
                onClick={() => extendPass(3)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Extend 3 Months
              </button>
            </div>
            <button
              onClick={() => setExtendModalOpen(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
