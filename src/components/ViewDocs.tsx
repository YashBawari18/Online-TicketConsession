import React, { useState, useEffect } from 'react';
import { Eye, FileText, Calendar, User, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DocumentViewer } from './DocumentViewer';

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
  id_card_url: string | null;
  aadhar_url: string | null;
  fee_receipt_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export const ViewDocs: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasDocumentFilter, setHasDocumentFilter] = useState('all');
  
  // Document viewer state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, hasDocumentFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('concession_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.concession_form_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.from_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.to_station.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Document filter
    if (hasDocumentFilter === 'with-docs') {
      filtered = filtered.filter((app) => 
        app.id_card_url !== null || app.aadhar_url !== null || app.fee_receipt_url !== null
      );
    } else if (hasDocumentFilter === 'without-docs') {
      filtered = filtered.filter((app) => 
        app.id_card_url === null && app.aadhar_url === null && app.fee_receipt_url === null
      );
    }

    setFilteredApplications(filtered);
  };

  const handleViewDocument = (application: Application) => {
    setSelectedApplication(application);
    setIsViewerOpen(true);
  };

  const handleUpdateStatus = async (
    id: string, 
    status: 'approved' | 'rejected', 
    passData?: { issueDate: string; expiryDate: string }
  ) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      // Add pass dates if provided (when approving)
      if (passData) {
        updateData.previous_pass_date = passData.issueDate;
        updateData.previous_pass_expiry = passData.expiryDate;
      }

      const { error } = await supabase
        .from('concession_applications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh applications list
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  };

  const getDocumentIcon = (url: string | null) => {
    if (!url) return <FileText className="h-4 w-4 text-gray-400" />;
    
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (extension === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getDocumentSummary = (application: Application) => {
    const documents = [
      { name: 'ID Card', url: application.id_card_url },
      { name: 'Aadhar', url: application.aadhar_url },
      { name: 'Fee Receipt', url: application.fee_receipt_url }
    ];
    
    const uploaded = documents.filter(doc => doc.url).length;
    const total = documents.length;
    
    return { uploaded, total, documents };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">View Documents</h2>
            <p className="text-gray-600">Review all uploaded student documents</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Applications: {filteredApplications.length}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Documents
            </label>
            <select
              value={hasDocumentFilter}
              onChange={(e) => setHasDocumentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Applications</option>
              <option value="with-docs">With Documents</option>
              <option value="without-docs">Without Documents</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setHasDocumentFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Applications with Documents</h3>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              No applications match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900">
                        {application.student_name}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Form Number</p>
                        <p className="text-sm text-gray-900">{application.concession_form_no}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Year & Branch</p>
                        <p className="text-sm text-gray-900">{application.year} {application.branch}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Route</p>
                        <p className="text-sm text-gray-900">
                          {application.from_station} → {application.to_station}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Applied Date</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-900">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Document Status */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Documents Status</p>
                      <div className="flex flex-wrap gap-4">
                        {getDocumentSummary(application).documents.map((doc, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            {getDocumentIcon(doc.url)}
                            <span className={`text-xs ${
                              doc.url ? 'text-green-600' : 'text-red-500'
                            }`}>
                              {doc.name} {doc.url ? '✓' : '✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getDocumentSummary(application).uploaded}/{getDocumentSummary(application).total} documents uploaded
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleViewDocument(application)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        (application.id_card_url || application.aadhar_url || application.fee_receipt_url)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!(application.id_card_url || application.aadhar_url || application.fee_receipt_url)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Docs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        application={selectedApplication}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedApplication(null);
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};