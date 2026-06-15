import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Moon, Sun, Wifi, Battery } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, theme, setTheme }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState('15:15');

  // Update clock every minute
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hrs}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="simulator-container">
      {/* Background Ornaments */}
      <div className="simulator-background-decor"></div>
      <div className="simulator-background-decor-2"></div>

      {/* Simulator Control Toolbar (Top-Left) */}
      <div className="simulator-controls">
        <button 
          className={`sim-btn ${!isFullscreen ? 'active' : ''}`} 
          onClick={() => setIsFullscreen(false)}
          title="Switch to Mobile Smartphone Frame"
        >
          <Smartphone size={16} />
          <span>Mobile View</span>
        </button>
        <button 
          className={`sim-btn ${isFullscreen ? 'active' : ''}`} 
          onClick={() => setIsFullscreen(true)}
          title="Switch to Full Width Responsive Web"
        >
          <Monitor size={16} />
          <span>Full Web View</span>
        </button>
        <button 
          className="sim-btn" 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={`Toggle ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      {/* Device Shell */}
      <div className={`phone-mockup ${isFullscreen ? 'full-web' : ''}`}>
        {!isFullscreen && (
          <>
            {/* Camera & Speaker Notch */}
            <div className="phone-notch">
              <div className="phone-camera"></div>
              <div className="phone-speaker"></div>
            </div>

            {/* Mobile Status Bar */}
            <div className="phone-status-bar">
              <span>{time}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>4G</span>
                <Wifi size={12} />
                <Battery size={14} style={{ transform: 'rotate(90deg)', margin: '0 -2px' }} />
              </div>
            </div>
          </>
        )}

        {/* The active viewport where the app renders */}
        <div className="app-viewport">
          {children}
          
          {!isFullscreen && (
            // Home Indicator line
            <div className="phone-home-indicator"></div>
          )}
        </div>
      </div>
    </div>
  );
};
