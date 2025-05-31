import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Divider } from '@mui/material';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    setLoginError('');
    
    // Validation
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'האימייל נדרש';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }
    
    if (!formData.password) {
      newErrors.password = 'הסיסמה נדרשת';
    } else if (formData.password.length < 3) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 3 תווים';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Attempting login with:', { 
        email: formData.email, 
        password: '***' 
      });

      const loginPayload = {
        email: formData.email,
        password: formData.password
      };

      console.log('📤 Sending login request to:', `${API_BASE_URL}/api/User/login`);
      console.log('📤 Request payload:', loginPayload);

      const response = await fetch(`${API_BASE_URL}/api/User/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // קרא את התגובה כטקסט קודם כדי לראות מה השרת מחזיר
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("✅ Login successful:", data);
          
          // שמירת הטוקן - עם כל האפשרויות
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("jwtToken", data.token);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("accessToken", data.token);
            console.log("💾 Token saved successfully");
          }
          
          // שמירת user ID אם קיים
          if (data.userId) {
            localStorage.setItem("userId", data.userId);
            console.log("💾 User ID saved:", data.userId);
          }

          // ניווט לדף הבא
          console.log("🔄 Navigating to /templateList");
          navigate('/templateList');
          
        } catch (parseError) {
          console.error("❌ Failed to parse JSON response:", parseError);
          setLoginError("שגיאה בפרסור תגובת השרת");
        }
      } else {
        // טיפול בשגיאות HTTP
        console.error(`❌ HTTP Error ${response.status}:`, responseText);
        
        let errorMessage = "התחברות נכשלה";
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // אם לא ניתן לפרסר את השגיאה כ-JSON
          if (response.status === 401) {
            errorMessage = "אימייל או סיסמה שגויים";
          } else if (response.status === 400) {
            errorMessage = "נתונים לא תקינים";
          } else if (response.status === 500) {
            errorMessage = "שגיאת שרת פנימית";
          } else {
            errorMessage = `שגיאת שרת: ${response.status}`;
          }
        }
        
        setLoginError(errorMessage);
      }
      
    } catch (error) {
      console.error("❌ Network/Fetch Error:", error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setLoginError("לא ניתן להתחבר לשרת. בדוק שהשרת פועל.");
      } else {
        setLoginError("שגיאת רשת. אנא בדוק את החיבור לאינטרנט.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth URL
    const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback');
    const scope = encodeURIComponent('openid email profile');
    
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
    
    window.location.href = googleAuthUrl;
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  // פונקציה לבדיקת הדטה בשרת
  // const testServerConnection = async () => {
  //   try {
  //     console.log('🔍 Testing server connection...');
  //     const response = await fetch("http://localhost:5227/api/User", {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     console.log('🔍 Server test response:', response.status);
  //     if (response.ok) {
  //       console.log('✅ Server is accessible');
  //     } else {
  //       console.log('⚠️ Server responded with status:', response.status);
  //     }
  //   } catch (error) {
  //     console.error('❌ Server connection test failed:', error);
  //   }
  // };

  // // הוסף כפתור בדיקה בטופס (זמני)
  // const handleTestConnection = () => {
  //   testServerConnection();
  // };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          width: 400,
          height: 400,
          background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="sm">
        {/* Illustration */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              mx: 'auto',
              width: 256,
              height: 192,
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Computer illustration */}
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  width: 128,
                  height: 80,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '4px solid #a855f7',
                  position: 'relative'
                }}
              >
                {/* Screen */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  {/* People silhouettes */}
                  <Box sx={{ width: 24, height: 32, backgroundColor: '#a855f7', borderRadius: '50%' }} />
                  <Box sx={{ width: 24, height: 32, backgroundColor: '#3b82f6', borderRadius: '50%' }} />
                </Box>
                {/* Stand */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 16,
                    backgroundColor: '#a855f7',
                    borderRadius: '0 0 8px 8px'
                  }}
                />
              </Box>
              {/* Shield icon */}
              <Box
                sx={{
                  position: 'absolute',
                  right: -24,
                  top: 8,
                  width: 32,
                  height: 40,
                  backgroundColor: '#3b82f6',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ width: 16, height: 24, border: '2px solid white', borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Login Form */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            p: 4,
            backdropFilter: 'blur(8px)',
            maxWidth: 400,
            mx: 'auto'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#374151', textAlign: 'center', mb: 3 }}>
            התחברות
          </Typography>

          {/* Test Connection Button (זמני לדיבוג) */}
          <Button
            onClick={handleTestConnection}
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
              py: 1,
              borderColor: '#e5e7eb',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}
          >
            🔍 בדוק חיבור לשרת (דיבוג)
          </Button>

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            fullWidth
            variant="contained"
            sx={{
              mb: 3,
              py: 1.5,
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#2563eb' },
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              fontWeight: 'medium',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            כניסה באמצעות Google
          </Button>

          {/* Divider */}
          <Box sx={{ position: 'relative', my: 2 }}>
            <Divider />
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                px: 2,
                color: '#6b7280'
              }}
            >
              או
            </Typography>
          </Box>

          {/* Email/Password Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="email"
              name="email"
              label="אימייל"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#00bcd4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00bcd4',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00bcd4',
                  },
                },
              }}
            />

            <TextField
              type="password"
              name="password"
              label="סיסמה"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#00bcd4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00bcd4',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00bcd4',
                  },
                },
              }}
            />

            {loginError && (
              <Box
                sx={{
                  color: '#ef4444',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 2,
                  p: 1.5,
                  textAlign: 'center',
                  fontSize: '0.875rem'
                }}
              >
                {loginError}
              </Box>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                backgroundColor: isLoading ? '#9ca3af' : '#00bcd4',
                '&:hover': { backgroundColor: isLoading ? '#9ca3af' : '#00acc1' },
                fontWeight: 'medium',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  />
                  מתחבר...
                </Box>
              ) : (
                'המשך'
              )}
            </Button>
          </Box>

          {/* Footer links */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              component="span"
              onClick={handleForgotPassword}
              sx={{
                color: '#3b82f6',
                '&:hover': { color: '#2563eb' },
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              שכחת סיסמה?
            </Typography>
          </Box>
        </Box>

        {/* Sign up link */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            אין לך חשבון?{' '}
            <Typography
              component="span"
              onClick={handleGoToRegister}
              sx={{
                color: '#3b82f6',
                '&:hover': { color: '#2563eb' },
                fontWeight: 'medium',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              הירשם כאן
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;