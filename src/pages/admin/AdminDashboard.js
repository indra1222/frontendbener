import React, { useState, useContext, useEffect } from 'react';
import { CMSContext } from '../../contexts/CMSContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { cmsApi } from '../../services/cmsApi';
import { API_BASE_URL } from '../../config/api';
import '../../styles/AdminDashboard.css';

function AdminDashboard() {
  const { content, refreshContent } = useContext(CMSContext);
  const { theme, refreshTheme } = useContext(ThemeContext);

  const [activeSection, setActiveSection] = useState('hero');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editData, setEditData] = useState({});
  const [editTheme, setEditTheme] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEWS STATE
  const [newsList, setNewsList] = useState([]);
  const [newArticle, setNewArticle] = useState({ title: '', excerpt: '', content: '', image: '', category: 'General', author: 'Admin' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Q&A STATE
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answeredBy, setAnsweredBy] = useState('Admin');
  const [qnaFilter, setQnaFilter] = useState('all'); // all, pending, answered

  // VIDEO STATE
  const [videosList, setVideosList] = useState([]);
  const [newVideo, setNewVideo] = useState({ youtube_id: '', title: '', description: '', display_order: 0, is_active: true });
  const [editingVideo, setEditingVideo] = useState(null);

  /* ===============================
     AUTH HANDLING
  =============================== */
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') setIsAuthenticated(true);
  }, []);

  /* ===============================
     NEWS HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'news') loadNews();
  }, [isAuthenticated, activeSection]);

  const loadNews = async () => {
    const res = await cmsApi.getNews();
    if (res.status === 'success') setNewsList(res.news);
  };

  /* ===============================
     Q&A HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'qna') loadQuestions();
  }, [isAuthenticated, activeSection]);

  const loadQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/all`);
      const data = await response.json();
      if (data.status === 'success') {
        setQuestionsList(data.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleAnswerQuestion = async (question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || '');
    setAnsweredBy(question.answered_by || 'Admin');
  };

  const submitAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      setMessage({ text: 'Please provide an answer', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${selectedQuestion.id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText, answered_by: answeredBy })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ text: 'Question answered successfully!', type: 'success' });
        setSelectedQuestion(null);
        setAnswerText('');
        loadQuestions();
      } else {
        setMessage({ text: data.message || 'Failed to answer question', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to submit answer', type: 'error' });
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ text: 'Question deleted successfully', type: 'success' });
        loadQuestions();
      }
    } catch (error) {
      setMessage({ text: 'Failed to delete question', type: 'error' });
    }
  };

  const filteredQuestions = qnaFilter === 'all' 
    ? questionsList 
    : questionsList.filter(q => q.status === qnaFilter);

  /* ===============================
     VIDEO HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'videos') loadVideos();
  }, [isAuthenticated, activeSection]);

  const loadVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/all`);
      const data = await response.json();
      if (data.success) {
        setVideosList(data.videos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleCreateVideo = async () => {
    if (!newVideo.youtube_id || !newVideo.title) {
      setMessage({ text: 'YouTube ID and Title are required', type: 'error' });
      return;
    }

    // Extract YouTube ID from URL if full URL is provided
    let youtubeId = newVideo.youtube_id.trim();
    
    // Handle different YouTube URL formats
    if (youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')) {
      try {
        const url = new URL(youtubeId);
        if (url.hostname === 'youtu.be') {
          // Format: https://youtu.be/VIDEO_ID
          youtubeId = url.pathname.slice(1).split('?')[0];
        } else if (url.hostname.includes('youtube.com')) {
          // Format: https://www.youtube.com/watch?v=VIDEO_ID
          youtubeId = url.searchParams.get('v') || youtubeId;
        }
      } catch (e) {
        setMessage({ text: 'Invalid YouTube URL format', type: 'error' });
        return;
      }
    }

    // Validate YouTube ID format (should be 11 characters)
    if (youtubeId.length !== 11) {
      setMessage({ text: 'Invalid YouTube Video ID. Should be 11 characters.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVideo,
          youtube_id: youtubeId
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Video created successfully!', type: 'success' });
        setNewVideo({ youtube_id: '', title: '', description: '', display_order: 0, is_active: true });
        loadVideos();
      } else {
        setMessage({ text: data.message || 'Failed to create video', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to create video', type: 'error' });
    }
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo) return;

    // Extract YouTube ID from URL if full URL is provided
    let youtubeId = editingVideo.youtube_id.trim();
    
    // Handle different YouTube URL formats
    if (youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')) {
      try {
        const url = new URL(youtubeId);
        if (url.hostname === 'youtu.be') {
          youtubeId = url.pathname.slice(1).split('?')[0];
        } else if (url.hostname.includes('youtube.com')) {
          youtubeId = url.searchParams.get('v') || youtubeId;
        }
      } catch (e) {
        setMessage({ text: 'Invalid YouTube URL format', type: 'error' });
        return;
      }
    }

    // Validate YouTube ID format
    if (youtubeId.length !== 11) {
      setMessage({ text: 'Invalid YouTube Video ID. Should be 11 characters.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/videos/${editingVideo.video_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingVideo,
          youtube_id: youtubeId
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Video updated successfully!', type: 'success' });
        setEditingVideo(null);
        loadVideos();
      } else {
        setMessage({ text: data.message || 'Failed to update video', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to update video', type: 'error' });
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Video deleted successfully', type: 'success' });
        loadVideos();
      }
    } catch (error) {
      setMessage({ text: 'Failed to delete video', type: 'error' });
    }
  };

  const handleToggleVideoActive = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}/toggle`, {
        method: 'PUT'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Video status updated', type: 'success' });
        loadVideos();
      }
    } catch (error) {
      setMessage({ text: 'Failed to update video status', type: 'error' });
    }
  };

  /* ===============================
     IMAGE UPLOAD HANDLER
  =============================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File terlalu besar! Maksimal 5MB', type: 'error' });
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Format file tidak valid! Gunakan PNG, JPG, GIF, atau WebP', type: 'error' });
      return;
    }

    setUploadingImage(true);
    setMessage({ text: 'Mengupload gambar...', type: 'info' });

    try {
      const res = await cmsApi.uploadNewsImage(file);
      if (res.status === 'success') {
        setNewArticle({ ...newArticle, image: res.image_url });
        setMessage({ text: 'Gambar berhasil diupload! ✅', type: 'success' });
      } else {
        setMessage({ text: res.message || 'Gagal upload gambar', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error saat upload gambar', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  /* ===============================
     LOGIN HANDLER
  =============================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await cmsApi.login(loginForm.username, loginForm.password);
      if (result.status === 'success') {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAuthenticated', 'true');
        setMessage({ text: 'Login successful! 🎉', type: 'success' });
        refreshContent();
        refreshTheme();
      } else {
        setMessage({ text: result.message || 'Invalid credentials', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOGOUT HANDLER
  =============================== */
  const handleLogout = async () => {
    await cmsApi.logout();
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setMessage({ text: 'Logged out successfully', type: 'success' });
  };

  /* ===============================
     SAVE HANDLER
  =============================== */
  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let result;

      if (activeSection === 'theme') {
        const themeToSave = editTheme || theme;
        result = await cmsApi.updateTheme(themeToSave);
        if (result.status === 'success') await refreshTheme();
      } else {
        const dataToSave = editData[activeSection] || content[activeSection];
        result = await cmsApi.updateContent(activeSection, dataToSave);
        if (result.status === 'success') await refreshContent();
      }

      setMessage({
        text: result.status === 'success'
          ? '✅ Changes saved successfully!'
          : '❌ Failed to save changes',
        type: result.status === 'success' ? 'success' : 'error',
      });

      if (result.status === 'success') {
        setEditData({});
        setEditTheme(null);
      }
    } catch (error) {
      setMessage({ text: '❌ Error saving changes: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INPUT HANDLER
  =============================== */
  const handleInputChange = (path, value) => {
    const newData = { ...editData };
    if (!newData[activeSection]) {
      newData[activeSection] = JSON.parse(JSON.stringify(content[activeSection]));
    }
    const keys = path.split('.');
    let current = newData[activeSection];
    for (let i = 0; i < keys.length - 1; i++) {
      if (Array.isArray(current)) current = current[parseInt(keys[i])];
      else current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditData(newData);
  };

  /* ===============================
     LOGIN PAGE
  =============================== */
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="login-hint">
            <small>Default credentials: admin / admin123</small>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     DASHBOARD MAIN VIEW
  =============================== */
  if (!content || !theme) {
    return <div className="loading-page">Loading dashboard...</div>;
  }

  // Debug: Log content untuk FAQ
  console.log('Active Section:', activeSection);
  console.log('Content:', content);
  console.log('FAQ Content:', content.faq);

  const currentContent = editData[activeSection] || content[activeSection];
  const currentTheme = editTheme || theme;

  console.log('Current Content for', activeSection, ':', currentContent);

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>CMS Dashboard</h2>
        <ul className="section-list">
          {[
            { key: 'hero', label: 'Hero Section' },
            { key: 'faq', label: 'FAQ Management' },
            { key: 'qna', label: 'Q&A Management' },
            { key: 'news', label: 'News Management' },
            { key: 'videos', label: 'Video Management' },
            { key: 'theme', label: 'Theme Editor' },
          ].map(({ key, label }) => (
            <li
              key={key}
              className={activeSection === key ? 'active' : ''}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </aside>

      {/* CONTENT AREA */}
      <main className="admin-content">
        <div className="content-header">
          <h1>Edit {activeSection}</h1>
          {activeSection !== 'news' && activeSection !== 'faq' && activeSection !== 'videos' && (
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          {activeSection === 'faq' && (
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

        {/* ================= HERO SECTION ================= */}
        {activeSection === 'hero' && currentContent && (
          <>
            <div className="form-section">
              <h3>Hero Content</h3>
              
              <div className="form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  value={currentContent.tagline || ''}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="UMKM Hub Desa Kemujan"
                />
              </div>

              <div className="form-group">
                <label>Title Line 1</label>
                <input
                  type="text"
                  value={currentContent.titleLine1 || ''}
                  onChange={(e) => handleInputChange('titleLine1', e.target.value)}
                  placeholder="Dari Lokal"
                />
              </div>

              <div className="form-group">
                <label>Title Line 2</label>
                <input
                  type="text"
                  value={currentContent.titleLine2 || ''}
                  onChange={(e) => handleInputChange('titleLine2', e.target.value)}
                  placeholder="Impact"
                />
              </div>

              <div className="form-group">
                <label>Title Highlight (Colored Text)</label>
                <input
                  type="text"
                  value={currentContent.titleHighlight || ''}
                  onChange={(e) => handleInputChange('titleHighlight', e.target.value)}
                  placeholder="Global"
                />
              </div>

              <div className="form-group">
                <label>CTA Button Text</label>
                <input
                  type="text"
                  value={currentContent.ctaButton || ''}
                  onChange={(e) => handleInputChange('ctaButton', e.target.value)}
                  placeholder="Lihat UMKM"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Statistics Section</h3>
              
              <div className="stats-editor">
                <div className="stat-editor-item">
                  <h4>Statistik 1</h4>
                  <div className="form-group">
                    <label>Number</label>
                    <input
                      type="text"
                      value={currentContent.stats?.stat1?.number || ''}
                      onChange={(e) => {
                        const newStats = { ...currentContent.stats };
                        if (!newStats.stat1) newStats.stat1 = {};
                        newStats.stat1.number = e.target.value;
                        handleInputChange('stats', newStats);
                      }}
                      placeholder="21+"
                    />
                  </div>
                  <div className="form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={currentContent.stats?.stat1?.label || ''}
                      onChange={(e) => {
                        const newStats = { ...currentContent.stats };
                        if (!newStats.stat1) newStats.stat1 = {};
                        newStats.stat1.label = e.target.value;
                        handleInputChange('stats', newStats);
                      }}
                      placeholder="UMKM terdaftar di Kemujan"
                    />
                  </div>
                </div>

                <div className="stat-editor-item">
                  <h4>Statistik 2</h4>
                  <div className="form-group">
                    <label>Number</label>
                    <input
                      type="text"
                      value={currentContent.stats?.stat2?.number || ''}
                      onChange={(e) => {
                        const newStats = { ...currentContent.stats };
                        if (!newStats.stat2) newStats.stat2 = {};
                        newStats.stat2.number = e.target.value;
                        handleInputChange('stats', newStats);
                      }}
                      placeholder="72+"
                    />
                  </div>
                  <div className="form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={currentContent.stats?.stat2?.label || ''}
                      onChange={(e) => {
                        const newStats = { ...currentContent.stats };
                        if (!newStats.stat2) newStats.stat2 = {};
                        newStats.stat2.label = e.target.value;
                        handleInputChange('stats', newStats);
                      }}
                      placeholder="Jenis produk tersedia"
                    />
                  </div>
                </div>

                <div className="stat-editor-item">
                  <h4>Statistik 3</h4>
                  <div className="form-group">
                    <label>Number</label>
                    <input
                      type="text"
                      value={currentContent.stats?.stat3?.number || ''}
                      onChange={(e) => {
                        const newStats = { ...currentContent.stats };
                        if (!newStats.stat3) newStats.stat3 = {};
                        newStats.stat3.number = e.target.value;
                        handleInputChange('stats', newStats);
                      }}
                      placeholder="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={currentContent.stats?.stat3?.label || ''}
                      onChange={(e) => {
                        const newStats = { ...currentContent.stats };
                        if (!newStats.stat3) newStats.stat3 = {};
                        newStats.stat3.label = e.target.value;
                        handleInputChange('stats', newStats);
                      }}
                      placeholder="Kategori UMKM tersedia"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= FAQ SECTION ================= */}
        {activeSection === 'faq' && (
          <>
            {!currentContent ? (
              <div className="debug-error">
                <h2>⚠️ FAQ Content Not Found</h2>
                <p>Current content is: {JSON.stringify(currentContent)}</p>
                <p>Full content object: {JSON.stringify(content)}</p>
                <button onClick={() => window.location.reload()}>Reload Page</button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={currentContent.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Subtitle</label>
                  <textarea
                    value={currentContent.subtitle || ''}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    rows={2}
                  />
                </div>

                <h3>FAQ Questions</h3>
                {currentContent.questions && currentContent.questions.length > 0 ? (
                  currentContent.questions.map((item, index) => (
                    <div key={item.id || index} className="faq-editor-item">
                      <div className="form-group">
                        <label>Question {index + 1}</label>
                        <input
                          type="text"
                          value={item.question || ''}
                          onChange={(e) => {
                            const newQuestions = [...currentContent.questions];
                            newQuestions[index].question = e.target.value;
                            handleInputChange('questions', newQuestions);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Answer {index + 1}</label>
                        <textarea
                          value={item.answer || ''}
                          onChange={(e) => {
                            const newQuestions = [...currentContent.questions];
                            newQuestions[index].answer = e.target.value;
                            handleInputChange('questions', newQuestions);
                          }}
                          rows={3}
                        />
                      </div>
                      <button
                        className="btn-danger"
                        onClick={() => {
                          const newQuestions = currentContent.questions.filter((_, i) => i !== index);
                          handleInputChange('questions', newQuestions);
                        }}
                      >
                        Delete Question
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="debug-info">
                    <p>⚠️ No questions found. Questions data: {JSON.stringify(currentContent.questions)}</p>
                  </div>
                )}

                <button
                  className="btn-secondary"
                  onClick={() => {
                    const newQuestions = [...(currentContent.questions || [])];
                    const newId = newQuestions.length > 0 
                      ? Math.max(...newQuestions.map(q => q.id || 0)) + 1 
                      : 1;
                    newQuestions.push({
                      id: newId,
                      question: 'Pertanyaan baru',
                      answer: 'Jawaban baru'
                    });
                    handleInputChange('questions', newQuestions);
                  }}
                >
                  Add New Question
                </button>
              </>
            )}
          </>
        )}

        {/* ================= NEWS SECTION ================= */}
        {activeSection === 'news' && (
          <section className="news-editor">
            <h2>Manage News</h2>

            {/* FORM TAMBAH */}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="teknologi">Teknologi</option>
                <option value="bisnis">Bisnis</option>
                <option value="tutorial">Tutorial</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                value={newArticle.author}
                onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Excerpt</label>
              <input
                type="text"
                value={newArticle.excerpt}
                onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                placeholder="Ringkasan singkat berita..."
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                rows={6}
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                placeholder="Konten lengkap berita..."
              />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <small className="upload-status">⏳ Uploading...</small>}
              {newArticle.image && (
                <div className="image-preview">
                  <img src={newArticle.image} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => setNewArticle({ ...newArticle, image: '' })}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={async () => {
                if (!newArticle.title) {
                  setMessage({ text: 'Title wajib diisi!', type: 'error' });
                  return;
                }
                const res = await cmsApi.createNews(newArticle);
                if (res.status === 'success') {
                  setMessage({ text: 'News created successfully', type: 'success' });
                  setNewArticle({ title: '', excerpt: '', content: '', image: '', category: 'General', author: 'Admin' });
                  loadNews();
                } else {
                  setMessage({ text: 'Failed to create news', type: 'error' });
                }
              }}
              disabled={uploadingImage}
            >
              Add News
            </button>

            {/* LIST BERITA */}
            <h3>Existing News</h3>
            <ul className="news-list">
              {newsList.map((n) => (
                <li key={n.id} className="news-item">
                  <strong>{n.title}</strong> — {n.excerpt}
                  <div className="news-actions">
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        const res = await cmsApi.updateNews(n.id, {
                          ...n,
                          title: `${n.title} (Edited)`,
                        });
                        if (res.status === 'success') {
                          setMessage({ text: 'News updated successfully', type: 'success' });
                          loadNews();
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        const res = await cmsApi.deleteNews(n.id);
                        if (res.status === 'success') {
                          setMessage({ text: 'News deleted successfully', type: 'success' });
                          loadNews();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ================= THEME SECTION ================= */}
        {activeSection === 'theme' && currentTheme && (
          <>
            <div className="theme-section">
              <h3>Color Settings</h3>
              <div className="color-grid">
                {['primary', 'secondary', 'accent', 'text', 'background'].map((key) => (
                  <div className="form-group" key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)} Color</label>
                    <input
                      type="color"
                      value={currentTheme.colors?.[key] || '#ffffff'}
                      onChange={(e) =>
                        setEditTheme({
                          ...currentTheme,
                          colors: { ...currentTheme.colors, [key]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-section">
              <h3>Typography Settings</h3>
              <p className="section-description">Font akan diterapkan ke seluruh website (Navbar, Home, About, News, FAQ, Q&A, Contact, dll)</p>
              
              <div className="form-group">
                <label>Font Family</label>
                <select
                  value={currentTheme.fontFamily || 'Poppins, sans-serif'}
                  onChange={(e) => setEditTheme({ ...currentTheme, fontFamily: e.target.value })}
                  className="font-selector"
                >
                  <option value="Poppins, sans-serif">Poppins (Default)</option>
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Raleway', sans-serif">Raleway</option>
                  <option value="'Nunito', sans-serif">Nunito</option>
                  <option value="'Ubuntu', sans-serif">Ubuntu</option>
                  <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                  <option value="'Work Sans', sans-serif">Work Sans</option>
                  <option value="'DM Sans', sans-serif">DM Sans</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                  <option value="'Outfit', sans-serif">Outfit</option>
                  <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                  <option value="'Manrope', sans-serif">Manrope</option>
                  <option value="'Sora', sans-serif">Sora</option>
                  <option value="'Lexend', sans-serif">Lexend</option>
                  <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                  <option value="'Merriweather', serif">Merriweather (Serif)</option>
                  <option value="'Lora', serif">Lora (Serif)</option>
                  <option value="'Georgia', serif">Georgia (Serif)</option>
                  <option value="'Fira Code', monospace">Fira Code (Monospace)</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono (Monospace)</option>
                  <option value="'Courier New', monospace">Courier New (Monospace)</option>
                  <option value="'Segoe UI', sans-serif">Segoe UI</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>

              <div className="form-group">
                <label>Font Weight</label>
                <select
                  value={currentTheme.fontWeight || '400'}
                  onChange={(e) => setEditTheme({ ...currentTheme, fontWeight: e.target.value })}
                  className="font-weight-selector"
                >
                  <option value="100">Thin (100)</option>
                  <option value="200">Extra Light (200)</option>
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400) - Default</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
                <small>Default font weight untuk body text (beberapa font mungkin tidak support semua weight)</small>
              </div>

              <div className="form-group">
                <label>Custom Font Family (Optional)</label>
                <input
                  type="text"
                  value={currentTheme.fontFamily || 'Poppins, sans-serif'}
                  onChange={(e) => setEditTheme({ ...currentTheme, fontFamily: e.target.value })}
                  placeholder="e.g., 'Your Font Name', sans-serif"
                />
                <small>Atau ketik manual nama font Google Fonts / custom font</small>
              </div>

              <div className="font-preview">
                <h4>Preview Font & Weight</h4>
                <div style={{ 
                  fontFamily: editTheme?.fontFamily || currentTheme.fontFamily || 'Poppins, sans-serif',
                  fontWeight: editTheme?.fontWeight || currentTheme.fontWeight || '400'
                }}>
                  <p style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>
                    Black (900) - The Quick Brown Fox
                  </p>
                  <p style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Extra Bold (800) - Jumps Over The Lazy Dog
                  </p>
                  <p style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Bold (700) - Pack My Box With Five Dozen
                  </p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Semibold (600) - Liquor Jugs
                  </p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Medium (500) - The Five Boxing Wizards
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '400', marginBottom: '0.5rem' }}>
                    Regular (400) - Jump Quickly 0123456789
                  </p>
                  <p style={{ fontSize: '0.95rem', fontWeight: '300', marginBottom: '0.5rem' }}>
                    Light (300) - How vexingly quick daft zebras jump!
                  </p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '200', marginBottom: '0.5rem' }}>
                    Extra Light (200) - Sphinx of black quartz, judge my vow
                  </p>
                  <p style={{ fontSize: '0.85rem', fontWeight: '100' }}>
                    Thin (100) - A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                  </p>
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--primary-color, #3b82f6)'
                  }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      <strong>Current Selection:</strong> {editTheme?.fontFamily || currentTheme.fontFamily || 'Poppins, sans-serif'}
                    </p>
                    <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                      Weight: {editTheme?.fontWeight || currentTheme.fontWeight || '400'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== Q&A MANAGEMENT SECTION ==================== */}
        {activeSection === 'qna' && (
          <>
            <div className="qna-header">
              <h2>Q&A Management</h2>
              <div className="qna-summary">
                <span className="badge badge-total">Total: {questionsList.length}</span>
                <span className="badge badge-pending">
                  Pending: {questionsList.filter(q => q.status === 'pending').length}
                </span>
                <span className="badge badge-answered">
                  Answered: {questionsList.filter(q => q.status === 'answered').length}
                </span>
              </div>
            </div>

            {/* Filter */}
            <div className="qna-filter">
              <button 
                className={`filter-btn ${qnaFilter === 'all' ? 'active' : ''}`}
                onClick={() => setQnaFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${qnaFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setQnaFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${qnaFilter === 'answered' ? 'active' : ''}`}
                onClick={() => setQnaFilter('answered')}
              >
                Answered
              </button>
            </div>

            {/* Answer Form (when question selected) */}
            {selectedQuestion && (
              <div className="answer-form-card">
                <h3>Answer Question</h3>
                <div className="question-detail">
                  <div className="detail-row">
                    <strong>From:</strong> {selectedQuestion.name} ({selectedQuestion.email})
                  </div>
                  <div className="detail-row">
                    <strong>Date:</strong> {selectedQuestion.created_at}
                  </div>
                  <div className="detail-row">
                    <strong>Question:</strong>
                    <p className="question-text">{selectedQuestion.question}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Answer *</label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here..."
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label>Answered By</label>
                  <input
                    type="text"
                    value={answeredBy}
                    onChange={(e) => setAnsweredBy(e.target.value)}
                    placeholder="Admin name"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={submitAnswer}>
                    Submit Answer
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAnswerText('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="questions-table">
              {filteredQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Question</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className={q.status === 'pending' ? 'pending-row' : ''}>
                        <td>{q.id}</td>
                        <td>
                          <div className="user-info">
                            <strong>{q.name}</strong>
                            <small>{q.email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="question-preview">
                            {q.question.substring(0, 80)}
                            {q.question.length > 80 && '...'}
                          </div>
                          {q.answer && (
                            <div className="answer-preview">
                              {q.answer.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${q.status}`}>
                            {q.status === 'pending' ? 'Pending' : 'Answered'}
                          </span>
                        </td>
                        <td>
                          <small>{q.created_at}</small>
                          {q.answered_at && (
                            <>
                              <br />
                              <small className="answered-date">
                                Answered: {q.answered_at}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-answer"
                              onClick={() => handleAnswerQuestion(q)}
                              title={q.status === 'answered' ? 'Edit answer' : 'Answer question'}
                            >
                              {q.status === 'answered' ? 'Edit' : 'Answer'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => deleteQuestion(q.id)}
                              title="Delete question"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ==================== VIDEO MANAGEMENT SECTION ==================== */}
        {activeSection === 'videos' && (
          <>
            <div className="video-header">
              <h2>Video Management</h2>
              <div className="video-summary">
                <span className="badge badge-total">Total: {videosList.length}</span>
                <span className="badge badge-active">
                  Active: {videosList.filter(v => v.is_active).length}
                </span>
              </div>
            </div>

            {/* Add New Video Form */}
            <div className="video-form-card">
              <h3>{editingVideo ? 'Edit Video' : 'Add New Video'}</h3>
              
              <div className="form-group">
                <label>YouTube Video ID *</label>
                <input
                  type="text"
                  value={editingVideo ? editingVideo.youtube_id : newVideo.youtube_id}
                  onChange={(e) => editingVideo 
                    ? setEditingVideo({...editingVideo, youtube_id: e.target.value})
                    : setNewVideo({...newVideo, youtube_id: e.target.value})}
                  placeholder="e.g., dQw4w9WgXcQ or paste full YouTube URL"
                />
                <small>
                  Enter YouTube ID (<strong>11 characters</strong>) or paste full URL:<br/>
                  • https://www.youtube.com/watch?v=<strong>VIDEO_ID</strong><br/>
                  • https://youtu.be/<strong>VIDEO_ID</strong>
                </small>
              </div>

              <div className="form-group">
                <label>Video Title *</label>
                <input
                  type="text"
                  value={editingVideo ? editingVideo.title : newVideo.title}
                  onChange={(e) => editingVideo
                    ? setEditingVideo({...editingVideo, title: e.target.value})
                    : setNewVideo({...newVideo, title: e.target.value})}
                  placeholder="Enter video title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingVideo ? editingVideo.description : newVideo.description}
                  onChange={(e) => editingVideo
                    ? setEditingVideo({...editingVideo, description: e.target.value})
                    : setNewVideo({...newVideo, description: e.target.value})}
                  placeholder="Enter video description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={editingVideo ? editingVideo.display_order : newVideo.display_order}
                    onChange={(e) => editingVideo
                      ? setEditingVideo({...editingVideo, display_order: parseInt(e.target.value)})
                      : setNewVideo({...newVideo, display_order: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingVideo ? editingVideo.is_active : newVideo.is_active}
                      onChange={(e) => editingVideo
                        ? setEditingVideo({...editingVideo, is_active: e.target.checked})
                        : setNewVideo({...newVideo, is_active: e.target.checked})}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                {editingVideo ? (
                  <>
                    <button className="btn-primary" onClick={handleUpdateVideo}>
                      Update Video
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => setEditingVideo(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleCreateVideo}>
                    Add Video
                  </button>
                )}
              </div>
            </div>

            {/* Videos List */}
            <div className="videos-table">
              {videosList.length === 0 ? (
                <div className="empty-state">
                  <p>No videos found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Title</th>
                      <th>YouTube ID</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videosList.map((video) => (
                      <tr key={video.video_id}>
                        <td>
                          <div className="video-thumbnail">
                            <img 
                              src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                              alt={video.title}
                              onError={(e) => e.target.src = 'https://via.placeholder.com/120x90?text=No+Preview'}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="video-info">
                            <strong>{video.title}</strong>
                            {video.description && (
                              <small>{video.description.substring(0, 60)}...</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <code style={{
                            fontSize: '0.75rem',
                            wordBreak: 'break-all',
                            display: 'block',
                            maxWidth: '150px'
                          }}>
                            {video.youtube_id}
                          </code>
                        </td>
                        <td>{video.display_order}</td>
                        <td>
                          <span className={`status-badge ${video.is_active ? 'active' : 'inactive'}`}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => setEditingVideo(video)}
                              title="Edit video"
                            >
                              Edit
                            </button>
                            <button
                              className="btn-toggle"
                              onClick={() => handleToggleVideoActive(video.video_id)}
                              title={video.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {video.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteVideo(video.video_id)}
                              title="Delete video"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
