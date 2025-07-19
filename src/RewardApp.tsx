import React, { useState, useEffect, useRef } from 'react';

// Declare Google AdSense types
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface User {
  email: string;
  coins: number;
  adsWatched: number;
  hasWithdrawn: boolean;
  phoneNumber?: string;
}

interface AdContent {
  title: string;
  description: string;
  category: string;
  duration: number;
  videoUrl: string;
}

const ads: AdContent[] = [
  {
    title: "Nike - Just Do It",
    description: "Experience the power of determination with Nike's latest athletic gear. Push your limits and achieve greatness with every step.",
    category: "Sports & Fitness",
    duration: 15,
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
  },
  {
    title: "Coca-Cola - Taste the Feeling",
    description: "Refresh your world with the classic taste of Coca-Cola. Share happiness and create unforgettable moments with friends and family.",
    category: "Food & Beverage",
    duration: 15,
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4"
  },
  {
    title: "Apple iPhone - Think Different",
    description: "Discover the future of technology with the latest iPhone. Revolutionary features that change how you connect, create, and explore.",
    category: "Technology",
    duration: 15,
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4"
  }
];

const RewardApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'ad' | 'withdraw' | 'otp'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Ad watching state
  const [currentAd, setCurrentAd] = useState<AdContent | null>(null);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  
  // Withdrawal state
  const [withdrawalForm, setWithdrawalForm] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: ''
  });
  const [withdrawalMessage, setWithdrawalMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Ad loading state
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState('');
  const [adReady, setAdReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Timer for ad watching
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatchingAd && adTimeRemaining > 0) {
      interval = setInterval(() => {
        setAdTimeRemaining(prev => {
          if (prev <= 1) {
            // Ad finished
            setIsWatchingAd(false);
            setCurrentPage('dashboard');
            setCanSkip(false);
            if (user) {
              const newCoins = user.coins + 1;
              const updatedUser = {
                ...user,
                coins: newCoins,
                adsWatched: user.adsWatched + 1
              };
              setUser(updatedUser);
              localStorage.setItem('rewardUser', JSON.stringify(updatedUser));
              
              // Check for checkpoint notification
              if (newCoins === 100 || newCoins % 100 === 0) {
                setNotificationMessage(`🎉 Congratulations! You have collected ${newCoins} coins! You may withdraw it now.`);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 5000);
              }
            }
            
            // Reset video
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWatchingAd, adTimeRemaining, user]);

  // Initialize Google AdMob
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      window.adsbygoogle = [];
    }
  }, []);

  // Load rewarded video ad
  const loadRewardedAd = () => {
    setIsAdLoading(true);
    setAdError('');
    
    try {
      // Push ad configuration to AdSense
      if (window.adsbygoogle) {
        window.adsbygoogle.push({
          google_ad_client: "ca-pub-3689581405597356",
          enable_page_level_ads: true
        });
        
        // Simulate ad loading (in real implementation, this would be handled by AdMob SDK)
        setTimeout(() => {
          setIsAdLoading(false);
          setAdReady(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading ad:', error);
      setAdError('Failed to load advertisement. Please try again.');
      setIsAdLoading(false);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rewardUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter both email and password');
      return;
    }
    if (loginForm.password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }

    // Check if user exists
    const savedUser = localStorage.getItem('rewardUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.email === loginForm.email) {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
        setLoginError('');
        return;
      }
    }

    // Create new user
    const newUser: User = {
      email: loginForm.email,
      coins: 0,
      adsWatched: 0,
      hasWithdrawn: false
    };
    setUser(newUser);
    localStorage.setItem('rewardUser', JSON.stringify(newUser));
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    setLoginError('');
  };

  const handleGoogleLogin = () => {
    // Simulate Google login
    const googleUser: User = {
      email: 'user@gmail.com',
      coins: 0,
      adsWatched: 0,
      hasWithdrawn: false
    };
    setUser(googleUser);
    localStorage.setItem('rewardUser', JSON.stringify(googleUser));
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    setLoginError('');
  };

  const handleWatchAd = () => {
    if (adReady) {
      // Show the ad
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      setCurrentAd(randomAd);
      setAdTimeRemaining(randomAd.duration);
      setIsWatchingAd(true);
      setCurrentPage('ad');
      setAdReady(false);
      setCanSkip(false);
    } else {
      // Load ad first
      loadRewardedAd();
    }
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (user.coins < 100) {
      setWithdrawalMessage('You need at least 100 coins to withdraw for the first time.');
      return;
    }

    if (!withdrawalForm.email || !withdrawalForm.cardNumber || !withdrawalForm.expiryDate || 
        !withdrawalForm.cvv || !withdrawalForm.cardholderName || !withdrawalForm.phoneNumber) {
      setWithdrawalMessage('Please fill in all required details.');
      return;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setCurrentPage('otp');
    setWithdrawalMessage(`OTP sent to ${withdrawalForm.phoneNumber}: ${otp}`);
  };

  const handleOtpVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === generatedOtp) {
      // Successful withdrawal
      if (user) {
        const updatedUser = {
          ...user,
          coins: 0,
          hasWithdrawn: true
        };
        setUser(updatedUser);
        localStorage.setItem('rewardUser', JSON.stringify(updatedUser));
        setWithdrawalMessage(`Successfully withdrawn ${user.coins} coins to card ending in ${withdrawalForm.cardNumber.slice(-4)}`);
        setWithdrawalForm({ email: '', cardNumber: '', expiryDate: '', cvv: '', cardholderName: '', phoneNumber: '' });
        setOtpCode('');
        setCurrentPage('dashboard');
      }
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('login');
    setLoginForm({ email: '', password: '' });
    localStorage.removeItem('rewardUser');
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, '0')}s`;
  };

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-purple-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-purple-500/30 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">🎁 Reward System</h1>
            <p className="text-purple-300">Login to your reward account</p>
            <p className="text-purple-400 text-sm">If not registered, create one</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Password</label>
              <input
                type="password"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="Enter your password (min 6 characters)"
                required
                minLength={6}
              />
            </div>
            {loginError && (
              <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm backdrop-blur-sm">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              Login / Sign Up
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/80 text-purple-300">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full bg-white/90 hover:bg-white text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm shadow-lg"
            >
              <span>🔍</span>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Page
  if (currentPage === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-purple-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-purple-500/30 relative z-10">
          <h1 className="text-2xl font-bold mb-6 text-center">📱 OTP Verification</h1>
          <p className="text-purple-300 text-center mb-6">
            Enter the 6-digit OTP sent to {withdrawalForm.phoneNumber}
          </p>
          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">OTP Code</label>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            {otpError && (
              <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm backdrop-blur-sm">
                {otpError}
              </div>
            )}
            {withdrawalMessage && (
              <div className="bg-blue-900/50 border border-blue-500/30 rounded-lg p-3 text-blue-300 text-sm backdrop-blur-sm">
                {withdrawalMessage}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              Verify & Withdraw
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('withdraw')}
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              Back to Withdrawal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Ad Watching Page
  if (currentPage === 'ad' && currentAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative">
        <div className="absolute inset-0 bg-purple-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-4 border-b border-purple-500/30 relative z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">📺 Advertisement</h1>
            <div className="flex items-center space-x-4">
              <div className="text-red-400 font-mono text-lg bg-red-900/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                ⏱️ {formatTime(adTimeRemaining)}
              </div>
              <div className="text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-lg backdrop-blur-sm">💰 {user?.coins} coins</div>
            </div>
          </div>
        </div>

        {/* Ad Content */}
        <div className="max-w-4xl mx-auto p-8 relative z-10">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 mb-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-blue-400 bg-blue-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {currentAd.category} • AdMob Rewarded Video
              </div>
              <div className="text-sm text-purple-300">
                Ad {user?.adsWatched + 1} of ∞
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">{currentAd.title}</h2>
            <p className="text-purple-200 text-base leading-relaxed">{currentAd.description}</p>
          </div>

          {/* Google AdMob Ad Container */}
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-xl overflow-hidden mb-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              {/* AdMob Rewarded Video Ad Slot */}
              <div className="w-full h-full relative">
                {/* Google AdSense Ad Unit */}
                <ins className="adsbygoogle w-full h-full block"
                     style={{ display: 'block' }}
                     data-ad-client="ca-pub-3689581405597356"
                     data-ad-slot="6536518954"
                     data-ad-format="auto"
                     data-full-width-responsive="true">
                </ins>
                
                {/* Ad Overlay with Timer */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent pointer-events-none">
                  <div className="absolute top-4 right-4 bg-purple-900/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-mono border border-purple-500/30">
                    ⏱️ {formatTime(adTimeRemaining)}
                  </div>
                  <div className="absolute top-4 left-4 bg-green-900/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-green-500/30">
                    📱 Google AdMob
                  </div>
                </div>
                
                {/* Fallback content when ad doesn't load */}
                <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800/50 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📺</div>
                    <div className="text-xl font-bold mb-2">Rewarded Video Ad</div>
                    <div className="text-purple-300">Powered by Google AdMob</div>
                    <div className="text-sm text-purple-400 mt-2">Ad Unit: ca-app-pub-3689581405597356/6536518954</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-800/50 rounded-full h-4 mb-6 border border-purple-500/30 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-green-500 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2 shadow-lg shadow-purple-500/25"
              style={{ width: `${((15 - adTimeRemaining) / 15) * 100}%` }}
            >
              {adTimeRemaining <= 5 && (
                <span className="text-white text-xs font-bold">
                  {Math.round(((15 - adTimeRemaining) / 15) * 100)}%
                </span>
              )}
            </div>
          </div>

          <div className="text-center text-purple-300 bg-gray-900/80 backdrop-blur-xl p-4 rounded-lg border border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-purple-400 mb-1">📱 AdMob</div>
                <div>Full 15 seconds required</div>
              </div>
              <div className="text-center">
                <div className="text-pink-400 mb-1">🎯 Real Ads</div>
                <div>Google advertising network</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 mb-1">💰 Reward</div>
                <div>1 coin when complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Withdrawal Page
  if (currentPage === 'withdraw') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative">
        <div className="absolute inset-0 bg-purple-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-4 border-b border-purple-500/30 relative z-10">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="text-purple-400 hover:text-purple-300 flex items-center space-x-2 transition-colors"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-lg backdrop-blur-sm">💰 {user?.coins} coins</span>
              <span className="text-purple-300">{user?.email}</span>
              <button 
                onClick={handleLogout} 
                className="text-red-400 hover:text-red-300 bg-red-900/50 px-3 py-1 rounded-lg transition-colors backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="max-w-md mx-auto p-8 relative z-10">
          <h1 className="text-3xl font-bold mb-6 text-center">💳 Withdraw Coins</h1>
          
          {user && user.coins < 100 && (
            <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <h3 className="text-red-300 font-bold mb-2">⚠️ Minimum Withdrawal Required</h3>
              <p className="text-red-300">You need at least 100 coins to withdraw for the first time.</p>
              <p className="text-red-400 text-sm mt-1">
                Current coins: {user.coins} | Need: {100 - user.coins} more coins
              </p>
            </div>
          )}

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                value={withdrawalForm.email}
                onChange={e => setWithdrawalForm({...withdrawalForm, email: e.target.value})}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                value={withdrawalForm.phoneNumber}
                onChange={e => setWithdrawalForm({...withdrawalForm, phoneNumber: e.target.value})}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Cardholder Name</label>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                value={withdrawalForm.cardholderName}
                onChange={e => setWithdrawalForm({...withdrawalForm, cardholderName: e.target.value})}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Card Number</label>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono backdrop-blur-sm"
                value={withdrawalForm.cardNumber}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                  setWithdrawalForm({...withdrawalForm, cardNumber: value});
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Expiry Date</label>
                <input
                  type="text"
                  className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono backdrop-blur-sm"
                  value={withdrawalForm.expiryDate}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                    setWithdrawalForm({...withdrawalForm, expiryDate: value});
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">CVV</label>
                <input
                  type="text"
                  className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono backdrop-blur-sm"
                  value={withdrawalForm.cvv}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setWithdrawalForm({...withdrawalForm, cvv: value});
                  }}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!user || user.coins < 100}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-green-500/25"
            >
              {user && user.coins >= 100 ? 'Send OTP & Proceed' : 'Need 100 Coins to Withdraw'}
            </button>
          </form>

          {withdrawalMessage && (
            <div className="mt-4 p-4 bg-green-900/50 border border-green-500/30 rounded-lg text-green-300 backdrop-blur-sm">
              ✅ {withdrawalMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative">
      <div className="absolute inset-0 bg-purple-900/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-600/90 backdrop-blur-xl text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-pulse border border-green-500/30">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Checkpoint Reached!</p>
              <p className="text-sm">{notificationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Profile */}
      <div className="bg-gray-900/80 backdrop-blur-xl p-4 border-b border-purple-500/30 relative z-10">
        <div className="flex justify-between items-center">
          {/* Left side - Progress Tracker */}
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-purple-500/30 backdrop-blur-sm">
              <div className="text-yellow-400 font-bold text-lg">
                💰 {user?.coins || 0}/1000
              </div>
              <div className="text-xs text-purple-300">Coins Collected</div>
            </div>
            <div className="bg-blue-900/50 px-3 py-2 rounded-lg border border-blue-500/30 backdrop-blur-sm">
              <div className="text-blue-300 font-semibold">
                🎯 100 coins (checkpoint)
              </div>
              <div className="text-xs text-blue-400">Withdrawal Available</div>
            </div>
          </div>

          {/* Right side - Profile */}
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 bg-yellow-900 px-3 py-2 rounded-lg font-semibold">
              💰 {user?.coins} coins
            </div>
            <div className="bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-purple-500/30">
              <span className="text-purple-300 text-sm">👤 {user?.email}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-400 hover:text-red-300 bg-red-900/50 px-3 py-2 rounded-lg transition-colors backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-yellow-400">{user?.coins}</div>
              <div className="text-purple-300">Total Coins</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
            <div className="text-center">
              <div className="text-3xl mb-2">📺</div>
              <div className="text-2xl font-bold text-blue-400">{user?.adsWatched}</div>
              <div className="text-purple-300">Ads Watched</div>
            </div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-green-400">
                {user && user.coins >= 100 ? '✅' : `${user ? 100 - user.coins : 100}`}
              </div>
              <div className="text-purple-300">
                {user && user.coins >= 100 ? 'Can Withdraw' : 'Coins to Withdraw'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress to Withdrawal */}
        {user && user.coins < 100 && (
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 mb-8 border border-purple-500/30">
            <h3 className="text-lg font-bold mb-4">🎯 Progress to First Withdrawal</h3>
            <div className="bg-gray-800/50 rounded-full h-4 mb-2 border border-purple-500/20">
              <div 
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-green-500 h-4 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/25"
                style={{ width: `${(user.coins / 100) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-purple-300">
              <span>{user.coins} coins earned</span>
              <span>{100 - user.coins} coins remaining</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleWatchAd}
            disabled={isAdLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 border-2 border-purple-500/50 shadow-lg shadow-purple-500/25"
          >
            <div className="text-4xl mb-2">📺</div>
            <div className="text-xl mb-1">
              {isAdLoading ? 'Loading Ad...' : adReady ? 'Watch Advertisement' : 'Load Advertisement'}
            </div>
            <div className="text-sm opacity-80">
              {isAdLoading ? 'Preparing Google AdMob ad' : 'Earn 1 coin • 15 seconds • Real ads'}
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('withdraw')}
            disabled={!user || user.coins < 100}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 border-2 border-green-500/50 disabled:border-gray-500/50 shadow-lg shadow-green-500/25"
          >
            <div className="text-4xl mb-2">💳</div>
            <div className="text-xl mb-1">Withdraw Coins</div>
            <div className="text-sm opacity-80">
              {user && user.coins >= 100 ? 'Ready to withdraw!' : 'Need 100 coins minimum'}
            </div>
          </button>
        </div>

        {/* Ad Status */}
        {(isAdLoading || adError) && (
          <div className="mt-6 bg-gray-900/80 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
            {isAdLoading && (
              <div className="flex items-center space-x-3 text-blue-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span>Loading Google AdMob rewarded video ad...</span>
              </div>
            )}
            {adError && (
              <div className="flex items-center space-x-3 text-red-400">
                <span>⚠️</span>
                <span>{adError}</span>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-bold mb-4">📋 How it Works (Google AdMob Integration)</h3>
          <div className="space-y-2 text-purple-200">
            <div className="flex items-center space-x-3">
              <span className="text-purple-400">1️⃣</span>
              <span>Watch real Google AdMob rewarded video advertisements to earn coins</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-purple-400">2️⃣</span>
              <span>Each completed ad gives you 1 coin</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-purple-400">3️⃣</span>
              <span>Collect 100 coins to unlock withdrawal</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-purple-400">4️⃣</span>
              <span>Provide details and verify OTP to withdraw</span>
            </div>
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <div className="text-blue-300 text-sm">
                <strong>📱 AdMob Integration:</strong> Using ad unit ID ca-app-pub-3689581405597356/6536518954 for real Google advertisements
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardApp;