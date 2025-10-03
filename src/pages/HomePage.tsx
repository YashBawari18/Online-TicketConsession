import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Users, UserCheck } from 'lucide-react';
import dmceImage from '../dmce.jpeg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${dmceImage})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center animate-fadeIn">
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl p-8 md:p-12 border border-white/30">
            <div className="flex justify-center mb-8">
              <Train className="h-16 w-16 text-blue-600 animate-bounce" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-4">
              Datta Meghe College of Engineering
            </h1>

            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
              Train Concession Portal
            </h2>

            <p className="text-gray-200 text-lg mb-12 leading-relaxed">
              Digital platform for submitting and managing train concession applications.
              <br />
              No more waiting in long queues – apply online with ease.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => navigate('/student/login')}
                className="group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <Users className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Student Portal</h3>
                <p className="text-blue-100">Apply for train concession online</p>
              </button>

              <button
                onClick={() => navigate('/admin/login')}
                className="group bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white p-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <UserCheck className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
                <p className="text-gray-300">Manage concession applications</p>
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-white/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-200">Online Access</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Fast</div>
                <div className="text-sm text-gray-200">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Secure</div>
                <div className="text-sm text-gray-200">Data Storage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
