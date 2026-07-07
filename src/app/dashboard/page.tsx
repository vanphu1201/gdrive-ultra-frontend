'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LoginGuideMockup, 
  GoogleLinkGuideMockup,
  BuyCreditsGuideMockup, 
  DownloadGuideMockup, 
  AutoUploadGuideMockup 
} from './GuideMockups';
import { 
  CloudDownload, 
  LogOut, 
  Coins, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Folder, 
  Gauge, 
  Clock,
  Terminal,
  Activity,
  Trash2,
  Plus,
  QrCode,
  Power,
  FileText,
  Play,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Info,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Cloud,
  Link2
} from 'lucide-react';

interface ProgressData {
  type: 'progress' | 'finished' | 'error' | 'info' | 'credits_updated' | 'file_start';
  pct?: number;
  speed?: string;
  eta?: string;
  phase?: string;
  message?: string;
  link?: string;
  path?: string;
  remainingCredits?: number;
  credits?: number;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function Dashboard() {
  const router = useRouter();
  const getApiUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    if (url.endsWith('/')) url = url.slice(0, -1);
    if (!url.endsWith('/api')) url = `${url}/api`;
    return url;
  };
  const [session, setSession] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLifetime, setIsLifetime] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, link?: string } | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'video' | 'guide'>('video');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [customCredits, setCustomCredits] = useState<number>(10);

  // Auto-Upload & Selective Download states
  const [autoUpload, setAutoUpload] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState('');
  const [scannedFiles, setScannedFiles] = useState<any[] | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'download' | 'upload' | 'error'>('all');

  // Google Drive connection states
  const [googleLinked, setGoogleLinked] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const fetchGoogleStatus = async (token: string) => {
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/auth/google/status`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.success) {
        setGoogleLinked(data.linked);
        setGoogleEmail(data.email);
      }
    } catch (e) {
      console.error('Failed to fetch Google status:', e);
    }
  };

  const handleLinkGoogle = async () => {
    if (!session) return;
    setGoogleLoading(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/auth/google/link`, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setNotification({ type: 'error', message: data.error || 'Không thể tạo liên kết Google.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Lỗi kết nối server.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!session) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy liên kết Google Drive?')) return;
    setGoogleLoading(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/auth/google/unlink`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.success) {
        setGoogleLinked(false);
        setGoogleEmail(null);
        setNotification({ type: 'success', message: 'Đã hủy liên kết Google Drive thành công.' });
      } else {
        setNotification({ type: 'error', message: data.error || 'Không thể hủy liên kết Google.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Lỗi kết nối server.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    const lower = log.toLowerCase();
    if (logFilter === 'download') {
      return lower.includes('download') || lower.includes('aria') || lower.includes('speed') || lower.includes('%');
    }
    if (logFilter === 'upload') {
      return lower.includes('upload') || lower.includes('up lên') || lower.includes('gdrive');
    }
    if (logFilter === 'error') {
      return lower.includes('error') || lower.includes('failed') || lower.includes('lỗi');
    }
    return true;
  });

  // SePay QR Logic (Thông tin thực tế từ tài khoản của bạn)
  const BANK_ID = 'MBBank'; 
  const BANK_ACC = '0348880746'; 
  const BANK_NAME = 'TRAN VAN PHU';

  const calculatePrice = (c: number) => c * 5000;

  const plans = [
    { id: 'custom', name: 'Mua theo số lượng', amount: calculatePrice(customCredits), credits: customCredits, desc: 'Tự chọn số lượng credits', type: 'credits' },
    { id: 'month', name: 'Gói 1 Tháng', amount: 150000, credits: 'MONTH', desc: 'Tải không giới hạn trong 30 ngày', type: 'subscription' },
    { id: 'lifetime', name: 'Gói Vĩnh Viễn', amount: 300000, credits: 999999, desc: 'Tải không giới hạn, dùng trọn đời', isLifetime: true, type: 'credits' },
  ];

  useEffect(() => {
    // Check URL for Google OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const googleLinkStatus = urlParams.get('google_link');
    if (googleLinkStatus === 'success') {
      setNotification({ type: 'success', message: 'Liên kết Google Drive cá nhân thành công!' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (googleLinkStatus === 'error') {
      const desc = urlParams.get('error_description') || 'Lỗi không xác định';
      setNotification({ type: 'error', message: `Liên kết thất bại: ${desc}` });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        fetchStatus(session.access_token);
        fetchGoogleStatus(session.access_token);
      }
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [router]);

  // Reset scanned files when URL changes
  useEffect(() => {
    setScannedFiles(null);
    setSelectedFileIds([]);
  }, [url]);

  const fetchStatus = async (token: string) => {
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/user/status`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.success) {
        setCredits(data.credits);
        setIsLifetime(data.isLifetime);
        setSubscriptionExpiry(data.subscriptionExpiry);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  };

  useEffect(() => {
    let interval: any;
    if (showTopUpModal && session) {
      interval = setInterval(() => {
        fetchStatus(session.access_token);
      }, 60000); // Poll every 60s
    }
    return () => clearInterval(interval);
  }, [showTopUpModal, session]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const selectFolder = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const API_URL = getApiUrl();
      
      const res = await fetch(`${API_URL}/select-folder`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await res.json();
      if (data.path) {
        setCustomPath(data.path);
      }
    } catch (err) {
      console.error('Failed to select folder', err);
    }
  };

  const handleScanFolder = async () => {
    if (!url.trim()) return;
    setIsScanning(true);
    setScannedFiles(null);
    setSelectedFileIds([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/download/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan folder');
      if (data.success && data.files) {
        setScannedFiles(data.files);
        // Pre-select all files by default
        setSelectedFileIds(data.files.map((f: any) => f.id));
      } else {
        alert(data.error || 'Không tìm thấy tệp video nào trong thư mục.');
      }
    } catch (err: any) {
      alert(err.message || 'Quét thư mục thất bại.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (autoUpload && !googleLinked) {
      setNotification({
        type: 'error',
        message: 'Bạn bắt buộc phải liên kết tài khoản Google Drive trước khi sử dụng tính năng tải lên Drive!'
      });
      return;
    }

    if (scannedFiles && scannedFiles.length > 0 && selectedFileIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tệp để tải!');
      return;
    }

    setLoading(true);
    setNotification(null);
    setLogs(['Connecting to Ultra-Stream Core...']);
    setProgress({ type: 'info', message: 'Initializing connection...' });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const API_URL = getApiUrl();
      
      const res = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          url, 
          customPath, 
          mode: 'video',
          selectedFileIds: scannedFiles ? selectedFileIds : [],
          autoUpload,
          uploadFolderId
        })
      });

      const startData = await res.json();
      if (!res.ok) throw new Error(startData.error || 'Failed to start download');

      const downloadId = startData.downloadId;

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (abortControllerRef.current) abortControllerRef.current.abort();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let isDone = false;
      const pollProgress = async () => {
        try {
          const pollRes = await fetch(`${API_URL}/download/status/${downloadId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'ngrok-skip-browser-warning': 'true'
            },
            signal: abortController.signal
          });
          
          if (!pollRes.ok) {
            if (pollRes.status === 404) {
              return;
            }
            throw new Error('Failed to fetch download status');
          }
          
          const data = await pollRes.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to fetch progress status');
          }

          // Update progress state
          setProgress({
            type: 'progress',
            pct: data.progress,
            speed: data.speed,
            eta: data.eta,
            phase: data.phase,
            message: data.logs && data.logs.length > 0 ? data.logs[data.logs.length - 1] : ''
          });

          // Update user credits
          if (data.credits !== undefined && data.credits !== null) {
            setCredits(data.credits);
          }

          // Update logs
          if (data.logs && Array.isArray(data.logs)) {
            setLogs(data.logs);
          }

          // Handle complete / fail status
          if (data.status === 'completed') {
            isDone = true;
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            const remainingCredits = data.finishedData?.remainingCredits;
            if (remainingCredits !== undefined && remainingCredits !== null) {
              setCredits(remainingCredits);
            }
            
            const successMsg = data.finishedData?.link 
              ? 'Processing finished! Your file is ready for pickup (Note: server file will be purged after download).'
              : `Extraction complete! Files saved directly to: ${data.finishedData?.path}`;
            
            setNotification({
              type: 'success',
              message: successMsg,
              link: data.finishedData?.link
            });
            setLoading(false);
            setUrl('');
          } else if (data.status === 'failed') {
            isDone = true;
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            setNotification({ type: 'error', message: data.error || 'Error downloading' });
            setLoading(false);
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.log('Polling fetch aborted');
            return;
          }
          console.error('Polling Error:', err);
        }
      };

      // Run first poll immediately
      pollProgress();

      // Poll every 1 second
      pollIntervalRef.current = setInterval(() => {
        if (!isDone) {
          pollProgress();
        }
      }, 1000);
      
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred'
      });
      setLoading(false);
      setProgress(null);
    }
  };

  if (!session) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="w-full sticky top-0 z-50 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30">
              <CloudDownload className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 animate-pulse">
                GDRIVE <span className="text-indigo-450 font-extrabold">ULTRA</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Hệ thống online</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits Status */}
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-900 border border-white/5 pl-4 pr-3 py-2 rounded-xl shadow-inner group">
              <Coins className="w-4 h-4 text-yellow-505 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-semibold text-slate-200">
                {isLifetime ? (
                  <span className="text-indigo-405 font-bold">VIP VÔ HẠN</span>
                ) : subscriptionExpiry && new Date(subscriptionExpiry) > new Date() ? (
                  <span className="text-indigo-405 font-bold uppercase">
                    VIP đến {new Date(subscriptionExpiry).toLocaleDateString()}
                  </span>
                ) : (
                  <>
                    Hạn mức: <strong className="text-white">{credits !== null ? credits : '---'}</strong> lượt tải
                  </>
                )}
              </span>
              <button 
                onClick={() => session && fetchStatus(session.access_token)}
                disabled={loading}
                className={`p-1 rounded-md hover:bg-white/5 transition-all text-slate-400 hover:text-white ${loading ? 'animate-spin opacity-50' : ''}`}
                title="Làm mới hạn mức"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setShowTopUpModal(true)}
                className="bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                Nạp
              </button>
            </div>


            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-3.5 py-2 rounded-xl border border-white/5 text-slate-355 hover:text-white text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-450" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 ${activeTab === 'video' ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
        
        {/* Left Section: Control panel / Main Content */}
        <div className={`${activeTab === 'video' ? 'lg:col-span-2' : 'col-span-1'} space-y-6`}>
          <div className="bg-slate-900/35 border border-white/5 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Header info */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                Hệ thống bypass tải xuống Google Drive
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">
                Tải nhanh mọi tệp tin, thư mục bị khóa tải xuống hoặc giới hạn số lượng truy cập.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-slate-950/60 rounded-xl border border-white/5 mb-8 w-fit">
              <button 
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === 'video' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Play className="w-4 h-4" />
                Tải Video & Folder
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === 'guide' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Hướng dẫn sử dụng (A-Z)
              </button>
            </div>

            {activeTab === 'video' ? (
              <div className="space-y-6">
                {/* Notification Block (Always at the top) */}
                <AnimatePresence>
                  {notification && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -10 }}
                      className={`p-4.5 rounded-xl border shadow-lg text-left ${
                        notification.type === 'success' 
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
                          : 'bg-red-950/20 border-red-500/20 text-red-400'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${notification.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-white">
                            {notification.type === 'success' 
                              ? (notification.message.includes('liên kết') || notification.message.includes('Liên kết') ? 'Liên kết thành công' : 'Thao tác thành công') 
                              : (notification.message.includes('liên kết') || notification.message.includes('Liên kết') ? 'Lỗi liên kết tài khoản' : 'Gặp sự cố kết nối')}
                          </h4>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed">{notification.message}</p>
                          
                          {notification.link && !customPath && !autoUpload && (
                            <a 
                              href={notification.link} 
                              className="inline-flex items-center gap-2 mt-4 bg-indigo-650 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
                            >
                              <CloudDownload className="w-4 h-4" />
                              Tải về máy qua Browser
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Connection Card (Mandatory Top-level) */}
                <div className="bg-slate-950/40 p-5 rounded-xl border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 text-left">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        googleLinked 
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {googleLinked ? <CheckCircle2 className="w-5 h-5" /> : <Cloud className="w-5 h-5 animate-pulse" />}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">
                          {googleLinked ? 'Đã liên kết Google Drive' : 'Yêu cầu liên kết Google Drive'}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                          {googleLinked 
                            ? <span>Đã liên kết thành công với tài khoản: <strong className="text-indigo-305 font-semibold">{googleEmail}</strong>. Sẵn sàng đồng bộ hóa dữ liệu.</span>
                            : <span>Bạn bắt buộc phải liên kết Google Drive để sử dụng hệ thống. Tài khoản liên kết <strong>phải khớp 100%</strong> với Gmail đăng nhập.</span>
                          }
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex">
                      {googleLinked ? (
                        <button
                          type="button"
                          onClick={handleUnlinkGoogle}
                          disabled={googleLoading}
                          className="w-full sm:w-auto text-[10px] text-red-405 hover:text-red-300 font-bold border border-red-500/20 hover:bg-red-500/5 px-4 py-2 rounded-lg transition-all active:scale-95"
                        >
                          {googleLoading ? 'Đang hủy...' : 'Hủy liên kết'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLinkGoogle}
                          disabled={googleLoading}
                          className="w-full sm:w-auto bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-650/15 shrink-0"
                        >
                          {googleLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Đang kết nối...
                            </>
                          ) : (
                            <>
                              <Link2 className="w-3.5 h-3.5" />
                              Liên kết ngay
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`space-y-6 transition-all duration-300 ${!googleLinked ? 'opacity-35 pointer-events-none select-none relative' : ''}`}>
                  {!googleLinked && (
                    <div className="absolute inset-0 bg-slate-950/5 z-50 rounded-xl cursor-not-allowed" title="Vui lòng liên kết Google Drive trước" />
                  )}
                  <form onSubmit={handleDownload} className="space-y-6">
                  {/* Destination Settings & Auto Upload inside single clean card */}
                  <div className="bg-slate-950/40 p-5 rounded-xl border border-white/5 space-y-5">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-indigo-400" />
                      Cấu hình Tải xuống & Đồng bộ
                    </h3>

                    {/* Storage Destination */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Thư mục lưu tệp trên máy tính</label>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all">
                        <button 
                          type="button"
                          onClick={selectFolder}
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-3.5 py-2 rounded-lg text-xs font-bold border border-indigo-500/20 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Folder className="w-4 h-4" />
                          Chọn thư mục
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-200 truncate font-semibold">
                            {customPath || 'Mặc định (Tải về qua trình duyệt)'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {customPath ? 'Tệp tin được tải trực tiếp về ổ cứng máy tính của bạn' : 'Phát trực tiếp qua server để trình duyệt tải về'}
                          </p>
                        </div>
                        {customPath && (
                          <button 
                            type="button" 
                            onClick={() => setCustomPath('')}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            title="Xóa đường dẫn tự chọn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Drive Auto Upload Switch */}
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-200 block">Tự động upload lên Google Drive cá nhân</label>
                          <span className="text-[10px] text-slate-500">Bypass xong sẽ tự động tải lên đám mây của bạn và dọn dẹp bộ nhớ máy tính</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={autoUpload} 
                            onChange={(e) => setAutoUpload(e.target.checked)}
                            className="sr-only peer"
                            disabled={loading}
                          />
                          <div className="w-10 h-5 bg-slate-850 rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      
                      <AnimatePresence>
                        {autoUpload && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-3 overflow-hidden border-t border-white/5 pt-3 text-left"
                          >
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">ID Thư mục hoặc URL Drive đích (Không bắt buộc)</label>
                              <input 
                                type="text" 
                                placeholder="Để trống để lưu ngoài Thư mục gốc (My Drive) hoặc điền URL thư mục đích"
                                value={uploadFolderId}
                                onChange={(e) => setUploadFolderId(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-lg p-3 text-xs text-white placeholder-slate-650 focus:border-indigo-500/50 outline-none transition-all"
                                disabled={loading}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* URL Input Area */}
                  <div className="space-y-3 bg-slate-950/40 p-5 rounded-xl border border-white/5">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <CloudDownload className="w-4 h-4 text-indigo-400" />
                      Nhập Liên kết Google Drive
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="url" 
                          required
                          placeholder="Dán đường dẫn Tệp tin hoặc Thư mục Drive cần bypass tại đây..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 rounded-lg pl-3 pr-3 py-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        {url.trim() && (url.includes('folder') || url.includes('/drive/folders/') || url.includes('id=')) && (
                          <button
                            type="button"
                            onClick={handleScanFolder}
                            disabled={loading || isScanning}
                            className="bg-slate-800 hover:bg-slate-700 text-white border border-white/5 px-4 py-3 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                Đang quét...
                              </>
                            ) : (
                              'Quét thư mục'
                            )}
                          </button>
                        )}

                        <button 
                          type="submit" 
                          disabled={loading}
                          className="bg-indigo-650 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Đang tải...
                            </>
                          ) : (
                            <>
                              Bắt đầu tải
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scanned Files List (Table structure) */}
                  {scannedFiles && scannedFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <h3 className="font-bold text-sm text-white">Danh sách tệp tin phát hiện</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">Tìm thấy {scannedFiles.length} tệp video trong thư mục</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-white font-semibold transition-all">
                          <input 
                            type="checkbox"
                            checked={selectedFileIds.length === scannedFiles.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFileIds(scannedFiles.map((f: any) => f.id));
                              } else {
                                setSelectedFileIds([]);
                              }
                            }}
                            className="rounded border-white/10 bg-slate-900 text-indigo-605 focus:ring-0 focus:ring-offset-0"
                          />
                          Chọn tất cả
                        </label>
                      </div>
                      
                      <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar">
                        {scannedFiles.map((file: any) => {
                          const isSelected = selectedFileIds.includes(file.id);
                          return (
                            <div 
                              key={file.id} 
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                                } else {
                                  setSelectedFileIds(prev => [...prev, file.id]);
                                }
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600/5 border-indigo-500/20' 
                                  : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // parent click does job
                                  className="rounded border-white/10 bg-slate-900 text-indigo-605 focus:ring-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{file.path}</p>
                                </div>
                              </div>
                              <div className="text-right ml-3 shrink-0">
                                <span className="text-[10px] font-mono text-slate-400">{formatBytes(file.size)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-white/5 font-semibold">
                        <span>Đã chọn: <strong className="text-white">{selectedFileIds.length}</strong> / {scannedFiles.length} tệp</span>
                        <span>Dung lượng chọn: <strong className="text-white">{formatBytes(scannedFiles.filter((f: any) => selectedFileIds.includes(f.id)).reduce((acc: number, cur: any) => acc + cur.size, 0))}</strong></span>
                      </div>
                    </motion.div>
                  )}
                </form>

                {/* Progress Indicators */}
                <AnimatePresence>
                  {loading && progress && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-slate-950/40 p-5 rounded-xl border border-white/5 space-y-4"
                    >
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="bg-indigo-600/10 text-indigo-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-indigo-500/20">
                            {progress.message || progress.phase || 'Đang phân tích'}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-2">
                            Tiến Trình Xử Lý Đa Luồng (Bypass Engine Active)
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Tốc độ</p>
                          <span className="text-lg font-bold text-white tabular-nums tracking-tight">
                            {Math.floor(progress.pct || 0)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.pct || 0}%` }}
                          transition={{ type: 'spring', damping: 25, stiffness: 45 }}
                          className="h-full bg-indigo-500 rounded-full"
                        ></motion.div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-900/60 rounded-lg p-3 border border-white/5 flex items-center gap-3">
                          <Gauge className="w-4 h-4 text-emerald-450 shrink-0" />
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Băng thông</p>
                            <p className="text-xs font-mono font-bold text-slate-200">{progress.speed || '---'}</p>
                          </div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg p-3 border border-white/5 flex items-center gap-3">
                          <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Thời gian chờ</p>
                            <p className="text-xs font-mono font-bold text-slate-200">{progress.eta || '---'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 py-4"
              >
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950/40 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-md">
                  <div className="space-y-2.5 max-w-xl text-left">
                    <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Cẩm Nang Hướng Dẫn Sử Dụng
                    </span>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-indigo-400" />
                      GDRIVE ULTRA A-Z
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Hướng dẫn chi tiết toàn bộ tính năng, quy trình vận hành bypass, cơ chế quản lý lượt tải và cách nạp credit tự động. Xem minh họa trực quan bằng hình động bên dưới.
                    </p>
                  </div>
                  
                  {/* Decorative Stat Card */}
                  <div className="bg-slate-950/80 border border-white/5 p-5 rounded-xl text-center space-y-1 shrink-0 w-full sm:w-48 shadow-lg">
                    <Activity className="w-5 h-5 text-indigo-400 mx-auto animate-pulse" />
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hỗ Trợ Bypass</h5>
                    <p className="text-base font-extrabold text-white font-mono">100% Secure</p>
                    <span className="text-[8.5px] text-indigo-455 font-bold">Auto Update Enabled</span>
                  </div>
                </div>

                {/* Step 1: Login / Sign Up */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-white/5 pb-10">
                  <div className="space-y-4 text-left order-1 lg:order-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs">01</span>
                      <h4 className="text-lg font-bold text-white">Đăng nhập tài khoản</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed sm:text-[13px]">
                      Hệ thống đồng bộ toàn bộ hạn mức tải (Credits) và trạng thái VIP của bạn thông qua tài khoản đăng nhập (Hỗ trợ Google Auth và Email/Password).
                    </p>
                    <ul className="space-y-2 text-xs text-slate-400 pl-1 list-disc list-inside">
                      <li>Sử dụng tài khoản Google hoặc đăng ký bằng Email để bắt đầu.</li>
                      <li>Hạn mức tải và các gói VIP sẽ được cộng dồn trực tiếp vào tài khoản đăng nhập này.</li>
                      <li>Để đăng xuất hoặc chuyển đổi tài khoản, nhấp nút <strong>Đăng xuất</strong> ở góc trên bên phải.</li>
                    </ul>
                  </div>
                  <div className="order-2 lg:order-2">
                    <LoginGuideMockup videoSrc="/assets/guide/login.mp4" />
                  </div>
                </div>

                {/* Step 2: Google Link (Mandatory) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-white/5 pb-10">
                  <div className="order-2 lg:order-1">
                    <GoogleLinkGuideMockup videoSrc="/assets/guide/googlelink.mp4" />
                  </div>
                  <div className="space-y-4 text-left order-1 lg:order-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs">02</span>
                      <h4 className="text-lg font-bold text-white">Liên kết Google Drive (Bắt buộc)</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed sm:text-[13px]">
                      Để bảo vệ tài nguyên và chống lạm dụng, bạn bắt buộc phải liên kết tài khoản Google Drive cá nhân để mở khóa các tính năng của website.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-400 pl-1 list-disc list-inside">
                      <li>Bấm nút <strong>Liên kết ngay</strong> trên bảng cấu hình Google Drive.</li>
                      <li>Tài khoản Google Drive liên kết <strong>phải khớp 100%</strong> với email tài khoản Gmail đăng nhập.</li>
                      <li>Nếu email không khớp, hệ thống sẽ chặn liên kết và hiển thị thông báo lỗi chi tiết ở đầu trang dashboard.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3: Buy Credits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-white/5 pb-10">
                  <div className="space-y-4 text-left order-1 lg:order-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs">03</span>
                      <h4 className="text-lg font-bold text-white">Nạp gói & Tăng Credits tự động</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed sm:text-[13px]">
                      Để tải tệp tin, tài khoản cần có số dư Credits hoặc đăng ký các gói VIP (VIP Tuần, VIP Tháng, VIP Vĩnh Viễn).
                    </p>
                    <ul className="space-y-2 text-xs text-slate-400 pl-1 list-disc list-inside">
                      <li>Bấm nút <strong>Nạp gói</strong> trên thanh công cụ để xem danh sách các gói dịch vụ.</li>
                      <li>Quét mã QR SePay để hệ thống tự động nhận diện giao dịch.</li>
                      <li>Hạn mức và trạng thái VIP sẽ tự động được kích hoạt trong vòng 1-3 phút. Giữ nguyên nội dung chuyển khoản tự động.</li>
                    </ul>
                  </div>
                  <div className="order-2 lg:order-2">
                    <BuyCreditsGuideMockup videoSrc="/assets/guide/credits.mp4" />
                  </div>
                </div>

                {/* Step 4: Bypass & Download */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-white/5 pb-10">
                  <div className="order-2 lg:order-1">
                    <DownloadGuideMockup videoSrc="/assets/guide/download.mp4" />
                  </div>
                  <div className="space-y-4 text-left order-1 lg:order-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs">04</span>
                      <h4 className="text-lg font-bold text-white">Quy trình Bypass & Tải về máy</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed sm:text-[13px]">
                      Vượt giới hạn tải và xem của các file Google Drive bị khóa, bị giới hạn xem hoặc bị chặn tải xuống.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-400 pl-1 list-disc list-inside">
                      <li>Dán URL tệp tin đơn lẻ hoặc URL thư mục Drive vào ô nhập liệu.</li>
                      <li>Bấm <strong>Quét thư mục</strong> để trích xuất danh sách video (nếu là đường dẫn thư mục).</li>
                      <li>Chọn các tệp cần tải và bấm <strong>Bắt đầu tải</strong> để hệ thống tiến hành bypass đa luồng.</li>
                      <li>Sau khi hoàn tất, bấm nút <strong>Tải về máy qua Browser</strong> xuất hiện ở thông báo để lưu về thiết bị.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 5: Auto-Upload Drive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pb-4">
                  <div className="space-y-4 text-left order-1 lg:order-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs">05</span>
                      <h4 className="text-lg font-bold text-white">Tự động đồng bộ lên Drive cá nhân</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed sm:text-[13px]">
                      Chuyển tiếp trực tiếp các file bypass về tài khoản đám mây Google Drive cá nhân của bạn mà không tốn tài nguyên ổ cứng của máy tính.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-400 pl-1 list-disc list-inside">
                      <li>Bật công tắc <strong>Tự động upload lên Google Drive cá nhân</strong> trong phần cấu hình.</li>
                      <li>*(Tùy chọn)* Điền URL thư mục Google Drive đích muốn lưu, hoặc để trống để lưu vào thư mục gốc (My Drive) của bạn.</li>
                      <li>Tất cả file sau khi bypass xong sẽ được tự động đồng bộ thẳng lên tài khoản Drive của bạn và hệ thống tự động dọn sạch dung lượng đĩa đệm.</li>
                    </ul>
                  </div>
                  <div className="order-2 lg:order-2">
                    <AutoUploadGuideMockup videoSrc="/assets/guide/autoupload.mp4" />
                  </div>
                </div>
                {/* Troubleshoot Panel */}
                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 space-y-4 text-left">
                  <h4 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    6. Khắc phục các sự cố thường gặp
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div className="space-y-1.5">
                      <p className="font-bold text-white">Lỗi quyền lưu tệp (Permission Denied):</p>
                      <p className="text-slate-400">Hãy chạy phần mềm dưới quyền Administrator hoặc cấu hình lưu sang ổ đĩa khác (D:, E:, Desktop...) thay vì lưu vào các thư mục hệ thống tại ổ đĩa cài Windows C:.</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-bold text-white">Gián đoạn tải lên Drive (Auto-Upload Failed):</p>
                      <p className="text-slate-400">Đảm bảo kết nối internet ổn định và tài khoản đích của bạn không bị đầy dung lượng lưu trữ cho phép. Bạn có thể kiểm tra tab Nhật ký để xem chi tiết log lỗi.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Section: Activity log (1/3 width) */}
        {activeTab === 'video' && (
          <div className="lg:col-span-1">
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl h-[550px] lg:h-[calc(100vh-120px)] lg:sticky lg:top-28 flex flex-col shadow-xl backdrop-blur-md">
              {/* Log Panel Header */}
              <div className="p-4.5 border-b border-white/10 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-350">
                    <Terminal className="w-4.5 h-4.5 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">Nhật ký hoạt động</span>
                  </div>
                  <button 
                    onClick={() => setLogs([])}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition-all flex items-center gap-1 active:scale-95"
                    title="Xóa nhật ký"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa log</span>
                  </button>
                </div>

                {/* Log Filter Badges */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setLogFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                      logFilter === 'all' 
                        ? 'bg-slate-800 text-white border border-white/10 shadow-sm' 
                        : 'bg-slate-950/40 text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setLogFilter('download')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                      logFilter === 'download' 
                        ? 'bg-indigo-650/20 text-indigo-300 border border-indigo-500/30 shadow-sm' 
                        : 'bg-slate-950/40 text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Tải về
                  </button>
                  <button
                    onClick={() => setLogFilter('upload')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                      logFilter === 'upload' 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-sm' 
                        : 'bg-slate-950/40 text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Tải lên
                  </button>
                  <button
                    onClick={() => setLogFilter('error')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                      logFilter === 'error' 
                        ? 'bg-red-500/15 text-red-300 border border-red-500/25 shadow-sm' 
                        : 'bg-slate-950/40 text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Lỗi
                  </button>
                </div>
              </div>

              {/* Logs List Container */}
              <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4.5 font-mono text-[10px] leading-relaxed space-y-2.5 custom-scrollbar overflow-x-hidden">
                {filteredLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-3.5 select-none animate-fadeIn">
                    <Terminal className="w-8 h-8 text-slate-700 stroke-[1.5] animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Chưa có hoạt động</p>
                      <p className="text-[10px] text-slate-500 max-w-[200px] leading-normal">
                        Bắt đầu tải xuống hoặc quét thư mục để xem log hoạt động thời gian thực.
                      </p>
                    </div>
                  </div>
                )}
                {filteredLogs.map((log, i) => {
                  const lower = log.toLowerCase();
                  let dotColor = 'bg-slate-600';
                  let textColor = 'text-slate-400';
                  
                  if (lower.includes('error') || lower.includes('failed') || lower.includes('lỗi')) {
                    dotColor = 'bg-red-500';
                    textColor = 'text-red-400';
                  } else if (lower.includes('upload') || lower.includes('up lên') || lower.includes('gdrive')) {
                    dotColor = 'bg-emerald-500';
                    textColor = 'text-emerald-350';
                  } else if (lower.includes('download') || lower.includes('aria') || lower.includes('speed') || lower.includes('%')) {
                    dotColor = 'bg-blue-505';
                    textColor = 'text-blue-300';
                  } else if (lower.includes('connect') || lower.includes('initial') || lower.includes('success')) {
                    dotColor = 'bg-indigo-500';
                    textColor = 'text-slate-300';
                  }

                  return (
                    <div key={i} className={`flex items-start gap-2.5 pl-2.5 py-1 transition-colors hover:bg-white/2 border-l border-white/5 break-all whitespace-pre-wrap ${textColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`}></span>
                      <span className="flex-1">{log}</span>
                    </div>
                  );
                })}
              </div>

              {/* Log Panel Footer */}
              <div className="p-3 bg-slate-950/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase px-1.5 select-none">
                  <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
                  <span>Trực tiếp (Real-time Link Enabled)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Top Up / Billing Modal */}
      <AnimatePresence>
        {showTopUpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTopUpModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="w-full max-w-4xl bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Package Select */}
                <div className="flex-1 space-y-5">
                  <h3 className="text-xl font-extrabold text-white">
                    Nạp lượt tải (Credits)
                  </h3>
                  <p className="text-slate-400 text-xs -mt-2">
                    Lựa chọn gói nạp phù hợp để tăng hạn mức lượt tải của bạn
                  </p>
                  
                  <div className="grid gap-3.5 mt-4">
                    {plans.map(plan => (
                      <div key={plan.id} className="space-y-3">
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className={`w-full p-4 rounded-xl border transition-all text-left group ${
                            selectedPlan?.id === plan.id 
                              ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/5' 
                              : 'bg-slate-950/60 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-bold ${selectedPlan?.id === plan.id ? 'text-indigo-400' : 'text-white'}`}>
                              {plan.name}
                            </span>
                            <span className="text-sm font-mono font-bold text-white">
                              {plan.id === 'custom' ? calculatePrice(customCredits).toLocaleString() : plan.amount.toLocaleString()}đ
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{plan.desc}</p>
                        </button>
                        
                        {plan.id === 'custom' && selectedPlan?.id === 'custom' && (
                          <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-lg border border-white/5 animate-in fade-in slide-in-from-top-1.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Số lượng:</span>
                            <input 
                              type="number" 
                              min="1"
                              value={customCredits}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setCustomCredits(val);
                                setSelectedPlan({...plan, amount: calculatePrice(val), credits: val});
                              }}
                              className="bg-transparent text-white font-mono text-base border-b border-indigo-500/40 focus:border-indigo-500 outline-none w-20 text-center"
                            />
                            <span className="text-xs text-indigo-450 font-semibold">Credits</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Display */}
                <div className="w-full md:w-[320px] bg-slate-950/50 rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                  {selectedPlan ? (
                    <>
                      <div className="bg-white p-3 rounded-xl mb-4 shadow-xl">
                        <img 
                          src={`https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_ID}&amount=${selectedPlan.amount}&des=NAP_${selectedPlan.credits}_CREDIT_${session?.user?.id?.slice(0, 8)}`} 
                          alt="SePay QR Code"
                          className="w-40 h-40"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-0.5">{BANK_NAME}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-4 uppercase tracking-wider">{BANK_ID} - {BANK_ACC}</p>
                      
                      <div className="w-full p-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-left">
                        <p className="text-[9px] text-indigo-400 uppercase font-bold mb-1">Nội dung chuyển khoản chính xác:</p>
                        <p className="text-xs font-mono text-white select-all break-all bg-slate-950 p-2 rounded border border-white/5">
                          NAP_{selectedPlan.credits}_CREDIT_{session?.user?.id?.slice(0, 8)}
                        </p>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-4 italic">Nạp tiền tự động, hệ thống sẽ cộng lượt tải sau 1 - 3 phút chuyển khoản.</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-600 p-8">
                      <QrCode className="w-16 h-16 opacity-15" />
                      <p className="text-xs font-semibold uppercase tracking-wider">Chọn gói nạp để hiển thị mã QR</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
