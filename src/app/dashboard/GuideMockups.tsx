'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudDownload, 
  Coins, 
  CheckCircle2, 
  Loader2, 
  Folder, 
  Play, 
  ArrowRight, 
  Lock, 
  QrCode, 
  Cloud, 
  Check, 
  FileVideo, 
  User, 
  LogOut,
  Laptop,
  Link2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface MockupProps {
  videoSrc?: string;
}

export function GuideVideoWrapper({ videoSrc, children }: { videoSrc?: string, children: React.ReactNode }) {
  const [videoError, setVideoError] = useState(false);

  if (videoSrc && !videoError) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 shadow-2xl">
        <video 
          src={videoSrc} 
          autoPlay 
          loop 
          muted 
          playsInline 
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-md shadow-2xl flex flex-col justify-between p-4 font-sans select-none">
      {children}
    </div>
  );
}

// 1. LOGIN / LOGOUT MOCKUP
export function LoginGuideMockup({ videoSrc }: MockupProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <GuideVideoWrapper videoSrc={videoSrc}>
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          <span className="text-[10px] text-slate-500 font-mono ml-2">localhost:3001/login</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${step >= 3 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-[8px] font-bold text-slate-550 uppercase tracking-widest">
            {step >= 3 ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Main body change area */}
      <div className="flex-1 flex items-center justify-center relative py-4">
        <AnimatePresence mode="wait">
          {/* Step 0 & 1: Logged Out Interface */}
          {(step === 0 || step === 1) && (
            <motion.div 
              key="logged-out"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xs bg-slate-900/90 border border-white/5 p-5 rounded-xl shadow-xl flex flex-col items-center space-y-4"
            >
              <div className="bg-indigo-500/10 p-2.5 rounded-full border border-indigo-500/20 text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-xs font-bold text-white">Đăng nhập tài khoản</h4>
                <p className="text-[9px] text-slate-400">Vui lòng đăng nhập Google để lưu trữ credits và sử dụng tool</p>
              </div>

              <div className="w-full relative">
                <button className={`w-full bg-white text-slate-950 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${step === 1 ? 'ring-2 ring-indigo-500 scale-[0.98]' : ''}`}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.6 15.02 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.77 8.92 5.04 12 5.04z"/>
                    <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.25H12v4.25h6.45c-.28 1.48-1.12 2.73-2.39 3.58l3.7 2.87c2.16-2 3.74-4.94 3.74-8.45z"/>
                    <path fill="#FBBC05" d="M5.36 14.5a7.1 7.1 0 0 1 0-5c-.17-.5-.35-1-.53-1.5L1.5 7.5a11.9 11.9 0 0 0 0 9l3.86-2z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.08 0-5.73-2.73-6.64-5.46L1.5 15.85C3.4 19.7 7.35 23 12 23z"/>
                  </svg>
                  Sign in with Google
                </button>

                {/* Simulated Cursor */}
                {step === 1 && (
                  <motion.div 
                    initial={{ x: 120, y: 50, opacity: 0 }}
                    animate={{ x: 30, y: 12, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-4 h-4 rounded-full bg-indigo-500/40 border border-white pointer-events-none flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Loading authentication */}
          {step === 2 && (
            <motion.div 
              key="auth-loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col items-center space-y-3"
            >
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-[10px] font-mono text-slate-400">Đang xác thực thông tin từ Google...</p>
            </motion.div>
          )}

          {/* Step 3 & 4: Logged In Dashboard Header */}
          {(step === 3 || step === 4) && (
            <motion.div 
              key="logged-in"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm bg-slate-900/90 border border-white/5 rounded-xl p-4 shadow-xl flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-md border border-white/10">
                    PH
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Khách hàng VIP</h4>
                    <p className="text-[9px] text-slate-500">phu***@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-[9.5px] font-mono font-bold text-white">999 Credits</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đăng nhập thành công
                </span>

                <button className={`px-3 py-1.5 bg-slate-950 border border-white/5 hover:border-red-500/25 hover:text-red-400 rounded-lg text-[9px] font-bold text-slate-400 transition-all flex items-center gap-1 ${step === 4 ? 'bg-red-950/10 border-red-500/20 text-red-400' : ''}`}>
                  <LogOut className="w-3 h-3" />
                  Đăng xuất
                </button>
              </div>

              {/* Simulated Cursor for Logout */}
              {step === 4 && (
                <motion.div 
                  initial={{ x: 100, y: 100, opacity: 0 }}
                  animate={{ x: 250, y: 70, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute w-4 h-4 rounded-full bg-red-500/40 border border-white pointer-events-none flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visual Progress Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-indigo-500' : 'w-1 bg-white/10'}`}></div>
        ))}
      </div>
    </GuideVideoWrapper>
  );
}

// 1.5. GOOGLE LINK MOCKUP
export function GoogleLinkGuideMockup({ videoSrc }: MockupProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <GuideVideoWrapper videoSrc={videoSrc}>
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          <span className="text-[10px] text-slate-500 font-mono ml-2">Xác thực Google Drive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${step >= 4 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
          <span className="text-[8px] font-bold text-slate-550 uppercase tracking-widest">
            {step >= 4 ? 'Connected' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Main body change area */}
      <div className="flex-1 flex items-center justify-center relative py-4">
        <AnimatePresence mode="wait">
          {/* Step 0: Not connected warning */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xs bg-slate-900 border border-red-500/20 p-4.5 rounded-xl shadow-xl flex flex-col items-center space-y-3"
            >
              <div className="bg-red-500/10 p-2 rounded-full border border-red-500/20 text-red-400">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-[10.5px] font-black text-white uppercase tracking-wider">Chưa liên kết Google Drive</h4>
                <p className="text-[9px] text-slate-400">Bạn bắt buộc phải liên kết Google Drive để mở khóa tính năng tải</p>
              </div>
            </motion.div>
          )}

          {/* Step 1: Hover & Click Connect Button */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xs bg-slate-900 border border-white/5 p-4.5 rounded-xl shadow-xl flex flex-col items-center space-y-3 relative"
            >
              <button className="w-full bg-indigo-650 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2">
                <Link2 className="w-3.5 h-3.5" />
                Liên kết ngay
              </button>

              {/* Cursor indicator */}
              <motion.div 
                initial={{ x: 100, y: 60, opacity: 0 }}
                animate={{ x: 40, y: 15, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute w-4 h-4 rounded-full bg-indigo-500/40 border border-white pointer-events-none flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Error Notification on Mismatch */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-xs bg-red-950/20 border border-red-500/20 p-4 rounded-xl shadow-xl flex gap-3 text-left"
            >
              <XCircle className="w-5 h-5 text-red-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-bold text-red-400">Lỗi liên kết tài khoản</h4>
                <p className="text-[8.5px] text-slate-400 leading-relaxed mt-1">
                  Tài khoản Google Drive liên kết phải khớp với tài khoản đăng nhập (phu***@gmail.com). Vui lòng thử lại.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Connecting Loading */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-3"
            >
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <p className="text-[9.5px] font-mono text-slate-450">Đang đồng bộ hóa tài khoản Gmail...</p>
            </motion.div>
          )}

          {/* Step 4: Success Connected */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs bg-slate-900 border border-indigo-500/25 p-4.5 rounded-xl shadow-xl flex flex-col items-center space-y-3"
            >
              <div className="bg-indigo-500/10 p-2.5 rounded-full border border-indigo-500/20 text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-[10.5px] font-bold text-white uppercase tracking-wider">Liên kết thành công</h4>
                <p className="text-[9px] font-mono text-indigo-300">phu***@gmail.com</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-indigo-500' : 'w-1 bg-white/10'}`}></div>
        ))}
      </div>
    </GuideVideoWrapper>
  );
}


// 2. BUY CREDITS / SEPAY QR MOCKUP
export function BuyCreditsGuideMockup({ videoSrc }: MockupProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <GuideVideoWrapper videoSrc={videoSrc}>
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          <span className="text-[10px] text-slate-500 font-mono ml-2">Cổng thanh toán SePay</span>
        </div>
        <span className="text-[9px] font-mono text-indigo-400 font-bold bg-indigo-600/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          Nạp Tự Động
        </span>
      </div>

      {/* Body Area */}
      <div className="flex-1 flex items-center justify-center py-3 relative">
        <AnimatePresence mode="wait">
          {/* Step 0 & 1: Pricing Plan Selection */}
          {(step === 0 || step === 1) && (
            <motion.div 
              key="plan-selector"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-sm grid grid-cols-3 gap-2.5"
            >
              {[
                { name: 'Gói Lẻ', amount: '50.000đ', credits: '10 Credits' },
                { name: '1 Tháng', amount: '150.000đ', credits: 'Unlimited' },
                { name: 'Vĩnh Viễn', amount: '300.000đ', credits: 'Lifetime VIP' }
              ].map((plan, idx) => {
                const isTarget = idx === 2 && step === 1;
                return (
                  <div 
                    key={idx}
                    className={`bg-slate-900 border p-3 rounded-xl flex flex-col justify-between transition-all relative ${
                      isTarget 
                        ? 'border-indigo-500 bg-indigo-600/5 shadow-lg shadow-indigo-500/5 scale-[0.98]' 
                        : 'border-white/5'
                    }`}
                  >
                    <div>
                      <h5 className="text-[10px] font-bold text-white">{plan.name}</h5>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{plan.credits}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-indigo-400 mt-3 block">{plan.amount}</span>

                    {/* Cursor click on step 1 */}
                    {isTarget && (
                      <motion.div 
                        initial={{ x: 60, y: 60, opacity: 0 }}
                        animate={{ x: 20, y: 15, opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        className="absolute w-4 h-4 rounded-full bg-indigo-500/40 border border-white pointer-events-none flex items-center justify-center"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Step 2, 3: QR Code Scanning Screen */}
          {(step === 2 || step === 3) && (
            <motion.div 
              key="qr-scan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm flex bg-slate-900/90 border border-white/5 rounded-xl p-3 gap-4 shadow-xl"
            >
              {/* QR Container */}
              <div className="w-24 h-24 bg-white p-1.5 rounded-lg flex items-center justify-center relative shrink-0 overflow-hidden shadow-md">
                <QrCode className="w-full h-full text-slate-950" />
                
                {/* Scanner Glow Line */}
                <motion.div 
                  initial={{ top: '5%' }}
                  animate={{ top: '85%' }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"
                ></motion.div>
              </div>

              {/* Text Info */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="text-[10px] font-bold text-white">Gói Vĩnh Viễn - VIP LÀM VIỆC</h4>
                  <p className="text-[9px] text-indigo-400 font-bold font-mono mt-0.5">Giá: 300.000đ</p>
                </div>
                
                <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                  <p className="text-[7.5px] text-slate-400 uppercase font-semibold">Nội dung CK tự động:</p>
                  <p className="text-[9px] font-mono text-white select-all break-all tracking-wider mt-0.5">NAP_LIFETIME_CREDIT_user883</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Payment processing success */}
          {step === 4 && (
            <motion.div 
              key="payment-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xs bg-slate-900 border border-emerald-500/25 p-5 rounded-2xl flex flex-col items-center space-y-3 shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-center">
                <h4 className="text-xs font-bold text-white">Nạp tiền thành công!</h4>
                <p className="text-[9px] text-slate-450 mt-1">Hệ thống đã nhận giao dịch và kích hoạt VIP</p>
              </div>
              <div className="bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 text-[9.5px] font-bold text-emerald-350 font-mono">
                + VIP Vĩnh Viễn (Lifetime)
              </div>
            </motion.div>
          )}

          {/* Step 5: Screen Refresh check */}
          {step === 5 && (
            <motion.div 
              key="credits-refreshed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-xl text-center">
                <Coins className="w-5 h-5 text-yellow-500 animate-bounce" />
                <div>
                  <p className="text-[10px] text-slate-400">Hạn mức tài khoản đã tăng:</p>
                  <p className="text-xs font-mono font-black text-white">VIP VÔ HẠN (LIFETIME)</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-indigo-500' : 'w-1 bg-white/10'}`}></div>
        ))}
      </div>
    </GuideVideoWrapper>
  );
}

// 3. BYPASS & DOWNLOAD PROCESS MOCKUP
export function DownloadGuideMockup({ videoSrc }: MockupProps) {
  const [step, setStep] = useState(0);
  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        const next = (prev + 1) % 8;
        if (next === 6) setProgressVal(0);
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Update progress bar on step 6
  useEffect(() => {
    if (step === 6) {
      const progInt = setInterval(() => {
        setProgressVal(prev => {
          if (prev >= 100) {
            clearInterval(progInt);
            return 100;
          }
          return prev + 8;
        });
      }, 150);
      return () => clearInterval(progInt);
    }
  }, [step]);

  return (
    <GuideVideoWrapper videoSrc={videoSrc}>
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          <span className="text-[10px] text-slate-500 font-mono ml-2">localhost:3001/dashboard</span>
        </div>
        <span className="text-[9px] font-mono text-indigo-400 font-bold bg-indigo-600/10 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></span>
          Turbo Engine
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center py-2 relative">
        <AnimatePresence mode="wait">
          {/* Step 0, 1: Typing Drive Link */}
          {(step === 0 || step === 1) && (
            <motion.div 
              key="url-typing"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="w-full max-w-sm space-y-2 bg-slate-900 border border-white/5 p-3 rounded-xl"
            >
              <h5 className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Dán liên kết Drive</h5>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono truncate">
                  {step === 0 ? 'Dán link thư mục hoặc file bị khóa vào đây...' : 'https://drive.google.com/drive/folders/1HD7qYy6aOi...'}
                </div>
                <button className={`bg-slate-800 border border-white/5 text-white text-[9.5px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${step === 1 ? 'bg-indigo-650' : ''}`}>
                  Quét
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Scanning files */}
          {step === 2 && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <p className="text-[9.5px] font-mono text-slate-400">Đang giải mã và bypass liên kết bị chặn...</p>
            </motion.div>
          )}

          {/* Step 3, 4, 5: Check file list */}
          {(step === 3 || step === 4 || step === 5) && (
            <motion.div 
              key="file-checklist"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-sm bg-slate-900 border border-white/5 rounded-xl p-3 space-y-2.5"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                <span className="text-[9.5px] font-bold text-white">Danh sách tệp tin ({step >= 4 ? 'Đã chọn 3/3' : 'Đã phát hiện 3'})</span>
                <span className="text-[8.5px] text-slate-500 font-semibold">{step >= 4 ? 'Chọn hết' : ''}</span>
              </div>
              <div className="space-y-1">
                {[
                  { name: '1. Bài 01 - Nhập môn GDrive.mp4', size: '124 MB' },
                  { name: '2. Bài 02 - Hướng dẫn tải.mp4', size: '256 MB' },
                  { name: '3. Bài 03 - Mẹo tăng tốc.mp4', size: '98 MB' }
                ].map((f, i) => {
                  const isChecked = step >= 4;
                  return (
                    <div key={i} className="flex justify-between items-center text-[9px] bg-slate-950/60 p-1.5 rounded border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10'}`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                        </div>
                        <span className="text-slate-350 truncate max-w-[170px]">{f.name}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[8px]">{f.size}</span>
                    </div>
                  );
                })}
              </div>

              {step === 5 && (
                <div className="flex justify-end pt-1">
                  <button className="bg-indigo-650 text-white text-[9.5px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 relative">
                    Bắt đầu tải (3 file)
                    <ArrowRight className="w-3 h-3" />

                    {/* Cursor indicator */}
                    <motion.div 
                      initial={{ x: 50, y: 40, opacity: 0 }}
                      animate={{ x: 20, y: 10, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="absolute w-4 h-4 rounded-full bg-indigo-500/40 border border-white pointer-events-none flex items-center justify-center"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </motion.div>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 6: Downloading progress */}
          {step === 6 && (
            <motion.div 
              key="download-progress"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="w-full max-w-sm bg-slate-900 border border-white/5 p-4 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-end">
                <div>
                  <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[8px] font-bold">BYPASS ENGINE ACTIVE</span>
                  <h4 className="text-[10px] font-bold text-white mt-1">Đang tải xuống đa luồng (4 luồng song song)...</h4>
                </div>
                <span className="text-[14px] font-bold text-indigo-400 font-mono">{progressVal}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-150" style={{ width: `${progressVal}%` }}></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                <div className="bg-slate-950/60 p-2 rounded border border-white/5 flex flex-col">
                  <span className="text-slate-500 uppercase">Tốc độ mạng</span>
                  <span className="text-slate-200 font-mono font-bold mt-0.5">14.8 MB/s</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-white/5 flex flex-col">
                  <span className="text-slate-500 uppercase">Thời gian chờ</span>
                  <span className="text-slate-200 font-mono font-bold mt-0.5">~ 6 giây</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 7: Complete success */}
          {step === 7 && (
            <motion.div 
              key="success-notification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xs bg-slate-900 border border-emerald-500/25 p-4 rounded-xl text-center space-y-3 shadow-xl"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tải video hoàn tất!</h4>
                <p className="text-[8.5px] text-slate-450 mt-1">Đã giải mã thành công và lưu trực tiếp vào thư mục chỉ định trên máy tính của bạn.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-indigo-500' : 'w-1 bg-white/10'}`}></div>
        ))}
      </div>
    </GuideVideoWrapper>
  );
}

// 4. DRIVE AUTO UPLOAD & CLEAN UP MOCKUP
export function AutoUploadGuideMockup({ videoSrc }: MockupProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <GuideVideoWrapper videoSrc={videoSrc}>
      {/* Top Header Mockup */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          <span className="text-[10px] text-slate-500 font-mono ml-2">Đồng bộ đám mây (Cloud Sync)</span>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Tiết Kiệm Bộ Nhớ
        </span>
      </div>

      {/* Body area */}
      <div className="flex-1 flex items-center justify-center py-2 relative">
        <AnimatePresence mode="wait">
          {/* Step 0, 1: Toggling Switch */}
          {(step === 0 || step === 1) && (
            <motion.div 
              key="toggle-auto"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="w-full max-w-sm bg-slate-900 border border-white/5 p-4 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10.5px] font-bold text-white">Tự động upload lên Google Drive cá nhân</h4>
                  <p className="text-[8.5px] text-slate-500">Bypass xong sẽ tự động đẩy lên Drive và xóa tệp tạm trong máy</p>
                </div>
                
                {/* Simulated Switch */}
                <div className={`w-9 h-5 rounded-full p-0.5 relative transition-all duration-300 cursor-pointer ${step === 1 ? 'bg-indigo-650' : 'bg-slate-950'}`}>
                  <motion.div 
                    layout
                    className="w-4 w-4 bg-white rounded-full shadow-md"
                    animate={{ x: step === 1 ? 16 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  ></motion.div>
                </div>

                {/* Cursor Indicator for toggle */}
                {step === 1 && (
                  <motion.div 
                    initial={{ x: 40, y: 40, opacity: 0 }}
                    animate={{ x: 2, y: -2, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-4 h-4 rounded-full bg-indigo-500/40 border border-white pointer-events-none flex items-center justify-center right-4"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2, 3: Transmission animation */}
          {(step === 2 || step === 3) && (
            <motion.div 
              key="transmission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm flex items-center justify-between px-8 py-2 relative"
            >
              {/* Local Storage */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="w-11 h-11 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center text-slate-400">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="text-[8.5px] text-slate-400 uppercase font-semibold">Tệp Máy Tính</span>
              </div>

              {/* Data packet flying */}
              <div className="flex-1 h-0.5 bg-slate-800/40 mx-4 relative overflow-hidden">
                <motion.div 
                  initial={{ left: '0%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="absolute w-6 h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                ></motion.div>
                
                {step === 3 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0, x: -50 }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: 1, x: 50 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-1/2 -translate-y-1/2 text-indigo-400"
                  >
                    <FileVideo className="w-4 h-4" />
                  </motion.div>
                )}
              </div>

              {/* Cloud Drive */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="w-11 h-11 bg-indigo-650/15 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-400">
                  <Cloud className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[8.5px] text-indigo-400 uppercase font-semibold">My Drive (Cloud)</span>
              </div>
            </motion.div>
          )}

          {/* Step 4: Upload complete, trigger deletion animation */}
          {step === 4 && (
            <motion.div 
              key="cleanup-local"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm grid grid-cols-2 gap-4"
            >
              <div className="bg-slate-900 border border-red-500/20 p-2.5 rounded-xl flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-2 right-2 animate-ping opacity-60"></span>
                <Laptop className="w-5 h-5 text-red-400" />
                <span className="text-[8px] uppercase text-red-400 font-bold">XÓA TỆP CỤC BỘ</span>
                <p className="text-[7.5px] text-slate-500">Đã xóa video_01.mp4 tạm thời trên ổ đĩa để trống bộ nhớ.</p>
              </div>

              <div className="bg-slate-900 border border-emerald-500/20 p-2.5 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <span className="text-[8px] uppercase text-emerald-400 font-bold">LƯU TRỮ DRIVE</span>
                <p className="text-[7.5px] text-slate-500">Đã lưu trữ an toàn, vĩnh viễn trên tài khoản đám mây của bạn.</p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Clean Storage Success toast */}
          {step === 5 && (
            <motion.div 
              key="storage-freed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs bg-slate-900 border border-indigo-500/25 p-4 rounded-xl text-center space-y-2 shadow-xl"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <h5 className="text-[9.5px] font-bold text-white uppercase tracking-wider">Đã đồng bộ & Dọn dẹp ổ đĩa</h5>
              <p className="text-[8px] text-slate-450 leading-normal">Được giải phóng 100% dung lượng tệp tin rác trên máy tính sau khi đẩy lên Drive.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-indigo-500' : 'w-1 bg-white/10'}`}></div>
        ))}
      </div>
    </GuideVideoWrapper>
  );
}
