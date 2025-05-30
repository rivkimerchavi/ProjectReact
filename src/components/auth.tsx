import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import resumeImage from "../assets/images/2.png";

const Auth: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", bgcolor: "#f5f9ff" }}>
      {/* כפתורים עליונים */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 3,
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate("/login")}
          sx={{
            color: "#0085FF",
            borderColor: "#0085FF",
            borderRadius: "12px",
            fontWeight: 600,
            padding: "10px 20px",
            textTransform: "none",
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#f0f8ff" },
          }}
        >
          התחבר / התחברי
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/register")}
          sx={{
            bgcolor: "#0085FF",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: 600,
            padding: "10px 20px",
            textTransform: "none",
            "&:hover": { bgcolor: "#006edc" },
          }}
        >
          הרשמה / בחינם
        </Button>
      </Box>

      {/* אזור תוכן מפוצל */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          py: 6,
        }}
      >
        {/* צד שמאל - תמונה */}
        <Box
          component="img"
          src={resumeImage}
          alt="Resume"
          sx={{
            width: { xs: "80%", md: "50%" },
            maxWidth: "500px",
            mb: { xs: 4, md: 0 },
          }}
        />

        {/* צד ימין - טקסט + כפתורים */}
        <Box
          sx={{
            textAlign: "right",
            maxWidth: "500px",
            ml: { md: 6 },
          }}
        >
          <Typography variant="h4" fontWeight="bold" mb={2}>
            לוקח רק 5 שניות לעבור על קורות החיים שלך, כתוב/י אותם היטב.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            כתיבת קורות חיים מעולים לא הייתה קלה יותר. נסה/י עכשיו בחינם ויהיו לך קורות חיים מעוצבים תוך מספר דקות - בדיוק כפי שמגייסים מחפשים.
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={() => navigate("/create")}
              sx={{
                bgcolor: "#0085FF",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 600,
                padding: "10px 20px",
              }}
            >
              כתיבת קורות חיים
            </Button>
            {/* אם תבחר להחזיר את כפתור ההעלאה: */}
            {/* 
            <Button
              variant="outlined"
              onClick={() => navigate("/upload")}
              sx={{
                color: "#0085FF",
                borderColor: "#0085FF",
                borderRadius: "10px",
                fontWeight: 600,
                padding: "10px 20px",
              }}
            >
              העלאת קו"ח קיימים
            </Button>
            */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Auth;
