import React from 'react';
import UnityPlayer from '../components/UnityPlayer';
import '../styles/VirtualTour.css';

function VirtualTour() {
  return (
    <div className="virtual-tour-page">
      <div className="virtual-tour-container">
        <div className="virtual-tour-header-section">
          <h1 className="virtual-tour-title">Virtual Tour 3D</h1>
          <p className="virtual-tour-description">
            Jelajahi ruangan interaktif dalam pengalaman 3D yang immersive
          </p>
        </div>

        <div className="virtual-tour-player-section">
          <UnityPlayer />
        </div>

        <div className="virtual-tour-info">
          <div className="info-card">
            <h3>🎮 Controls</h3>
            <p><strong>Desktop:</strong> WASD atau Arrow Keys untuk bergerak</p>
            <p><strong>Mobile:</strong> Gunakan tombol D-Pad atau swipe pada layar</p>
          </div>
          <div className="info-card">
            <h3>🖱️ Navigation</h3>
            <p>Gunakan mouse untuk melihat sekeliling</p>
            <p>Klik pada objek untuk berinteraksi</p>
          </div>
          <div className="info-card">
            <h3>💡 Tips</h3>
            <p>Untuk pengalaman terbaik, gunakan browser modern</p>
            <p>Fullscreen mode tersedia untuk immersive experience</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualTour;
