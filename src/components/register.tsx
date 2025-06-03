import axios from 'axios';
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register: React.FC = () => {
  const [registerError, setRegisterError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setRegisterError('');
    console.log(data);

    try {
      // שליחת בקשה לשרת בכתובת HTTP5227
      const response = await axios.post(`${API_BASE_URL}/api/User/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // אם ההרשמה הצליחה, נשמור את הטוקן ב-localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("jwtToken", response.data.token); // גם בשם הזה למקרה שהאפליקציה משתמשת בו
      }
      
      console.log("Register successfully", response.data);
      
      // עכשיו ננווט לדף TemplateList
      navigate("/templateList");
      
    } catch (error: any) {
      console.error("Register failed", error);
      
      // הצגת הודעת שגיאה מפורטת יותר
      if (error.response?.data?.message) {
        setRegisterError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setRegisterError("Registration failed. Please check your details and try again.");
      } else if (error.response?.status === 409) {
        setRegisterError("User already exists. Please try with a different email.");
      } else {
        setRegisterError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          marginTop: '100px',
          boxShadow: '0 8px 10px rgb(0, 188, 212)',  // תוספת צבע תכלת לשיקוף
        }}
      >
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message as string || ""}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת לשיקוף
                    },
                    '&:hover fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת כשעוברים עם העכבר
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת כשיש פוקוס
                    },
                  },
                }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message as string || ""}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת לשיקוף
                    },
                    '&:hover fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת כשעוברים עם העכבר
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת כשיש פוקוס
                    },
                  },
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{
              required: "Password is required",
              minLength: {
                value: 3,
                message: "Password must be at least 3 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message as string || ""}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת לשיקוף
                    },
                    '&:hover fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת כשעוברים עם העכבר
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00bcd4',  // צבע תכלת כשיש פוקוס
                    },
                  },
                }}
              />
            )}
          />

          {registerError && (
            <Typography color="error" variant="body2" align="center" gutterBottom>
              {registerError}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              marginTop: 2,
              backgroundColor: '#00bcd4',  // צבע תכלת לכפתור
              color: 'rgb(255, 255, 255)',
              '&:hover': {
                backgroundColor: '#00acc1',  // צבע תכלת כהה יותר בהובר
              },
            }}
          >
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;