import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Plus, AlertCircle, Loader, RefreshCw, Download, Share2, FileText, Sparkles, Clock, CheckCircle2, MoreVertical } from 'lucide-react';

const ResumeGallery = ({ onEditResume }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(null);
  const [coverLetterModal, setCoverLetterModal] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // קונפיגורציה
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
      
      console.log('✅ קורות חיים נטענו:', data);
      console.log('📊 כמות קורות חיים:', data ? data.length : 0);
      
      if (data && data.length > 0) {
        console.log('🔍 בדיקה מפורטת של הרשומה הראשונה:');
        console.log('📋 כל השדות:', Object.keys(data[0]));
        console.log('📋 פרטים מלאים:', data[0]);
        console.log('🖼️ fileUrl:', data[0].fileUrl);
        console.log('🖼️ path:', data[0].path);
        console.log('📄 fileName:', data[0].fileName);
        console.log('🆔 id:', data[0].id);
        console.log('📅 createdAt:', data[0].createdAt);
        
        // בדיקה של כל הרשומות
        data.forEach((resume, index) => {
          console.log(`📝 רשומה ${index + 1}:`, {
            id: resume.id,
            fileName: resume.fileName,
            fileUrl: resume.fileUrl,
            path: resume.path,
            hasFileUrl: !!resume.fileUrl,
            hasPath: !!resume.path,
            fileUrlLength: resume.fileUrl ? resume.fileUrl.length : 0,
            pathLength: resume.path ? resume.path.length : 0
          });
        });
      } else {
        console.log('❌ אין נתונים או מערך ריק');
      }
      
      setResumes(data || []);
      
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

  // פונקציה לקבלת URL של התמונה מ-AWS
  const getImageUrl = useCallback((resume) => {
    console.log('🔍 getImageUrl רץ עבור resume:', resume);
    
    const imageUrl = resume.path || resume.fileUrl || resume.image || resume.profileImage;
    console.log('🖼️ שדה התמונה שנמצא:', imageUrl);
    
    if (imageUrl && imageUrl.trim()) {
      console.log('✅ יש תמונה! imageUrl:', imageUrl);
      
      if (imageUrl.startsWith('http') || imageUrl.startsWith('//')) {
        console.log('🌐 זה URL מלא של AWS, מחזיר כמו שזה:', imageUrl);
        return imageUrl;
      }
      
      const awsUrl = `https://rrrrrrreeeee.s3.amazonaws.com/${imageUrl}`;
      console.log('🔗 בונה URL ל-AWS S3:', awsUrl);
      return awsUrl;
    }
    
    console.log('❌ אין תמונה או שדה ריק');
    return null;
  }, []);

  // טעינה ראשונית
  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        direction: 'rtl',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: '#4285f4' }} />
          <p style={{ fontSize: '16px', color: '#5f6368', margin: 0 }}>טוען קורות חיים...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        direction: 'rtl',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <AlertCircle size={40} style={{ color: '#ea4335' }} />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#202124' }}>שגיאה</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#5f6368', textAlign: 'center' }}>{error}</p>
          <button 
            onClick={loadResumes}
            style={{
              background: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} />
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      direction: 'rtl',
      backgroundColor: '#f8f9fa', // רקע ניטרלי לכל הדף
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e1e5e9',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left side - Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#4285f4'
          }}>
            ResumeBuilder
          </span>
          <div style={{
            backgroundColor: '#4285f4',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <FileText size={12} />
          </div>
        </div>

        {/* Right side - Logout button only */}
        <button
          onClick={() => {
            if (window.confirm('האם אתה בטוח שברצונך להתנתק?')) {
              localStorage.removeItem('jwtToken');
              localStorage.removeItem('token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            }
          }}
          style={{
            background: 'none',
            border: '1px solid #4285f4',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            color: '#4285f4',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#4285f4';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#4285f4';
          }}
        >
          התנתק/י
        </button>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'rgba(66, 133, 244, 0.05)' // תכלת שקוף
      }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: 'white',
          borderLeft: '1px solid #e1e5e9',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Create new button - הוסר מכאן */}

          {/* Navigation */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              המסמכים שלי
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              color: '#5f6368',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '400',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              מכתבים מקדימים
            </div>
          </div>

          {/* Document count */}
          <div style={{
            fontSize: '13px',
            color: '#80868b',
            textAlign: 'center',
            marginTop: 'auto'
          }}>
            {resumes.length} מסמכים
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '32px',
          backgroundColor: 'transparent' // שקוף כדי לראות את התכלת
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '400',
              color: '#202124',
              margin: 0
            }}>
              המסמכים שלי
            </h1>
            
            {/* Create new button - כאן באזור הראשי */}
            <button 
              onClick={createNewResume}
              style={{
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '200px'
              }}>
              <Plus size={16} />
              יצירת קו"ח חדשים
            </button>
          </div>

          {/* Documents Grid */}
          {resumes.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: '#80868b',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>📄</div>
              <h3 style={{ fontSize: '20px', fontWeight: '400', marginBottom: '8px', color: '#5f6368' }}>
                אין עדיין קורות חיים
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '24px', color: '#80868b' }}>
                צור את קורות החיים הראשונים שלך!
              </p>
              <button 
                onClick={createNewResume}
                style={{
                  background: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                צור עכשיו
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '32px',
              maxWidth: '1200px'
            }}>
              {resumes.map((resume) => {
                const imageUrl = getImageUrl(resume);
                
                return (
                  <div 
                    key={resume.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      position: 'relative'
                    }}
                    onMouseEnter={() => setHoveredCard(resume.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Document Preview - תמונה אמיתית מ-AWS */}
                    <div style={{
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      {imageUrl ? (
                        <div style={{
                          width: '200px',
                          height: '280px',
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: '1px solid #e0e0e0'
                        }}>
                          <img 
                            src={imageUrl}
                            alt={resume.fileName || 'קורות חיים'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top center',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentNode.querySelector('.placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="placeholder"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f0f0f0',
                              fontSize: '32px',
                              color: '#999'
                            }}
                          >
                            📄
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: '200px',
                          height: '280px',
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Header כחול */}
                          <div style={{
                            backgroundColor: '#1e3a8a',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {resume.fileName}
                          </div>
                          
                          {/* תוכן המסמך */}
                          <div style={{
                            padding: '16px',
                            height: 'calc(100% - 60px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            {/* שורות טקסט מדומות */}
                            {[...Array(12)].map((_, i) => (
                              <div key={i} style={{
                                height: '4px',
                                backgroundColor: i % 4 === 0 ? '#3b82f6' : '#e5e7eb',
                                borderRadius: '2px',
                                width: i % 3 === 0 ? '100%' : `${70 + (i * 5) % 30}%`
                              }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - בצד שמאל של המסמך */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: '20px',
                      opacity: 1, // תמיד נראה
                      transition: 'opacity 0.2s ease'
                    }}>
                      {/* Edit */}
                      <button
                        onClick={(e) => editResume(resume.id, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#202124',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: '500',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title="עריכה"
                      >
                        <Edit size={16} style={{ color: '#4285f4' }} />
                        עריכה
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => deleteResume(resume.id, resume.fileName, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#202124',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: '500',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="מחיקה"
                        disabled={deleteLoading === resume.id}
                      >
                        {deleteLoading === resume.id ? (
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite', color: '#4285f4' }} />
                        ) : (
                          <Trash2 size={16} style={{ color: '#4285f4' }} />
                        )}
                        מחיקה
                      </button>

                      {/* כפתור מכתב מקדים */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCoverLetterModal(resume);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#202124',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: '500',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title="יצירת מכתב מקדים"
                      >
                        <Sparkles size={16} style={{ color: '#4285f4' }} />
                        מכתב מקדים
                      </button>
                    </div>

                    {/* Document info - מתחת למסמך */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-40px',
                      right: '0',
                      left: '0',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#202124',
                        margin: '0 0 4px 0'
                      }}>
                        {resume.fileName || `מסמך #${resume.id}`}
                      </h3>
                      
                      {resume.createdAt && (
                        <div style={{
                          fontSize: '12px',
                          color: '#80868b'
                        }}>
                          עדכון אחרון: {new Date(resume.createdAt).toLocaleDateString('he-IL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setCoverLetterModal(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#202124',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={20} style={{ color: '#34a853' }} />
              יצירת מכתב מקדים עבור "{coverLetterModal.fileName}"
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#5f6368',
                marginBottom: '6px'
              }}>
                תיאור המשרה או החברה:
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="הדבק כאן את תיאור המשרה, או כתב פרטים על החברה והתפקיד שאליו אתה מגיש מועמדות..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                onBlur={(e) => e.target.style.borderColor = '#dadce0'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => generateCoverLetter(coverLetterModal.id, coverLetterModal.fileName)}
                disabled={!jobDescription.trim() || coverLetterLoading === coverLetterModal.id}
                style={{
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
                  backgroundColor: '#34a853',
                  color: 'white',
                  opacity: !jobDescription.trim() ? 0.5 : 1
                }}
              >
                {coverLetterLoading === coverLetterModal.id ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#f8f9fa',
                  color: '#5f6368'
                }}
                disabled={coverLetterLoading === coverLetterModal.id}
              >
                ביטול
              </button>
            </div>

            <div style={{
              fontSize: '12px',
              color: '#80868b',
              marginTop: '12px',
              textAlign: 'center'
            }}>
              💡 ככל שתיאור המשרה יהיה מפורט יותר, המכתב יהיה מותאם יותר
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default ResumeGallery;