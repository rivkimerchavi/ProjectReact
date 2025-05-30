import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Plus, AlertCircle, Loader, RefreshCw, Download, Share2, FileText, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

const ResumeGallery = ({ onEditResume }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(null);
  const [coverLetterModal, setCoverLetterModal] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  
  // קונפיגורציה
  const API_BASE_URL = 'http://localhost:5227';
  
  // פונקציה לקבלת טוקן
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('jwtToken') || 
           localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken');
  }, []);

  // טעינת רשימת קורות החיים
  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('לא נמצא טוקן התחברות');
      }

      const response = await fetch(`${API_BASE_URL}/resume-file/user-files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResumes(data || []);
      console.log('✅ קורות חיים נטענו:', data);
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת קורות חיים:', error);
      
      if (error.message === 'UNAUTHORIZED') {
        setError('בעיית הרשאה - נא להתחבר מחדש');
        localStorage.removeItem('jwtToken');
      } else {
        setError('שגיאה בטעינת קורות החיים');
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, API_BASE_URL]);

  // יצירת מכתב מקדים
  const generateCoverLetter = useCallback(async (resumeId, resumeFileName) => {
    if (!jobDescription.trim()) {
      alert('נא הוסף תיאור משרה');
      return;
    }

    try {
      setCoverLetterLoading(resumeId);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('לא נמצא טוקן התחברות');
      }

      console.log('✨ יוצר מכתב מקדים עבור קורות חיים:', resumeId);

      const response = await fetch(`${API_BASE_URL}/cover-letter/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resumeId,
          jobDescription: jobDescription.trim(),
          language: 'he' // עברית
        })
      });

      if (!response.ok) {
        console.error('❌ שגיאת יצירת מכתב HTTP', response.status);
        throw new Error(`שגיאת שרת ${response.status} - בעיה ביצירת המכתב`);
      }

      const result = await response.json();
      console.log('✅ מכתב מקדים נוצר בהצלחה:', result);
      
      // סגירת המודל ורענון הדף
      setCoverLetterModal(null);
      setJobDescription('');
      alert(`✅ מכתב מקדים נוצר בהצלחה עבור "${resumeFileName}"!`);
      
    } catch (error) {
      console.error('❌ שגיאה ביצירת מכתב מקדים:', error);
      alert('❌ שגיאה ביצירת מכתב מקדים - בעיה בשרת');
    } finally {
      setCoverLetterLoading(null);
    }
  }, [getAuthToken, API_BASE_URL, jobDescription]);

  // מחיקת קורות חיים
  const deleteResume = useCallback(async (resumeId, fileName, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את קורות החיים "${fileName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(resumeId);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('לא נמצא טוקן התחברות');
      }

      const response = await fetch(`${API_BASE_URL}/resume-file/delete/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`שגיאת שרת ${response.status}`);
      }

      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      console.log('✅ קורות חיים נמחקו בהצלחה');
      
    } catch (error) {
      console.error('❌ שגיאה במחיקת קורות חיים:', error);
      alert('❌ שגיאה במחיקת קורות החיים');
    } finally {
      setDeleteLoading(null);
    }
  }, [getAuthToken, API_BASE_URL]);

  // עריכת קורות חיים
  const editResume = useCallback(async (resumeId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('לא נמצא טוקן התחברות');
      }

      const response = await fetch(`${API_BASE_URL}/resume-file/resumeFile/${resumeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`שגיאת שרת ${response.status}`);
      }

      const resumeData = await response.json();
      
      if (onEditResume) {
        onEditResume(resumeData);
      }
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת נתונים לעריכה:', error);
      alert('❌ שגיאה בטעינת נתונים לעריכה');
    }
  }, [getAuthToken, API_BASE_URL, onEditResume]);

  // יצירת קורות חיים חדשים
  const createNewResume = useCallback(() => {
    if (onEditResume) {
      onEditResume(null);
    }
  }, [onEditResume]);

  // פונקציה לקבלת URL של התמונה
  const getImageUrl = useCallback((resume) => {
    const possibleImageFields = [
      resume.path,
      resume.imagePath,
      resume.imageUrl,
      resume.filePath,
      resume.thumbnailPath,
      resume.previewPath,
      resume.url,
      resume.s3Path,
      resume.awsPath
    ];

    const imageUrl = possibleImageFields.find(field => field && field.trim());
    
    if (imageUrl) {
      let fullImageUrl = imageUrl;
      
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
        fullImageUrl = `${API_BASE_URL}/${imageUrl}`;
      }
      
      return fullImageUrl;
    }
    
    return null;
  }, [API_BASE_URL]);

  // טעינה ראשונית
  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // 🎨 עיצוב מתוקן
  const styles = {
    container: {
      fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, sans-serif",
      direction: 'rtl',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '0',
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
    },
    createButton: {
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    },
    mainContent: {
      display: 'flex',
      height: 'calc(100vh - 73px)',
    },
    sidebar: {
      width: '280px',
      backgroundColor: 'white',
      borderLeft: '1px solid #e2e8f0',
      padding: '24px 16px',
      overflowY: 'auto',
    },
    contentArea: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      cursor: 'default',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderColor: '#cbd5e1',
    },
    imageContainer: {
      width: '100%',
      height: '200px',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid #e2e8f0',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'opacity 0.3s ease',
    },
    placeholderImage: {
      width: '48px',
      height: '48px',
      backgroundColor: '#e2e8f0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: '#94a3b8',
    },
    cardContent: {
      padding: '16px',
    },
    fileName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px',
      lineHeight: '1.4',
      wordBreak: 'break-word',
    },
    dateInfo: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '12px',
    },
    actionsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginTop: '12px',
    },
    actionRow: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
    },
    coverLetterButton: {
      backgroundColor: '#10b981',
      color: 'white',
      width: '100%',
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
    },
    modalButton: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
    },
    generateButton: {
      backgroundColor: '#10b981',
      color: 'white',
    },
    cancelButton: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#64748b',
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#ef4444',
      textAlign: 'center',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#64748b',
      textAlign: 'center',
    },
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>המסמכים שלי</h1>
        </div>
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <Loader size={32} className="animate-spin" />
            <p style={{ marginTop: '16px', fontSize: '14px' }}>טוען קורות חיים...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>המסמכים שלי</h1>
        </div>
        <div style={styles.mainContent}>
          <div style={styles.errorContainer}>
            <AlertCircle size={32} />
            <h3 style={{ margin: '16px 0 8px', fontSize: '16px', fontWeight: '600' }}>שגיאה</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px' }}>{error}</p>
            <button onClick={loadResumes} style={{...styles.createButton, backgroundColor: '#3b82f6'}}>
              <RefreshCw size={14} />
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>המסמכים שלי</h1>
        <button onClick={createNewResume} style={styles.createButton}>
          <Plus size={16} />
          יצירת קורות חיים חדשים
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            קורות חיים
          </div>
          
          <button 
            onClick={loadResumes}
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              marginBottom: '16px',
            }}
            disabled={loading}
          >
            <RefreshCw size={14} />
            רענן
          </button>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {resumes.length} מסמכים
          </div>
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {resumes.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }}>📄</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                אין עדיין קורות חיים
              </h3>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                צור את קורות החיים הראשונים שלך!
              </p>
              <button onClick={createNewResume} style={styles.createButton}>
                <Plus size={16} />
                צור עכשיו
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {resumes.map((resume) => {
                const imageUrl = getImageUrl(resume);
                
                return (
                  <div 
                    key={resume.id} 
                    style={styles.card}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* Image */}
                    <div style={styles.imageContainer}>
                      {imageUrl ? (
                        <>
                          <img 
                            src={imageUrl}
                            alt={resume.fileName || 'קורות חיים'}
                            style={styles.image}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentNode.querySelector('.placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="placeholder"
                            style={{...styles.placeholderImage, position: 'absolute', display: 'none'}}
                          >
                            📄
                          </div>
                        </>
                      ) : (
                        <div style={styles.placeholderImage}>📄</div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={styles.cardContent}>
                      <h3 style={styles.fileName}>
                        {resume.fileName || `מסמך #${resume.id}`}
                      </h3>
                      
                      {resume.createdAt && (
                        <div style={styles.dateInfo}>
                          עודכן אחרון: {new Date(resume.createdAt).toLocaleDateString('he-IL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={styles.actionsContainer}>
                        {/* First Row - Edit & Delete */}
                        <div style={styles.actionRow}>
                          <button
                            onClick={(e) => editResume(resume.id, e)}
                            style={{...styles.actionButton, ...styles.editButton}}
                            title="עריכה"
                          >
                            <Edit size={12} />
                            ערוך
                          </button>
                          
                          <button
                            onClick={(e) => deleteResume(resume.id, resume.fileName, e)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                            disabled={deleteLoading === resume.id}
                            title="מחיקה"
                          >
                            {deleteLoading === resume.id ? (
                              <Loader size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            מחק
                          </button>
                        </div>

                        {/* Second Row - Generate Cover Letter */}
                        <button
                          onClick={() => setCoverLetterModal(resume)}
                          style={{...styles.actionButton, ...styles.coverLetterButton}}
                          disabled={coverLetterLoading === resume.id}
                          title="יצירת מכתב מקדים"
                        >
                          {coverLetterLoading === resume.id ? (
                            <>
                              <Loader size={12} className="animate-spin" />
                              יוצר מכתב...
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} />
                              צור מכתב מקדים
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter Modal */}
      {coverLetterModal && (
        <div style={styles.modalOverlay} onClick={() => setCoverLetterModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <Sparkles size={20} />
              יצירת מכתב מקדים עבור "{coverLetterModal.fileName}"
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                תיאור המשרה או החברה:
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="הדבק כאן את תיאור המשרה, או כתב פרטים על החברה והתפקיד שאליו אתה מגיש מועמדות..."
                style={styles.textarea}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => generateCoverLetter(coverLetterModal.id, coverLetterModal.fileName)}
                disabled={!jobDescription.trim() || coverLetterLoading === coverLetterModal.id}
                style={{
                  ...styles.modalButton,
                  ...styles.generateButton,
                  opacity: !jobDescription.trim() ? 0.5 : 1,
                  cursor: !jobDescription.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {coverLetterLoading === coverLetterModal.id ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    יוצר מכתב...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    צור מכתב מקדים
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setCoverLetterModal(null);
                  setJobDescription('');
                }}
                style={{...styles.modalButton, ...styles.cancelButton}}
                disabled={coverLetterLoading === coverLetterModal.id}
              >
                ביטול
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
              💡 ככל שתיאור המשרה יהיה מפורט יותר, המכתב יהיה מותאם יותר
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeGallery;