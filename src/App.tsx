import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Register from './components/register'
import Login from './components/login'
import AuthComponent from './components/auth'
import AppLayout from './components/applayout'
import { RouterProvider } from 'react-router-dom'
import { myRouter } from './Router'

import TemplateList from './components/templateList'
import TemplateForStyle from './components/templateForStyle'
//import ResumeDescriptionGenerator from './components/ResumeDescriptionGenerator'
import EmploymentExperience from './components/ResumeFile/employmentExperience'
import EducationSection from './components/ResumeFile/educationAndTestSection'
import FormSelector from './components/ResumeFile/formSelector'
import ResumeDescriptionGenerator from './components/ResumeFile/resumeDescriptionGenerator'
import SkillSection from './components/ResumeFile/skillSection'
import ResumeBuilder from './components/ResumeFile/ResumeBuilder'
import TemplateEditor from './components/templateEditor'



function App() {
  const [count, setCount] = useState(0)

  return (
    // <FormSelector/>
    // <SkillSection/>
  //  <EducationSection/>
  //  <EmploymentExperience/>
//  <ResumeDescriptionGenerator/>
    <RouterProvider router={myRouter} />
    // <TemplateEditor/>
  //  <ResumeBuilder/>

  )
}

export default App
