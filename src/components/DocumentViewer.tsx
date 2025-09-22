import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Download, FileText, Image as ImageIcon } from 'lucide-react';

type Application = {
  id: string;
  student_name: string;
  year: string;
  branch: string;
  from_station: string;
  to_station: string;
  class_type: string;
  railway_type: string;
  pass_type: string;
  concession_form_no: string;
  status: string;
  id_card_url: string | null;
  aadhar_url: string | null;
  fee_receipt_url: string | null;
  created_at: string;
  previous_pass_date: string;
  previous_pass_expiry: string;
};

type DocumentViewerProps = {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected', passData?: { issueDate: string; expiryDate: string }) => void;
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  application,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const [passIssueDate, setPassIssueDate] = useState('');
  const [passExpiryDate, setPassExpiryDate] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeDocumentTab, setActiveDocumentTab] = useState<'id-card' | 'aadhar' | 'fee-receipt'>('id-card');

  // Auto-calculate expiry date when issue date changes
  const handleIssueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const issueDate = e.target.value;
    setPassIssueDate(issueDate);
    
    if (issueDate) {
      const issue = new Date(issueDate);
      const expiry = new Date(issue);
      expiry.setDate(expiry.getDate() + 30); // Add 30 days (configurable)
      setPassExpiryDate(expiry.toISOString().split('T')[0]);
    } else {
      setPassExpiryDate('');
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!application) return;
    
    setProcessing(true);
    try {
      const passData = status === 'approved' && passIssueDate && passExpiryDate 
        ? { issueDate: passIssueDate, expiryDate: passExpiryDate }
        : undefined;
      
      await onUpdateStatus(application.id, status, passData);
      onClose();
      setPassIssueDate('');
      setPassExpiryDate('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getFileType = (url: string | null) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'unknown';
  };

  const getCurrentDocumentUrl = () => {
    switch (activeDocumentTab) {
      case 'id-card':
        return application?.id_card_url;
      case 'aadhar':
        return application?.aadhar_url;
      case 'fee-receipt':
        return application?.fee_receipt_url;
      default:
        return null;
    }
  };

  const getCurrentDocumentName = () => {
    switch (activeDocumentTab) {
      case 'id-card':
        return 'College ID Card';
      case 'aadhar':
        return 'Aadhar Card';
      case 'fee-receipt':
        return 'Fee Receipt';
      default:
        return 'Document';
    }
  };

  const renderDocument = () => {
    const currentUrl = getCurrentDocumentUrl();
    
    if (!currentUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No {getCurrentDocumentName().toLowerCase()} uploaded</p>
          </div>
        </div>
      );
    }

    const fileType = getFileType(currentUrl);

    if (fileType === 'image') {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg">
          <img
            src={currentUrl}
            alt={getCurrentDocumentName()}
            className="max-w-full max-h-96 object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.style.display = 'block';
            }}
          />
          <div className="hidden text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load image</p>
          </div>
        </div>
      );
    } else if (fileType === 'pdf') {
      return (
        <div className="h-96">
          <iframe
            src={currentUrl}
            className="w-full h-full border-0 rounded-lg"
            title="PDF Document"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Document type not supported for preview</p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Document
          </a>
        </div>
      </div>
    );
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Review</h2>
            <p className="text-gray-600">
              Application #{application.id.slice(-8)} - {application.student_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Display */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
              
              {/* Document Tabs */}
              <div className="mb-4">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'id-card', label: 'ID Card', url: application?.id_card_url },
                      { id: 'aadhar', label: 'Aadhar', url: application?.aadhar_url },
                      { id: 'fee-receipt', label: 'Fee Receipt', url: application?.fee_receipt_url }
                    ].map(({ id, label, url }) => (
                      <button
                        key={id}
                        onClick={() => setActiveDocumentTab(id as any)}
                        className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeDocumentTab === id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{label}</span>
                        {url && <span className="text-green-500">✓</span>}
                        {!url && <span className="text-red-500">✗</span>}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
              
              {/* Document Content */}
              {renderDocument()}
              
              {/* Download Button */}
              {getCurrentDocumentUrl() && (
                <div className="mt-4 flex justify-center">
                  <a
                    href={getCurrentDocumentUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download {getCurrentDocumentName()}
                  </a>
                </div>
              )}
              
              {/* Document Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Document Status</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`flex items-center ${
                    application?.id_card_url ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {application?.id_card_url ? '✓' : '✗'} ID Card
                  </div>
                  <div className={`flex items-center ${
                    application?.aadhar_url ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {application?.aadhar_url ? '✓' : '✗'} Aadhar
                  </div>
                  <div className={`flex items-center ${
                    application?.fee_receipt_url ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {application?.fee_receipt_url ? '✓' : '✗'} Fee Receipt
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Application Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <p className="mt-1 text-sm text-gray-900">{application.student_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Form Number</label>
                    <p className="mt-1 text-sm text-gray-900">{application.concession_form_no}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year & Branch</label>
                    <p className="mt-1 text-sm text-gray-900">{application.year} {application.branch}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {application.from_station} → {application.to_station}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class & Railway</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {application.class_type} - {application.railway_type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pass Type</label>
                    <p className="mt-1 text-sm text-gray-900">{application.pass_type}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Pass Date Management */}
                {application.status === 'pending' && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Pass Date Management</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Previous Pass Issue Date
                        </label>
                        <input
                          type="date"
                          value={passIssueDate}
                          onChange={handleIssueDateChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Previous Pass Expiry Date
                        </label>
                        <input
                          type="date"
                          value={passExpiryDate}
                          onChange={(e) => setPassExpiryDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {application.status === 'pending' && (
            <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={processing}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="h-5 w-5 mr-2" />
                {processing ? 'Processing...' : 'Reject Application'}
              </button>
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={processing}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {processing ? 'Processing...' : 'Approve Application'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};