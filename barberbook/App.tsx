import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import { Role } from './types';

import AuthScreen from './screens/AuthScreen';
import AdminDashboard from './screens/AdminDashboard';
import BarberDashboard from './screens/BarberDashboard';
import ClientDashboard from './screens/ClientDashboard';
import BarberProfileScreen from './screens/BarberProfileScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import { LogoutIcon } from './components/Icons';
import ThemeToggle from './components/ThemeToggle';

const ProtectedRoute: React.FC<{ allowedRoles: Role[] }> = ({ allowedRoles }) => {
  const { currentUser } = useAppContext();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Let's check if a barber is trying to view their own public profile
    // This is a simple check; more complex logic might be needed for other roles
    const isBarberViewingProfile = currentUser.role === Role.BARBER && location.pathname.startsWith('/barbers/');
    if (!isBarberViewingProfile) {
        return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

const AppHeader: React.FC = () => {
    const { currentUser, logout } = useAppContext();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="font-bold text-2xl text-yellow-500">BarberBook</Link>
                    </div>
                     <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {currentUser && (
                            <>
                                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">Welcome, {currentUser.name}</span>
                                <button onClick={logout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                    <LogoutIcon className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

const MainLayout: React.FC = () => (
    <div className="min-h-screen">
        <AppHeader />
        <main className="py-8">
            <Outlet />
        </main>
    </div>
);


const AppRoutes: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <Routes>
       <Route path="/auth" element={!currentUser ? <AuthScreen /> : <Navigate to="/" replace />} />
       
       <Route element={<MainLayout />}>
          <Route path="/" element={
              currentUser ? (
                  currentUser.role === Role.ADMIN ? <Navigate to="/admin" /> :
                  currentUser.role === Role.BARBER ? <Navigate to="/barber" /> :
                  <Navigate to="/client" />
              ) : <Navigate to="/auth" />
          }/>

          <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[Role.BARBER]} />}>
            <Route path="/barber" element={<BarberDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[Role.CLIENT, Role.BARBER]} />}>
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/barbers/:id" element={<BarberProfileScreen />} />
          </Route>
       </Route>
       
       <Route path="/unauthorized" element={<div className="text-center p-10"><h1 className="text-3xl font-bold text-red-500">Unauthorized</h1><p>You do not have permission to view this page.</p></div>} />
       <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
};


function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}

export default App;