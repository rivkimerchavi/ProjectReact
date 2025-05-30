import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Divider,
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  HelpOutline as HelpIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// RTL cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

// RTL theme
const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "'Assistant', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          textAlign: "right",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
        },
        contained: {
          backgroundColor: '#1976d2',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        },
        outlined: {
          borderColor: 'rgba(25, 118, 210, 0.5)',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

interface Skill {
  name: string;
  level: string;
}

// מיומנויות מוכנות מראש
const predefinedSkills = [
  "כישורי ארגון",
  "פתרון בעיות",
  "עבודה בצוות",
  "יצירתיות",
  "אחריות",
  "מוסר עבודה גבוה",
  "ניהול זמן יעיל",
  "חשיבה אנליטית",
  "תפקוד במצבי לחץ",
  "יחסי אנוש מעולים",
];

// רמות מיומנות
const skillLevels = ["גבוהה", "בינונית", "בסיסית", "ללא רמה"];

// עזרה והסברים על השדות
const helpText = {
  main: "הוסף את המיומנויות והכישורים שלך. בחר מתוך הרשימה או הוסף משלך.",
};

interface SkillSectionProps {
  onSkillsChange?: (skills: Skill[]) => void;
}

export default function SkillSection({ onSkillsChange }: SkillSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("גבוהה");
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState("");
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  
  const skillButtons = [
    "כישורי ארגון",
    "פתרון בעיות",
    "עבודה בצוות",
    "יצירתיות",
    "אחריות",
    "מוסר עבודה גבוה",
    "ניהול זמן יעיל",
    "חשיבה אנליטית",
    "תפקוד במצבי לחץ",
    "יחסי אנוש מעולים",
  ];

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };
  
  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const handleAddSkill = () => {
    const skillName = customSkill || selectedSkill;

    if (!skillName) {
      setError("יש לבחור או להזין מיומנות");
      return;
    }

    // בדיקה אם המיומנות כבר קיימת
    if (skills.some(skill => skill.name === skillName)) {
      setError("מיומנות זו כבר קיימת ברשימה");
      return;
    }

    const updatedSkills = [...skills, { name: skillName, level: selectedLevel }];
    setSkills(updatedSkills);
    
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
    
    setSelectedSkill("");
    setCustomSkill("");
    setError("");
  };

  const handleDeleteSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
  };
  
  const handleQuickSkillAdd = (skillName: string) => {
    // בדיקה אם המיומנות כבר קיימת
    if (skills.some(skill => skill.name === skillName)) {
      setError("מיומנות זו כבר קיימת ברשימה");
      return;
    }

    const updatedSkills = [...skills, { name: skillName, level: "גבוהה" }];
    setSkills(updatedSkills);
    
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
    
    setError("");
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Box dir="rtl">
          <Card elevation={0} sx={{ maxWidth: 800, mx: "auto", mt: 3, border: "1px solid rgba(0, 0, 0, 0.05)" }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  {/* <IconButton 
                    size="small" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{ ml: 1 }}
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton> */}
                  <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>מיומנויות</span>
                  <IconButton size="small" aria-label="help">
                      <HelpIcon fontSize="small" />
                    </IconButton>
                </Box>
              }
              action={
                <Box display="flex" alignItems="center">
                  {/* <Tooltip title={helpText.main}>
                 
                  </Tooltip>
                  <IconButton size="small" aria-label="edit" sx={{ ml: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton> */}
                </Box>
              }
              sx={{ 
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                py: 1.5,
                backgroundColor: '#f9f9f9',
              }}
            />
            
            <Collapse in={isExpanded}>
              <CardContent>
                {/* כפתורי מיומנויות מהירות */}
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {skillButtons.slice(0, 5).map((skill, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuickSkillAdd(skill)}
                      sx={{ 
                        m: 0.5, 
                        borderRadius: '20px',
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        borderColor: '#e0e0e0',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          borderColor: '#90caf9'
                        }
                      }}
                      startIcon={<AddIcon fontSize="small" />}
                    >
                      {skill}
                    </Button>
                  ))}
                </Box>
                
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {skillButtons.slice(5, 10).map((skill, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuickSkillAdd(skill)}
                      sx={{ 
                        m: 0.5, 
                        borderRadius: '20px',
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        borderColor: '#e0e0e0',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          borderColor: '#90caf9'
                        }
                      }}
                      startIcon={<AddIcon fontSize="small" />}
                    >
                      {skill}
                    </Button>
                  ))}
                </Box>

                {/* הצגת מיומנויות שנבחרו */}
                {skills.length > 0 && !showSkillForm && (
                  <Box>
                    {skills.map((skill, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 1,
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Typography>{skill.name}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Typography color="text.secondary" sx={{ mr: 2 }}>
                            רמה: {skill.level}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteSkill(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {showSkillForm ? (
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      {/* בחר מיומנות מתוך רשימה */}
                      <Grid item xs={12} sm={5}>
                        <FormControl fullWidth>
                          <InputLabel>בחר מיומנות</InputLabel>
                          <Select
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value as string)}
                            label="בחר מיומנות"
                          >
                            {predefinedSkills.map((skill) => (
                              <MenuItem key={skill} value={skill}>
                                {skill}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* בחר רמה */}
                      <Grid item xs={12} sm={5}>
                        <FormControl fullWidth>
                          <InputLabel>רמה</InputLabel>
                          <Select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value as string)}
                            label="רמה"
                          >
                            {skillLevels.map((level) => (
                              <MenuItem key={level} value={level}>
                                {level}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* כפתור הוספה */}
                      <Grid item xs={12} sm={2}>
                        <Button
                          variant="contained"
                          onClick={handleAddSkill}
                          fullWidth
                          sx={{ height: "100%" }}
                        >
                          הוסף
                        </Button>
                      </Grid>

                      {/* מיומנות מותאמת אישית */}
                      <Grid item xs={12}>
                        <TextField
                          label="או כתוב מיומנות משלך"
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    {error && (
                      <Typography color="error" mt={2}>
                        {error}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setShowSkillForm(false);
                          setError("");
                        }}
                      >
                        ביטול
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setShowSkillForm(true)}
                      sx={{ 
                        color: '#1976d2',
                        textTransform: 'none',
                        fontWeight: 'normal'
                      }}
                    >
                      הוסף מיומנות
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Collapse>
          </Card>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
                 