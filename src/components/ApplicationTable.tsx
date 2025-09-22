import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Calendar, MapPin, User, FileText } from 'lucide-react';
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

type ApplicationTableProps = {
  applications: Application[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected', passData?: { issueDate: string; expiryDate: string }) => void;
};

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ 
  applications, 
  onUpdateStatus 
}) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleViewDocument = (application: Application) => {
    setSelectedApplication(application);
    setIsViewerOpen(true);
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
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

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
        <p className="text-gray-600">
          No applications match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Applications Management</h2>
        <p className="text-sm text-gray-600">Review and manage student concession applications</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Travel Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pass Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
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
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {application.student_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.year} {application.branch}
                      </div>
                      <div className="text-xs text-gray-400">
                        Form: {application.concession_form_no}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {application.from_station} → {application.to_station}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {application.railway_type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {application.class_type}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application.pass_type}
                  </div>
                  <div className="text-xs text-gray-400">
                    {application.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center space-y-1">
                    {(application.id_card_url || application.aadhar_url || application.fee_receipt_url) ? (
                      <button
                        onClick={() => handleViewDocument(application)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <FileText className="h-3 w-3 mr-1" />
                        No Docs
                      </div>
                    )}
                    {/* Document count indicator */}
                    <div className="flex space-x-1">
                      <span className={`w-2 h-2 rounded-full ${
                        application.id_card_url ? 'bg-green-500' : 'bg-gray-300'
                      }`} title={application.id_card_url ? 'ID Card uploaded' : 'ID Card missing'}></span>
                      <span className={`w-2 h-2 rounded-full ${
                        application.aadhar_url ? 'bg-green-500' : 'bg-gray-300'
                      }`} title={application.aadhar_url ? 'Aadhar uploaded' : 'Aadhar missing'}></span>
                      <span className={`w-2 h-2 rounded-full ${
                        application.fee_receipt_url ? 'bg-green-500' : 'bg-gray-300'
                      }`} title={application.fee_receipt_url ? 'Fee Receipt uploaded' : 'Fee Receipt missing'}></span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-1">
                    {/* View Document Button (visible if any document exists) */}
                    {(application.id_card_url || application.aadhar_url || application.fee_receipt_url) && (
                      <button
                        onClick={() => handleViewDocument(application)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Docs ({[
                          application.id_card_url ? 1 : 0,
                          application.aadhar_url ? 1 : 0,
                          application.fee_receipt_url ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}/3)
                      </button>
                    )}
                    
                    {/* Quick Actions */}
                    {application.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onUpdateStatus(application.id, 'approved')}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => onUpdateStatus(application.id, 'rejected')}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {application.status !== 'pending' && (
                      <span className="text-gray-500 text-xs">
                        {application.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Document Viewer Modal */}
      <DocumentViewer
        application={selectedApplication}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedApplication(null);
        }}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
};
