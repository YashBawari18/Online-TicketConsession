import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Train } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-white shadow-md border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Train className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">DMCE Train Concession</h1>
                <p className="text-sm text-gray-600">Datta Meghe College of Engineering</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.type === 'student' ? user.name : user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user.type === 'student' ? `Roll: ${user.roll_number}` : 'Admin'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};