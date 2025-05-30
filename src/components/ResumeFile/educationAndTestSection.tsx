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
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip
} from "@mui/material";
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  HelpOutline as HelpIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// RTL theme with proper Hebrew support
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
          direction: "rtl",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            textAlign: 'right',
            direction: 'rtl',
          },
          '& .MuiInputBase-inputMultiline': {
            textAlign: 'right',
            direction: 'rtl',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          textAlign: "right",
          direction: "rtl",
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

interface EducationData {
  institution: string;
  field: string;
  startDate: { month: string; year: string };
  endDate: { month: string; year: string };
  currentlyStudying: boolean;
  description: string;
}

interface TestData {
  name: string;
  score: string;
}

const initialEducationData: EducationData = {
  institution: "",
  field: "",
  startDate: { month: "", year: "" },
  endDate: { month: "", year: "" },
  currentlyStudying: false,
  description: ""
};

const initialTestData: TestData = {
  name: "",
  score: ""
};

// עזרה והסברים על השדות
const helpText = {
  main: "הוסף את השכלתך הפורמלית והלא פורמלית. תארים אקדמיים, הכשרות מקצועיות ותעודות נוספות.",
  institution: "שם המוסד האקדמי או הלימודי שבו למדת.",
  field: "תחום הלימודים או שם התואר/תעודה שקיבלת.",
  dates: "תאריכי תחילת וסיום הלימודים. סמן 'לומד/ת כיום' אם עדיין לומד/ת במוסד זה.",
  description: "פרט/י על הלימודים, הישגים מיוחדים, ממוצע ציונים או פרויקטים בולטים.",
  tests: "הוסף/י מבחני מיון שביצעת כגון פסיכומטרי, GMAT, TOEFL או בחינות הסמכה מקצועיות."
};

const monthOptions = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

export default function EducationAndTestSection({
  onEducationUpdate,
  onTestUpdate,

}: {
  onEducationUpdate?: (educationList: EducationData[]) => void;
  onTestUpdate?: (testList: TestData[]) => void;
}) {
  const [educationData, setEducationData] = useState<EducationData>(initialEducationData);
  const [testData, setTestData] = useState<TestData>(initialTestData);
  
  const [educationList, setEducationList] = useState<EducationData[]>([]);
  const [testList, setTestList] = useState<TestData[]>([]);
  
  const [isEducationExpanded, setIsEducationExpanded] = useState(true);
  const [isTestExpanded, setIsTestExpanded] = useState(true);
  
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  
  const [editingEduIndex, setEditingEduIndex] = useState(-1);
  const [editingTestIndex, setEditingTestIndex] = useState(-1);
  
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };
  
  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const handleEducationChange = (field: keyof EducationData, value: any) => {
    setEducationData({ ...educationData, [field]: value });
  };

  const handleTestChange = (field: keyof TestData, value: any) => {
    setTestData({ ...testData, [field]: value });
  };
  
  const handleDateChange = (type: "startDate" | "endDate", field: "month" | "year", value: string) => {
    const updatedData = {
      ...educationData,
      [type]: { ...educationData[type], [field]: value },
    };
    setEducationData(updatedData);
  };

  const handleAddEducation = () => {
    if (editingEduIndex >= 0) {
      // Update existing education
      const updatedEducationList = [...educationList];
      updatedEducationList[editingEduIndex] = educationData;
      setEducationList(updatedEducationList);
      setEditingEduIndex(-1);
      
      if (onEducationUpdate) {
        onEducationUpdate(updatedEducationList);
      }
    } else {
      // Add new education
      const updatedList = [...educationList, educationData];
      setEducationList(updatedList);
      
      if (onEducationUpdate) {
        onEducationUpdate(updatedList);
      }
    }
    
    setEducationData(initialEducationData);
    setShowEducationForm(false);
  };

  const handleAddTest = () => {
    if (editingTestIndex >= 0) {
      // Update existing test
      const updatedTestList = [...testList];
      updatedTestList[editingTestIndex] = testData;
      setTestList(updatedTestList);
      setEditingTestIndex(-1);
      
      if (onTestUpdate) {
        onTestUpdate(updatedTestList);
      }
    } else {
      // Add new test
      const updatedList = [...testList, testData];
      setTestList(updatedList);
      
      if (onTestUpdate) {
        onTestUpdate(updatedList);
      }
    }
    
    setTestData(initialTestData);
    setShowTestForm(false);
  };

  const handleDeleteEducation = (index: number) => {
    const updatedList = educationList.filter((_, i) => i !== index);
    setEducationList(updatedList);
    
    if (onEducationUpdate) {
      onEducationUpdate(updatedList);
    }
  };

  const handleDeleteTest = (index: number) => {
    const updatedList = testList.filter((_, i) => i !== index);
    setTestList(updatedList);
    
    if (onTestUpdate) {
      onTestUpdate(updatedList);
    }
  };
  
  const handleEditEducation = (index: number) => {
    setEducationData(educationList[index]);
    setEditingEduIndex(index);
    setShowEducationForm(true);
  };
  
  const handleEditTest = (index: number) => {
    setTestData(testList[index]);
    setEditingTestIndex(index);
    setShowTestForm(true);
  };
  
  const handleCancelEducation = () => {
    setEducationData(initialEducationData);
    setShowEducationForm(false);
    setEditingEduIndex(-1);
  };
  
  const handleCancelTest = () => {
    setTestData(initialTestData);
    setShowTestForm(false);
    setEditingTestIndex(-1);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box dir="rtl" sx={{ fontFamily: "'Assistant', 'Roboto', 'Helvetica', 'Arial', sans-serif" }}>
        {/* השכלה */}
        <Card elevation={0} sx={{ maxWidth: 800, mx: "auto", mt: 3, border: "1px solid rgba(0, 0, 0, 0.05)" }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>השכלה</span>
                <IconButton size="small" aria-label="help" onClick={handleHelpClick}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            action={
              <Box display="flex" alignItems="center">
                <Tooltip title={helpText.main}>
                  <span></span>
                </Tooltip>
              </Box>
            }
            sx={{ 
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              py: 1.5,
              backgroundColor: '#f9f9f9',
            }}
          />
          
          <Collapse in={isEducationExpanded}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'right' }}>
                במידה וקיימת השכלה רלוונטית, ניתן לציין אותה בצירוף השיוך הלימודי
              </Typography>

              {educationList.length > 0 && !showEducationForm && (
                <Box>
                  {educationList.map((edu, index) => (
                    <Paper 
                      key={index}
                      variant="outlined" 
                      sx={{ p: 2, mb: 2 }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box display="flex">
                          <IconButton size="small" onClick={() => handleDeleteEducation(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditEducation(index)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500 }}>
                            {edu.institution} - {edu.field}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {edu.startDate.month} {edu.startDate.year} - {edu.currentlyStudying ? 'לומד/ת כיום' : `${edu.endDate.month} ${edu.endDate.year}`}
                          </Typography>
                        </Box>
                      </Box>
                      {edu.description && (
                        <Typography 
                          variant="body2" 
                          dangerouslySetInnerHTML={{ 
                            __html: edu.description.replace(/\n/g, '<br/>') 
                          }} 
                          align="right"
                          sx={{ 
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            color: '#555'
                          }}
                        />
                      )}
                    </Paper>
                  ))}
                </Box>
              )}

              {!showEducationForm ? (
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => setShowEducationForm(true)}
                  sx={{ 
                    py: 1,
                    textAlign: "right", 
                    direction: "rtl", 
                    borderRadius: '4px',
                    borderColor: 'rgba(25, 118, 210, 0.5)',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderColor: '#1976d2'
                    }
                  }}
                >
                  הוסף השכלה
                </Button>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, bgcolor: "rgba(0, 0, 0, 0.02)" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="מוסד לימודים"
                        variant="standard"
                        value={educationData.institution}
                        onChange={(e) => handleEducationChange("institution", e.target.value)}
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                            direction: 'rtl',
                          }
                        }}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="תואר"
                        variant="standard"
                        value={educationData.field}
                        onChange={(e) => handleEducationChange("field", e.target.value)}
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                            direction: 'rtl',
                          }
                        }}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box mt={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" gutterBottom sx={{ textAlign: 'right' }}>
                          תאריך התחלה
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormControl fullWidth variant="standard">
                              <InputLabel id="start-month-label">חודש</InputLabel>
                              <Select
                                labelId="start-month-label"
                                value={educationData.startDate.month}
                                onChange={(e) => handleDateChange("startDate", "month", e.target.value as string)}
                                label="חודש"
                                sx={{
                                  '& .MuiSelect-select': {
                                    textAlign: 'right',
                                    direction: 'rtl',
                                  }
                                }}
                              >
                                <MenuItem value="" disabled><em>בחר חודש</em></MenuItem>
                                {monthOptions.map((month) => (
                                  <MenuItem key={`start-${month}`} value={month}>{month}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth variant="standard">
                              <InputLabel id="start-year-label">שנה</InputLabel>
                              <Select
                                labelId="start-year-label"
                                value={educationData.startDate.year}
                                onChange={(e) => handleDateChange("startDate", "year", e.target.value as string)}
                                label="שנה"
                                sx={{
                                  '& .MuiSelect-select': {
                                    textAlign: 'right',
                                    direction: 'rtl',
                                  }
                                }}
                              >
                                <MenuItem value="" disabled><em>בחר שנה</em></MenuItem>
                                {yearOptions.map((year) => (
                                  <MenuItem key={`start-${year}`} value={year}>{year}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" gutterBottom sx={{ textAlign: 'right' }}>
                          תאריך סיום
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormControl fullWidth variant="standard">
                              <InputLabel id="end-month-label">חודש</InputLabel>
                              <Select
                                labelId="end-month-label"
                                value={educationData.endDate.month}
                                onChange={(e) => handleDateChange("endDate", "month", e.target.value as string)}
                                label="חודש"
                                disabled={educationData.currentlyStudying}
                                sx={{
                                  '& .MuiSelect-select': {
                                    textAlign: 'right',
                                    direction: 'rtl',
                                  }
                                }}
                              >
                                <MenuItem value="" disabled><em>בחר חודש</em></MenuItem>
                                {monthOptions.map((month) => (
                                  <MenuItem key={`end-${month}`} value={month}>{month}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth variant="standard">
                              <InputLabel id="end-year-label">שנה</InputLabel>
                              <Select
                                labelId="end-year-label"
                                value={educationData.endDate.year}
                                onChange={(e) => handleDateChange("endDate", "year", e.target.value as string)}
                                label="שנה"
                                disabled={educationData.currentlyStudying}
                                sx={{
                                  '& .MuiSelect-select': {
                                    textAlign: 'right',
                                    direction: 'rtl',
                                  }
                                }}
                              >
                                <MenuItem value="" disabled><em>בחר שנה</em></MenuItem>
                                {yearOptions.map((year) => (
                                  <MenuItem key={`end-${year}`} value={year}>{year}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={educationData.currentlyStudying}
                          onChange={() => handleEducationChange("currentlyStudying", !educationData.currentlyStudying)}
                        />
                      }
                      label="לומד/ת כיום"
                    />
                  </Box>
                  
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      label="פירוט והישגים"
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="הסבר לגבי מחקר אקדמי, פרויקטים, הישגים יוצאי דופן..."
                      value={educationData.description}
                      onChange={(e) => handleEducationChange("description", e.target.value)}
                      sx={{
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          direction: 'rtl',
                        },
                        '& .MuiInputBase-inputMultiline': {
                          textAlign: 'right',
                          direction: 'rtl',
                        }
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </Box>

                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleCancelEducation}
                    >
                      ביטול
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddEducation}
                      disabled={!educationData.institution || !educationData.field}
                    >
                      {editingEduIndex >= 0 ? 'עדכן' : 'הוסף'} השכלה
                    </Button>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Collapse>
        </Card>

        {/* מבחנים */}
        <Card elevation={0} sx={{ maxWidth: 800, mx: "auto", mt: 3, border: "1px solid rgba(0, 0, 0, 0.05)" }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>מבחנים</span>
                <IconButton size="small" aria-label="help" onClick={handleHelpClick}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            action={
              <Box display="flex" alignItems="center">
                <Tooltip title={helpText.tests}>
                  <span></span>
                </Tooltip>
              </Box>
            }
            sx={{ 
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              py: 1.5,
              backgroundColor: '#f9f9f9',
            }}
          />
          
          <Collapse in={isTestExpanded}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'right' }}>
                הוסף מבחני מיון שביצעת כגון פסיכומטרי, GMAT, TOEFL או בחינות הסמכה מקצועיות
              </Typography>

              {testList.length > 0 && !showTestForm && (
                <Box>
                  {testList.map((test, index) => (
                    <Paper 
                      key={index}
                      variant="outlined" 
                      sx={{ p: 2, mb: 2 }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex">
                          <IconButton size="small" onClick={() => handleDeleteTest(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditTest(index)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500 }}>
                            {test.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ציון: {test.score}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}

              {!showTestForm ? (
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => setShowTestForm(true)}
                  sx={{ 
                    py: 1, 
                    borderRadius: '4px',
                    borderColor: 'rgba(25, 118, 210, 0.5)',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderColor: '#1976d2'
                    }
                  }}
                >
                  הוסף מבחן
                </Button>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, bgcolor: "rgba(0, 0, 0, 0.02)" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="שם המבחן"
                        variant="standard"
                        value={testData.name}
                        onChange={(e) => handleTestChange("name", e.target.value)}
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                            direction: 'rtl',
                          }
                        }}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ציון"
                        variant="standard"
                        value={testData.score}
                        onChange={(e) => handleTestChange("score", e.target.value)}
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                            direction: 'rtl',
                          }
                        }}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleCancelTest}
                    >
                      ביטול
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddTest}
                      disabled={!testData.name || !testData.score}
                    >
                      {editingTestIndex >= 0 ? 'עדכן' : 'הוסף'} מבחן
                    </Button>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Collapse>
        </Card>
      </Box>
    </ThemeProvider>
  );
}