"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Collapse,
  Fade,
  Grow,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material"

// Icons
import SchoolIcon from "@mui/icons-material/School"
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism"
import LinkIcon from "@mui/icons-material/Link"
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions"
import RecommendIcon from "@mui/icons-material/Recommend"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import DeleteIcon from "@mui/icons-material/Delete"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

export default function FormSelector({
  onFormDataChange,
}: {
  onFormDataChange: (formType: string, data: string[][]) => void
}) {
  const [selectedForm, setSelectedForm] = useState("")
  const [formValues, setFormValues] = useState<{ [key: string]: string[][] }>({})
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [allFormData, setAllFormData] = useState<Record<string, string[][]>>({})
  const [formCounts, setFormCounts] = useState<Record<string, number>>({})
  const theme = useTheme()

  const handleFormChange = (formType: string, data: string[][]) => {
    const existing = formValues[formType] || []

    // איחוד עם סינון כפילויות
    const merged = [...existing, ...data].filter(
      (item, index, self) => index === self.findIndex((other) => JSON.stringify(other) === JSON.stringify(item)),
    )

    const updated = { ...formValues, [formType]: merged }
    setFormValues(updated)
    setAllFormData(updated)
    onFormDataChange(formType, merged)

    // Update counts
    setFormCounts((prev) => ({
      ...prev,
      [formType]: merged.length,
    }))
  }

  const handleButtonClick = (form: string) => {
    setActiveForm((prev) => (prev === form ? null : form))
  }

  const getFormLabel = (key: string): string => {
    const labels: Record<string, string> = {
      Shafot: "שפות",
      SherutTzvaee: "שירות צבאי",
      Korsim: "קורסים",
      Etandvuyot: "התנדבויות",
      Kishurim: "קישורים",
      Tahbivim: "תחביבים",
      Mamlitsim: "ממליצים",
      Motamishit: "מוטיבציה אישית",
    }
    return labels[key] || key
  }

  const formButtons = [
    { key: "Shafot", label: "שפות", icon: <SchoolIcon /> },
    { key: "SherutTzvaee", label: "שירות צבאי", icon: <MilitaryTechIcon /> },
    { key: "Korsim", label: "קורסים", icon: <MenuBookIcon /> },
    { key: "Etandvuyot", label: "התנדבויות", icon: <VolunteerActivismIcon /> },
    { key: "Kishurim", label: "קישורים", icon: <LinkIcon /> },
    { key: "Tahbivim", label: "תחביבים", icon: <EmojiEmotionsIcon /> },
    { key: "Mamlitsim", label: "ממליצים", icon: <RecommendIcon /> },
    { key: "Motamishit", label: "מוטיבציה אישית", icon: <FormatQuoteIcon /> },
  ]

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 2,
        transition: "all 0.3s ease",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          textAlign: "right",
          mb: 2,
          color: theme.palette.primary.main,
        }}
      >
        בחר קטגוריה להוספת פרטים
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {formButtons.map(({ key, label, icon }) => {
          const count = formCounts[key] || 0
          return (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Box
                sx={{
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <Button
                  fullWidth
                  variant={activeForm === key ? "contained" : "outlined"}
                  color="primary"
                  startIcon={icon}
                  onClick={() => handleButtonClick(key)}
                  sx={{
                    p: 1.5,
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    boxShadow: activeForm === key ? 3 : 0,
                    "&:hover": {
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    {label}
                    {count > 0 && (
                      <Chip
                        size="small"
                        label={count}
                        color="primary"
                        sx={{
                          ml: 1,
                          fontWeight: "bold",
                          backgroundColor: theme.palette.primary.light,
                        }}
                      />
                    )}
                  </Box>
                </Button>
              </Box>
            </Grid>
          )
        })}
      </Grid>

      <Collapse in={activeForm !== null}>
        <Box sx={{ mt: 4 }}>
          {activeForm && (
            <Fade in={true}>
              <div>
                <FormContent
                  formType={activeForm}
                  initialData={allFormData[activeForm] || []}
                  onDataChange={handleFormChange}
                />
              </div>
            </Fade>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

// ----------- קומפוננטה להצגת טופס בהתאם לסוג -----------

const FormContent = ({
  formType,
  initialData,
  onDataChange,
}: {
  formType: string
  initialData: string[][]
  onDataChange: (formType: string, data: string[][]) => void
}) => {
  const formFields: Record<string, string[]> = {
    Shafot: ["שם השפה", "רמת השפה"],
    SherutTzvaee: ["יחידה", "תפקיד"],
    Korsim: ["שם הקורס", "מוסד לימוד", "שנה"],
    Etandvuyot: ["שם הארגון", "תפקיד", "שנה"],
    Kishurim: ["כותרת קישור", "כתובת קישור"],
    Tahbivim: ["שם התחביב"],
    Mamlitsim: ["שם", "תפקיד", "אימייל", "טלפון"],
    Motamishit: ["כותרת", "תוכן"],
  }

  if (!formFields[formType]) return null

  const formTitle =
    {
      Shafot: "שפות",
      SherutTzvaee: "שירות צבאי",
      Korsim: "קורסים",
      Etandvuyot: "התנדבויות",
      Kishurim: "קישורים",
      Tahbivim: "תחביבים",
      Mamlitsim: "ממליצים",
      Motamishit: "מוטיבציה אישית",
    }[formType] || formType

  return (
    <DynamicForm
      title={`הוסף ${formTitle}`}
      fields={formFields[formType]}
      formType={formType}
      initialData={initialData}
      onDataChange={onDataChange}
    />
  )
}

// ----------- קומפוננטה של טופס דינמי -----------

const DynamicForm = ({
  title,
  fields,
  formType,
  initialData,
  onDataChange,
}: {
  title: string
  fields: string[]
  formType: string
  initialData: string[][]
  onDataChange: (formType: string, data: string[][]) => void
}) => {
  const [entries, setEntries] = useState<string[][]>(initialData.length > 0 ? initialData : [fields.map(() => "")])
  const [successMessage, setSuccessMessage] = useState<boolean>(false)
  const theme = useTheme()

  const updateEntries = (newEntries: string[][]) => {
    setEntries(newEntries)
    onDataChange(formType, newEntries)
  }

  const handleChange = (index: number, fieldIndex: number, value: string) => {
    const updated = [...entries]
    updated[index][fieldIndex] = value
    updateEntries(updated)
  }

  const handleAdd = () => {
    updateEntries([...entries, fields.map(() => "")])
  }

  const handleRemove = (index: number) => {
    updateEntries(entries.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Filter out empty entries
    const filteredEntries = entries.filter((entry) => entry.some((field) => field.trim() !== ""))

    if (filteredEntries.length > 0) {
      updateEntries(filteredEntries)
      setSuccessMessage(true)

      setTimeout(() => {
        setSuccessMessage(false)
      }, 3000)
    }
  }

  const isEntryEmpty = (entry: string[]) => {
    return entry.every((field) => field.trim() === "")
  }

  return (
    <Paper
      sx={{
        p: 3,
        mt: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        position: "relative",
      }}
      elevation={2}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {title}
        </Typography>

        <Fade in={successMessage}>
          <Chip
            icon={<CheckCircleIcon />}
            label="נשמר בהצלחה"
            color="success"
            variant="outlined"
            sx={{ fontWeight: "medium" }}
          />
        </Fade>
      </Box>

      {entries.map((entry, idx) => (
        <Grow key={idx} in={true} style={{ transformOrigin: "0 0 0" }} timeout={300 + idx * 100}>
          <Paper
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: isEntryEmpty(entry) ? theme.palette.divider : theme.palette.primary.light,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
            elevation={1}
          >
            <Grid container spacing={2}>
              {entry.map((val, i) => (
                <Grid item xs={12} md={fields.length > 2 ? 6 : 12} key={i}>
                  <TextField
                    fullWidth
                    label={fields[i]}
                    value={val}
                    onChange={(e) => handleChange(idx, i, e.target.value)}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{
                      sx: { direction: "rtl" },
                    }}
                    InputLabelProps={{
                      sx: {
                        direction: "rtl",
                        right: 14,
                        left: "auto",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Box textAlign="left" sx={{ mt: 1 }}>
              <Tooltip title="מחק">
                <IconButton
                  onClick={() => handleRemove(idx)}
                  color="error"
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grow>
      ))}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleAdd}
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          הוסף {title.replace("הוסף ", "")}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            borderRadius: 2,
            px: 4,
          }}
        >
          שמור
        </Button>
      </Box>
    </Paper>
  )
}
