"use client"
import React, { useState } from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { loginUser } from '../services/post';
import { useRouter } from 'next/navigation';
import { User } from '../globalvariables';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const route = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await loginUser(username, password) as User;
      console.log(user);
      const response = await fetch("/v1/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.ID,
          created_at: user.created_at,
          username: user.username,
          isAdmin: user.isAdmin
        }),
      })
      const responseData = await response.json();
      console.log(responseData);
      route.push('/dashboard/home');
    } catch (err: any) {
      setError('Login gagal. Periksa username dan password anda.');
    } finally {
      setIsLoading(false);
    }
  };

  function onBack() {
    window.history.back();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative z-10">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Package size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Selamat Datang</h2>
          <p className="text-slate-500 mt-1">Masuk untuk mengelola inventory anda.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>
            Masuk Sekarang
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Smart Inventory Solution v1.0
        </p>
      </div>
    </div>
  );
};