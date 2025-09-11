import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Users, UserCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <Train className="h-16 w-16 text-blue-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Datta Meghe College of Engineering
            </h1>
            
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-6">
              Train Concession Portal
            </h2>
            
            <p className="text-gray-600 text-lg mb-12 leading-relaxed">
              Digital platform for submitting and managing train concession applications.
              <br />
              No more waiting in long queues - apply online with ease.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => navigate('/student/login')}
                className="group bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <Users className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Student Portal</h3>
                <p className="text-blue-100">Apply for train concession online</p>
              </button>
              
              <button
                onClick={() => navigate('/admin/login')}
                className="group bg-gray-800 hover:bg-gray-900 text-white p-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <UserCheck className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
                <p className="text-gray-300">Manage concession applications</p>
              </button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Online Access</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Fast</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Secure</div>
                <div className="text-sm text-gray-600">Data Storage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};