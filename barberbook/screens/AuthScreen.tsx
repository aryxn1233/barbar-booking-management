import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Role } from '../types';
import { Card, Button, Input, Spinner } from '../components/ui';
import { AtSymbolIcon, LockClosedIcon, UserCircleIcon } from '../components/Icons';

type AuthMode = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { login, register } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.CLIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        switch (user.role) {
          case Role.ADMIN: navigate('/admin'); break;
          case Role.BARBER: navigate('/barber'); break;
          case Role.CLIENT: navigate('/client'); break;
          default: navigate('/');
        }
      } else {
        await register(name, email, password, role);
        setMessage('Registration successful! Please log in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-yellow-500 mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          {mode === 'login' ? 'Sign in to continue' : 'Join the BarberBook community'}
        </p>
        
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
        {message && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-sm">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input 
              icon={<UserCircleIcon className="w-5 h-5" />}
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          )}
          <Input 
            icon={<AtSymbolIcon className="w-5 h-5" />}
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
          <Input 
            icon={<LockClosedIcon className="w-5 h-5" />}
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
          />

          {mode === 'register' && (
            <div className="flex items-center justify-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">I am a:</span>
              <Button type="button" variant={role === Role.CLIENT ? 'primary' : 'secondary'} onClick={() => setRole(Role.CLIENT)}>Client</Button>
              <Button type="button" variant={role === Role.BARBER ? 'primary' : 'secondary'} onClick={() => setRole(Role.BARBER)}>Barber</Button>
            </div>
          )}

          <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
            {isLoading ? <Spinner /> : (mode === 'login' ? 'Login' : 'Register')}
          </Button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleMode} className="font-semibold text-yellow-500 hover:text-yellow-400 ml-2">
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default AuthScreen;