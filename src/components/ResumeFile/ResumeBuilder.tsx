import React from "react";
import { Container, Typography, Divider, Box } from "@mui/material";
import ResumeDescriptionGenerator from "./resumeDescriptionGenerator";
import EmploymentExperience from "./employmentExperience";
import SkillSection from "./skillSection";
import FormSelector from "./formSelector";
import EducationSection from "./educationAndTestSection";
import PersonalDetailsForm from "./PersonalDetailsForm";


// ייבוא הקומפוננטות


export default function ResumeBuilder() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        בניית קורות חיים
      </Typography>

      <Divider sx={{ my: 3 }} />
      <Box sx={{ mb: 5 }}>
        <PersonalDetailsForm />
      </Box>

      {/* תיאור תקציר */}
      <Box sx={{ mb: 5 }}>
        <ResumeDescriptionGenerator />
      </Box>

      {/* ניסיון תעסוקתי */}
      <Box sx={{ mb: 5 }}>
        <EmploymentExperience />
      </Box>
      <Box sx={{ mb: 5 }}>
       <EducationSection/>
      </Box>
      {/* מיומנויות */}
      <Box sx={{ mb: 5 }}>
        <SkillSection />
      </Box>

      {/* טפסים דינמיים */}
      <Box sx={{ mb: 5 }}>
        <FormSelector />
      </Box>
    </Container>
  );
}
