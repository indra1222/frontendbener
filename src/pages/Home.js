import React, { useContext, useEffect, useState } from 'react';
import { CMSContext } from '../contexts/CMSContext';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import '../styles/Home.css';

// Constants
const DEFAULT_CONTENT = {
  hero: {
    tagline: 'virtualign.id',
    titleLine1: 'Virtual Tour',
    titleLine2: 'Experience',
    titleHighlight: 'Immersive',
    ctaButton: 'Start Tour',
    stats: {
      stat1: { number: '100+', label: 'Projects Completed' },
      stat2: { number: '50+', label: 'Happy Clients' },
      stat3: { number: '5', label: 'Years Experience' }
    }
  },
};

// Component Parts
const LoadingSpinner = () => (
  <div className="loading-page">
    <div className="loading-spinner" />
    <p style={{ marginTop: '1rem', color: '#999' }}>Loading...</p>
  </div>
);

const HeroSection = ({ content }) => {
  // Safely get hero content with fallback
  const heroData = content?.hero || DEFAULT_CONTENT.hero;
  
  // Navigate to Virtual Tour page in new tab
  const openVirtualTour = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked! Opening Virtual Tour page in new tab...');
    window.open('/virtual-tour', '_blank');
  };
  
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/image.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="hero-overlay" />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Tagline */}
        {heroData.tagline && (
          <motion.p 
            className="hero-tagline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {heroData.tagline}
          </motion.p>
        )}

        {/* Main Title with Highlight */}
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {heroData.titleLine1 && <span className="title-line">{heroData.titleLine1}</span>}
          {heroData.titleLine1 && heroData.titleHighlight && ' '}
          {heroData.titleHighlight && <span className="title-highlight">{heroData.titleHighlight}</span>}
          {heroData.titleHighlight && heroData.titleLine2 && ' '}
          {heroData.titleLine2 && <span className="title-line">{heroData.titleLine2}</span>}
        </motion.h1>

        {/* CTA Button */}
        {heroData.ctaButton && (
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 30 }}
          >
            <button 
              onClick={openVirtualTour}
              onMouseDown={() => console.log('Button mouse down')}
              onMouseUp={() => console.log('Button mouse up')}
              className="btn-primary hero-cta-btn"
              type="button"
            >
              {heroData.ctaButton}
            </button>
          </motion.div>
        )}

        {/* Statistics */}
        {heroData.stats && (
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {heroData.stats.stat1 && (
              <div className="stat-item">
                <div className="stat-number">{heroData.stats.stat1.number}</div>
                <div className="stat-label">{heroData.stats.stat1.label}</div>
              </div>
            )}
            {heroData.stats.stat2 && (
              <div className="stat-item">
                <div className="stat-number">{heroData.stats.stat2.number}</div>
                <div className="stat-label">{heroData.stats.stat2.label}</div>
              </div>
            )}
            {heroData.stats.stat3 && (
              <div className="stat-item">
                <div className="stat-number">{heroData.stats.stat3.number}</div>
                <div className="stat-label">{heroData.stats.stat3.label}</div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

const ServicesSection = () => {
  const services = [
    { 
      title: 'Pembuatan Virtual Tour Interaktif', 
      desc: 'Pengalaman 360-degree yang immersive dan interaktif'
    },
    { 
      title: 'Virtual Tour Galeri & Penjualan Lukisan', 
      desc: 'Showcase karya seni dengan detail tinggi'
    },
    { 
      title: 'Virtual Tour Properti (Real Estate)', 
      desc: 'Tinjau properti dari mana saja, kapan saja'
    },
    { 
      title: 'Pembuatan Platform Manajemen Aset', 
      desc: 'Kelola aset digital dengan efisien'
    },
    { 
      title: 'Layanan Kustomisasi Sesuai Kebutuhan', 
      desc: 'Solusi yang disesuaikan dengan visi Anda'
    },
  ];

  return (
    <section id="services" className="services-section">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Layanan Kami</h2>
        <p className="section-description">Solusi virtual tour profesional untuk berbagai kebutuhan bisnis Anda</p>
      </motion.div>

      <div className="services-grid">
        {services.map((s, i) => (
          <motion.div 
            key={i} 
            className="service-card" 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }} 
            whileHover={{ scale: 1.05, y: -8 }}
          >
            <h3 className="service-title">{s.title}</h3>
            <p className="service-desc">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const AdvantagesSection = () => {
  const advantages = [
    { title: 'Teknologi Terdepan', desc: 'VR, 360-degree walkthrough, dan teknologi AR terkini' },
    { title: 'Kualitas Visual Terbaik', desc: 'Rendering berkualitas tinggi dengan detail maksimal' },
    { title: 'Solusi Inovatif', desc: 'Meningkatkan daya tarik dan engagement bisnis Anda' },
    { title: 'Tim Profesional', desc: 'Berpengalaman dan berdedikasi untuk hasil terbaik' },
  ];

  return (
    <section id="advantages" className="advantages-section">
      <div className="section-header">
        <h2 className="section-title">Keunggulan Kami</h2>
        <p className="section-description">Mengapa memilih kami sebagai partner virtual tour Anda</p>
      </div>

      <div className="advantages-grid">
        {advantages.map((a, i) => (
          <motion.div
            className="advantage-card"
            key={i}
            initial={{ opacity: 0, y: 28, rotate: -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, translateY: -6 }}
          >
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const YouTubeSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch videos from API
    fetch(`${API_BASE_URL}/videos`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.videos) {
          setVideos(data.videos);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="youtube" className="youtube-section">
        <div className="section-header">
          <h2 className="section-title">Video Portfolio</h2>
          <p className="section-description">Loading videos...</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section id="youtube" className="youtube-section">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Video Portfolio</h2>
        <p className="section-description">Saksikan hasil karya virtual tour kami</p>
      </motion.div>

      <div className="youtube-grid">
        {videos.map((video, i) => (
          <motion.div 
            key={video.video_id}
            className="youtube-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -8 }}
          >
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube_id}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-description">{video.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div>
        <h3>virtualign.id</h3>
        <p>Transforming spaces into immersive experiences</p>
      </div>
      <div>
        <p>&copy; 2025 virtualign.id. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Main Component
function Home() {
  const { content, loading, error } = useContext(CMSContext);

  // Use content from CMS or fallback to default
  const pageContent = content || DEFAULT_CONTENT;

  // All hooks must be called before any conditional returns
  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll');
    els.forEach((el) => el.classList.add('animate-in'));
  }, []);

  // Debug log (remove in production)
  useEffect(() => {
    console.log('Home page content:', pageContent);
    if (error) console.warn('CMS Error:', error);
  }, [pageContent, error]);

  // Show loading only during initial load
  if (loading && !content) return <LoadingSpinner />;

  return (
    <div className="home-page">
      <HeroSection content={pageContent} />
      <ServicesSection />
      <AdvantagesSection />
      <YouTubeSection />
      <Footer />
    </div>
  );
}

export default Home;
