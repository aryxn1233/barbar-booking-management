
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const NotFoundScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-black text-yellow-500">404</h1>
      <p className="text-2xl md:text-3xl font-bold text-gray-300 mt-4">Page Not Found</p>
      <p className="text-gray-400 mt-2 mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFoundScreen;
