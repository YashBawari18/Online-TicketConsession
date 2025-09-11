import React from 'react';
import { Clock, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';

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
  status: string;
  created_at: string;
};

type ApplicationStatusProps = {
  applications: Application[];
};

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ applications }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-gray-600">
          You haven't submitted any concession applications yet. Click "Apply" to submit your first application.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
          <p className="text-sm text-gray-600">Track all your concession applications</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {applications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(application.status)}
                    <h3 className="text-lg font-medium text-gray-900">
                      Application #{application.id.slice(-8)}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{application.from_station} → {application.to_station}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{new Date(application.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{application.year} {application.branch}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span>{application.class_type} • {application.pass_type}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">Railway:</span> {application.railway_type}
                  </div>
                </div>
              </div>
              
              {application.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your application is being reviewed by the admin. You will be notified once it's processed.
                  </p>
                </div>
              )}
              
              {application.status === 'approved' && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Congratulations! Your concession application has been approved. You can collect your concession form from the office.
                  </p>
                </div>
              )}
              
              {application.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    Your application has been rejected. Please contact the office for more details or submit a new application with correct information.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};