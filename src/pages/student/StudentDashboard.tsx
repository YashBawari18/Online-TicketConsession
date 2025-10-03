import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { FileText, Plus, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { ConcessionForm } from "../../components/ConcessionForm";
import { ApplicationStatus } from "../../components/ApplicationStatus";

type Application = {
  id: string;
  student_name: string;
  year: string;
  branch: string;
  from_station: string;
  to_station: string;
  status: string;
  created_at: string;
  valid_from?: string;
  valid_until?: string;
  is_expired?: boolean;
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "apply" | "status">(
    "overview"
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // For renew flow
  const [renewApplicationId, setRenewApplicationId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // read query params once on mount (so ?tab=apply&renewId=...)
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const renewId = params.get("renewId");
    if (tab === "apply" || tab === "status" || tab === "overview") {
      setActiveTab(tab as any);
    }
    if (renewId) {
      setActiveTab("apply"); // ensure apply tab is visible
      setRenewApplicationId(renewId);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("concession_applications")
      .select("*")
      .eq("student_id", user.id)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your train concession applications
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "apply", label: "Apply", icon: Plus },
              { id: "status", label: "Status", icon: Eye },
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {app.from_station} → {app.to_station}
                      </p>
                      <p className="text-sm text-gray-500">
                        {app.year} {app.branch} •{" "}
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>

                      {/* Expiry info (new) */}
                      <p className="text-sm text-gray-500">
                        Expires:{" "}
                        {app.valid_until
                          ? new Date(app.valid_until).toLocaleDateString()
                          : "N/A"}
                      </p>
                      {app.is_expired && (
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-xs text-red-600 font-semibold">
                            Expired
                          </span>
                          <button
                            onClick={() => {
                              setRenewApplicationId(app.id);
                              setActiveTab("apply");
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Renew Now
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No applications yet. Click "Apply" to submit your first
                  concession request.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "apply" && (
        <ConcessionForm
          onSuccess={() => {
            fetchApplications();
            /* clear query param if any */ const url = new URL(
              window.location.href
            );
            url.searchParams.delete("renewId");
            url.searchParams.set("tab", "status");
            window.history.replaceState({}, "", url.toString());
          }}
          renewApplicationId={renewApplicationId ?? undefined}
        />
      )}

      {activeTab === "status" && (
        <ApplicationStatus applications={applications} />
      )}
    </div>
  );
};
