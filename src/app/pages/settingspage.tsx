"use client";

import React, { useEffect, useState, useRef } from "react";
import { getUserAuth } from "@/app/services/get";
import { updateUserPassword } from "@/app/services/post";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/components/SideBar";
import { User } from "../globalvariables";

const SettingsPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeUsername, setChangeUsername] = useState<string>('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const toastTl = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    getUserAuth()
      .then((data) => {
        if (!mounted) return;
        if (data && (data.user || data.email || data.name)) {
          setUserData(data.user ?? data);
        }
      })
      .catch((err) => console.error("Failed to load user:", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Modal animation with GSAP (dynamic import). If GSAP is not available, we fall back to simple CSS.
  useEffect(() => {
    if (!isModalOpen || !modalRef.current) return;
    let ctx: any = null;
    let gsap: any = null;
    (async () => {
      try {
        gsap = (await import('gsap')).gsap;
        gsap.fromTo(modalRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      } catch (e) {
        // fallback: simple CSS transition by setting style
        if (modalRef.current) {
          modalRef.current.style.opacity = '1';
          modalRef.current.style.transform = 'translateY(0)';
        }
      }
    })();

    return () => {
      try { if (gsap && modalRef.current) gsap.to(modalRef.current, { autoAlpha: 0, y: 10, duration: 0.2 }); } catch (e) { }
      ctx = null;
    };
  }, [isModalOpen]);

  // Toast (sonner-like) animation: 5s timer with GSAP progress bar, fallback to CSS
  useEffect(() => {
    if (!toast) return;
    let cancelled = false;
    (async () => {
      try {
        const { gsap } = await import('gsap');
        if (!toastRef.current || !progressRef.current) return;
        // reset
        gsap.set(toastRef.current, { autoAlpha: 0, y: -10 });
        gsap.set(progressRef.current, { width: '100%' });

        // timeline: show, progress shrink, hide
        toastTl.current = gsap.timeline({ onComplete: () => { if (!cancelled) setToast(null); } });
        toastTl.current.to(toastRef.current, { autoAlpha: 1, y: 0, duration: 0.25 });
        toastTl.current.to(progressRef.current, { width: '0%', duration: 5, ease: 'linear' });
        toastTl.current.to(toastRef.current, { autoAlpha: 0, y: -10, duration: 0.25 });
      } catch (e) {
        // fallback: CSS transition
        if (toastRef.current && progressRef.current) {
          toastRef.current.style.opacity = '1';
          toastRef.current.style.transform = 'translateY(0)';
          progressRef.current.style.transition = 'width 5s linear';
          // ensure starting width is 100%
          progressRef.current.style.width = '100%';
          // trigger
          requestAnimationFrame(() => {
            progressRef.current && (progressRef.current.style.width = '0%');
          });
          setTimeout(() => { if (!cancelled) setToast(null); }, 5000 + 300);
        } else {
          setTimeout(() => { if (!cancelled) setToast(null); }, 5000);
        }
      }
    })();

    return () => {
      cancelled = true;
      try { toastTl.current?.kill(); } catch (e) { }
    };
  }, [toast]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/v1/api/auth/logout", { method: "POST" });
      router.push("/loginpage");
    } catch (err) {
      console.error("Logout failed", err);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 relative">
      <Sidebar user={userData} onLogout={handleLogout} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto mr-[57px]">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <div className="w-full rounded-md bg-indigo-100 text-indigo-700 px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">Settings</h1>
                  <p className="text-sm opacity-90">Manage your account details and sign out.</p>
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <aside className="md:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold">
                  {userData?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-lg font-semibold">{userData?.username ?? userData?.username ?? 'Pengguna'}</p>
                  <p className="text-sm text-slate-500">{userData?.email ?? 'Belum ada email'}</p>
                </div>
              </div>
            </aside>

            <div className="md:col-span-2 gap-6">
              <div className="">
                <h3 className="text-md font-medium mb-5">Detail User</h3>
                {loading ? (
                  <div className="text-sm text-gray-600">Loading user...</div>
                ) : userData ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-xs text-slate-500">Name</div>
                      <div className="text-sm font-medium">{userData.name ?? userData.username ?? '-'}</div>
                    </div>
                    <div className="">
                      <div className="text-xs text-slate-500">Role</div>
                      <div className="text-sm font-medium">{userData?.isAdmin == 'YES' ? 'Administrator' : 'Staff'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">No user data available.</div>
                )}
              </div>


              <div className="my-6">
                <h3 className="text-md font-medium mb-3">Edit Profile</h3>
                <p className="text-sm text-slate-500 mb-3">Ubah password akun Anda. Isi password lama dan password baru lalu klik Simpan.</p>
                {passwordMessage && (
                  <div className="mb-3 text-sm text-center font-medium text-white bg-slate-600 px-3 py-2 rounded">{passwordMessage}</div>
                )}
                <div className="mb-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded text-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Modal (hidden by default) */}
                {isModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => { setIsModalOpen(false); setShowWarningConfirm(false); }} />
                    <div ref={modalRef} className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg transform transition-all" style={{ opacity: 0, transform: 'translateY(20px)' }}>
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-300">
                        <h4 className="text-lg font-semibold">Edit Profile</h4>
                        <button onClick={() => { setIsModalOpen(false); setShowWarningConfirm(false); }} className="text-slate-600 hover:text-slate-900">✕</button>
                      </div>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setPasswordMessage(null);
                          if (!userData?.username) {
                            setPasswordMessage('User tidak ditemukan');
                            return;
                          }
                          if (!currentPassword || !newPassword || !confirmPassword) {
                            setPasswordMessage('Semua kolom harus diisi');
                            return;
                          }
                          if (newPassword !== confirmPassword) {
                            setPasswordMessage('Password baru dan konfirmasi tidak cocok');
                            return;
                          }

                          // Show warning confirmation step inside modal
                          if (!showWarningConfirm) {
                            setShowWarningConfirm(true);
                            return;
                          }

                          setIsSubmittingPassword(true);
                          try {
                            // send current username as `current_username` and optionally a new username
                            await updateUserPassword(userData.username, currentPassword, newPassword, changeUsername || undefined);
                            setPasswordMessage('Password berhasil diupdate');
                            setToast({ type: 'success', text: 'Password berhasil diupdate' });
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setChangeUsername('');
                            setShowWarningConfirm(false);
                            setIsModalOpen(false);
                          } catch (err: any) {
                            console.error(err);
                            setPasswordMessage(err?.message || 'Gagal mengupdate password');
                            setToast({ type: 'error', text: err?.message || 'Gagal mengupdate password' });
                          } finally {
                            setIsSubmittingPassword(false);
                          }
                        }}
                        className="p-5 space-y-4"
                      >
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="text-xs text-slate-500">Change Username (optional)</label>
                            <input type="text" value={changeUsername} onChange={(e) => setChangeUsername(e.target.value)} placeholder={userData?.username || ''} className="outline-none w-full mt-1 px-3 py-2 ring-2 ring-transparent border border-slate-400 focus:border-indigo-500 focus:ring-indigo-600/40 transition-all rounded-md" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="outline-none w-full mt-1 px-3 py-2 ring-2 ring-transparent border border-slate-400 focus:border-indigo-500 focus:ring-indigo-600/40 transition-all rounded-md" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="outline-none w-full mt-1 px-3 py-2 ring-2 ring-transparent border border-slate-400 focus:border-indigo-500 focus:ring-indigo-600/40 transition-all rounded-md" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="outline-none w-full mt-1 px-3 py-2 ring-2 ring-transparent border border-slate-400 focus:border-indigo-500 focus:ring-indigo-600/40 transition-all rounded-md" />
                          </div>
                        </div>

                        {/* Warning confirmation area (step 2) */}
                        {showWarningConfirm && (
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <div className="text-yellow-600">⚠️</div>
                            <div>
                              <div className="font-medium text-sm">Warning</div>
                              <div className="text-xs text-slate-600">Anda akan mengganti password akun ini. Pastikan Anda mengingat password baru. Tindakan ini akan mengakhiri sesi lama.</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                          <button type="button" onClick={() => { setShowWarningConfirm(false); setIsModalOpen(false); }} className="cursor-pointer hover:shadow-md hover:bg-indigo-50 transition-all px-4 py-2 rounded-md border border-indigo-300 text-sm">Batal</button>
                          <button type="submit" disabled={isSubmittingPassword} className={`cursor-pointer transition-all px-4 py-2 rounded text-sm text-white ${isSubmittingPassword ? 'opacity-70' : 'hover:shadow-md hover:bg-indigo-700'} bg-indigo-600`}>{showWarningConfirm ? (isSubmittingPassword ? 'Menyimpan...' : 'Confirm & Update') : 'Lanjutkan'}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}


              </div>

              <div className="mt-6 flex items-center gap-3 justify-end">
                <button onClick={() => router.push('/dashboard/home')} className="cursor-pointer hover:shadow-md hover:bg-indigo-50 transition-all px-4 py-2 rounded-md border border-indigo-300 text-sm">Kembali</button>
                <button onClick={handleLogout} disabled={loggingOut} className={`cursor-pointer hover:shadow-md hover:bg-indigo-700 transition-all px-4 py-2 rounded-md text-sm text-white ${loggingOut ? 'opacity-70' : 'hover:bg-indigo-700'} bg-indigo-600`}>{loggingOut ? 'Logging out...' : 'Logout'}</button>
              </div>
            </div>
          </section>
        </div>
      </main>
      {/* Toast container (Sonner-like) */}
      {toast && (
        <div ref={toastRef} className="fixed top-4 right-4 z-50 w-96 max-w-full pointer-events-auto" style={{ opacity: 0, transform: 'translateY(-10px)' }}>
          <div className={`rounded-md shadow-lg overflow-hidden ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'}`}>
            <div className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-white font-medium">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}</div>
                <div className="text-sm text-white/90 mt-1">{toast.text}</div>
              </div>
              <div className="flex items-start">
                <button onClick={() => { try { toastTl.current?.kill(); } catch (e) { } setToast(null); }} className="text-white/90 hover:text-white text-sm">✕</button>
              </div>
            </div>
            <div className="h-1 bg-white/20 relative">
              <div ref={progressRef} className="absolute left-0 top-0 h-full bg-white" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;