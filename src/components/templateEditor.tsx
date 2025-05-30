// TemplateEditor מתוקן - קומפוננטה מלאה עם דיבוג
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import PersonalDetailsForm from '../components/ResumeFile/personalDetailsForm';
import ResumeDescriptionGenerator from '../components/ResumeFile/resumeDescriptionGenerator';
import EmploymentExperience from '../components/ResumeFile/employmentExperience';
import EducationAndTestSection from '../components/ResumeFile/educationAndTestSection';
import SkillSection from '../components/ResumeFile/skillSection';
import FormSelector from '../components/ResumeFile/formSelector';
import { Download, Palette, Save, ArrowRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// מיפוי שמות הקטגוריות לעברית
const formTypeLabels = {
  Shafot: "שפות",
  SherutTzvaee: "שירות צבאי",
  Korsim: "קורסים",
  Etandvuyot: "התנדבויות",
  Kishurim: "קישורים",
  Tahbivim: "תחביבים",
  Mamlitsim: "ממליצים",
  Motamishit: "מוטיבציה אישית",
};

// פונקציה עזר להמרת שמות חודשים לעברית למספרים
const getMonthNumber = (monthName) => {
  const monthNames = {
    'ינואר': 0, 'פברואר': 1, 'מרץ': 2, 'אפריל': 3, 'מאי': 4, 'יוני': 5,
    'יולי': 6, 'אוגוסט': 7, 'ספטמבר': 8, 'אוקטובר': 9, 'נובמבר': 10, 'דצמבר': 11
  };
  return monthNames[monthName] !== undefined ? monthNames[monthName] : 0;
};

const TemplateEditor = () => {
  const { name } = useParams(); // template name או "edit"/"new"
  const location = useLocation();
  
  // 🚨 דיבוג בתחילת הקומפוננטה
  console.log('🎬 TemplateEditor התחיל להיטען!');
  console.log('📍 location.state:', location.state);
  
  // 🔍 זיהוי אם זה עריכה של קורות חיים קיימים
  const isEditingExisting = location.state?.isEditing && location.state?.resumeData;
  const existingResumeData = location.state?.resumeData;
  
  console.log('🔍 isEditingExisting:', isEditingExisting);
  console.log('📋 existingResumeData:', existingResumeData);

  // אם יש נתונים - הדפיסי אותם
  if (existingResumeData) {
    console.log('✅ יש נתונים! פרטים:');
    console.log('שם פרטי:', existingResumeData.firstName);
    console.log('שם משפחה:', existingResumeData.lastName);
    console.log('אימייל:', existingResumeData.email);
    console.log('טלפון:', existingResumeData.phone);
    console.log('תקציר:', existingResumeData.summary);
    console.log('כל השדות:', Object.keys(existingResumeData));
  } else {
    console.log('❌ אין נתונים ב-existingResumeData');
  }

  // 🚫 חסימת שמירה גלובלית
  const [blockAutoSave, setBlockAutoSave] = useState(true);

  // 🔧 הוספת state למניעת דריסת נתונים
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // State מנוהל
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    email: 'default@email.com',
    phone: '',
    city: '',
    country: '',
    address: '',
    citizenship: '',
    licenseType: '',
    birthDate: '',
    idNumber: '',
    image: ''
  });
  const [summary, setSummary] = useState('');
  const [experienceList, setExperienceList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [testList, setTestList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [formSelectorData, setFormSelectorData] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved');
  const [resumeId, setResumeId] = useState(null);
  const [isInitialCreation, setIsInitialCreation] = useState(true);
  const [cssLoaded, setCssLoaded] = useState(false);
  const [templateName, setTemplateName] = useState('1'); // default template

  // הגדרת השרת
  const API_BASE_URL = 'http://localhost:5227';

  // 🔄 טעינת נתונים קיימים - גרסה מתוקנת!
  useEffect(() => {
    console.log('🚀 useEffect רץ! נבדוק מה יש לנו:', {
      isEditingExisting,
      hasExistingData: !!existingResumeData,
      dataLoaded,
      initialLoadComplete,
      locationState: location.state
    });

    // 🔍 הדפסת הנתונים הגולמיים שמגיעים
    if (existingResumeData) {
      console.log('📋 נתונים גולמיים שהגיעו:', existingResumeData);
      console.log('📋 שמות השדות:', Object.keys(existingResumeData));
    }

    // 🚨 כפיית טעינה אם יש נתונים
    if (isEditingExisting && existingResumeData) {
      console.log('💪 כופה טעינת נתונים!');
      
      // עדכון מיידי של formData
      const newFormData = {
        firstName: existingResumeData.firstName || '',
        lastName: existingResumeData.lastName || '',
        position: existingResumeData.position || '',
        email: existingResumeData.email || 'default@email.com',
        phone: existingResumeData.phone || '',
        city: existingResumeData.city || '',
        country: existingResumeData.country || '',
        address: existingResumeData.address || '',
        citizenship: existingResumeData.citizenship || '',
        licenseType: existingResumeData.licenseType || '',
        birthDate: existingResumeData.birthDate || '',
        idNumber: existingResumeData.idNumber || '',
        image: existingResumeData.profileImage || ''
      };
      
      console.log('⚡ מעדכן formData ל:', newFormData);
      setFormData(newFormData);
      
      // עדכון summary
      const newSummary = existingResumeData.summary || '';
      console.log('⚡ מעדכן summary ל:', newSummary);
      setSummary(newSummary);
      
      // טעינת ניסיון תעסוקתי
      if (existingResumeData.employmentExperienceItems && existingResumeData.employmentExperienceItems.length > 0) {
        console.log('💼 טוען ניסיון תעסוקתי:', existingResumeData.employmentExperienceItems);
        const experiences = existingResumeData.employmentExperienceItems.map(exp => ({
          company: exp.company || '',
          position: exp.position || '',
          jobType: exp.jobType || '',
          location: exp.location || '',
          startDate: {
            month: exp.startDate ? new Date(exp.startDate).toLocaleDateString('he-IL', { month: 'long' }) : '',
            year: exp.startDate ? new Date(exp.startDate).getFullYear().toString() : ''
          },
          endDate: exp.currentJob ? null : {
            month: exp.endDate ? new Date(exp.endDate).toLocaleDateString('he-IL', { month: 'long' }) : '',
            year: exp.endDate ? new Date(exp.endDate).getFullYear().toString() : ''
          },
          currentJob: exp.currentJob || false,
          experience: exp.experience || ''
        }));
        setExperienceList(experiences);
      }
      
      // טעינת השכלה
      if (existingResumeData.educationItems && existingResumeData.educationItems.length > 0) {
        console.log('🎓 טוען השכלה:', existingResumeData.educationItems);
        setEducationList(existingResumeData.educationItems);
      }
      
      // טעינת מבחנים
      if (existingResumeData.testItems && existingResumeData.testItems.length > 0) {
        console.log('📊 טוען מבחנים:', existingResumeData.testItems);
        const tests = existingResumeData.testItems.map(test => ({
          name: test.name || '',
          score: test.score || ''
        }));
        setTestList(tests);
      }
      
      // טעינת מיומנויות
      if (existingResumeData.skills && existingResumeData.skills.length > 0) {
        console.log('🛠️ טוען מיומנויות:', existingResumeData.skills);
        const skillsData = existingResumeData.skills.map(skill => ({
          name: skill.name || '',
          level: skill.level || ''
        }));
        setSkills(skillsData);
      }
      
      // טעינת שפות ונתונים נוספים
      const formSelectorTemp = {};
      
      if (existingResumeData.languageItems && existingResumeData.languageItems.length > 0) {
        console.log('🗣️ טוען שפות:', existingResumeData.languageItems);
        formSelectorTemp.Shafot = existingResumeData.languageItems.map(lang => [
          lang.languageName || '',
          lang.proficiencyLevel || ''
        ]);
      }
      
      if (existingResumeData.courseItems && existingResumeData.courseItems.length > 0) {
        console.log('📚 טוען קורסים:', existingResumeData.courseItems);
        formSelectorTemp.Korsim = existingResumeData.courseItems.map(course => [
          course.courseName || '',
          course.institution || '',
          course.year || ''
        ]);
      }
      
      // הוספת קטגוריות נוספות...
      if (Object.keys(formSelectorTemp).length > 0) {
        console.log('📋 טוען נתונים נוספים:', formSelectorTemp);
        setFormSelectorData(formSelectorTemp);
      }
      
      // עדכון template
      if (existingResumeData.template) {
        console.log('⚡ מעדכן template ל:', existingResumeData.template);
        setTemplateName(existingResumeData.template.toString());
      }
      
      // עדכון ID
      if (existingResumeData.id) {
        console.log('⚡ מעדכן resumeId ל:', existingResumeData.id);
        setResumeId(existingResumeData.id);
        setIsInitialCreation(false);
      }
      
      setDataLoaded(true);
      setInitialLoadComplete(true);
      
      console.log('✅ כל העדכונים הושלמו!');
    } else {
      console.log('🆕 קורות חיים חדשים או אין נתונים');
      setDataLoaded(true);
      setInitialLoadComplete(true);
      
      if (name && name !== 'edit' && name !== 'new') {
        setTemplateName(name);
      }
    }
  }, [isEditingExisting, existingResumeData]); // ⚡ עם dependencies!

  // 🚫 חסימת כל פונקציות שמירה אוטומטית
  useEffect(() => {
    window.blockAutoSave = true;
    window.resumeAutoSaveBlocked = true;
    
    const originalAxios = axios.post;
    axios.post = (...args) => {
      if (args[0] && args[0].includes('resume-file') && blockAutoSave) {
        console.log('🚫 חסימת שמירה אוטומטית!', args[0]);
        return Promise.resolve({ data: { blocked: true } });
      }
      return originalAxios.apply(axios, args);
    };

    return () => {
      delete window.blockAutoSave;
      delete window.resumeAutoSaveBlocked;
      axios.post = originalAxios;
    };
  }, [blockAutoSave]);

  // 🎨 טעינה דינמית של CSS לפי שם התבנית
  useEffect(() => {
    let isMounted = true;

    const loadTemplateCSS = async () => {
      if (!templateName) return;

      try {
        console.log(`🎨 טוען CSS עבור תבנית: ${templateName}`);
        
        const templateResponse = await axios.get(`${API_BASE_URL}/api/TemplateForStyle/${templateName}`);
        const templateData = templateResponse.data;
        
        console.log('📦 פרטי תבנית מהשרת:', templateData);
        
        if (!isMounted) return;
        
        if (!templateData.css) {
          throw new Error('לא נמצא קישור לCSS');
        }
        
        const existingLinks = document.querySelectorAll('link[data-template-css]');
        existingLinks.forEach(link => link.remove());

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = templateData.css;
        link.setAttribute('data-template-css', templateName);
        
        document.head.appendChild(link);

        link.onload = () => {
          if (isMounted) {
            console.log(`✅ CSS נטען בהצלחה מ-AWS עבור: ${templateName}`);
            setCssLoaded(true);
          }
        };

        link.onerror = () => {
          if (isMounted) {
            console.warn(`⚠️ לא ניתן לטעון CSS מ-AWS עבור: ${templateName}, משתמש בעיצוב מובנה`);
            loadFallbackCSS();
            setCssLoaded(true);
          }
        };

      } catch (error) {
        if (isMounted) {
          console.error('❌ שגיאה בטעינת CSS:', error);
          console.warn('🔄 טוען CSS מובנה');
          loadFallbackCSS();
          setCssLoaded(true);
        }
      }
    };

    const loadFallbackCSS = () => {
      const existingStyle = document.querySelector('style[data-fallback-css]');
      if (existingStyle) existingStyle.remove();

      const style = document.createElement('style');
      style.setAttribute('data-fallback-css', 'true');
      style.textContent = `
/* Resume Template CSS - Fallback Styles */
.container {
    font-family: 'Assistant', Arial, sans-serif;
    direction: rtl;
    background-color: #ffffff;
    height: 100%;
    width: 100%;
    display: flex;
    border-radius: 0px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    transform-origin: top left;
}

.rightSide {
    width: 35%;
    background-color: #0d1b35;
    color: white;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 10px;
    position: relative;
    overflow: hidden;
}

.leftSide {
    width: 65%;
    background-color: #ffffff;
    padding: 12px 18px;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.profileImageContainer {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #295786;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    border: 2px solid rgba(255,255,255,0.2);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    align-self: center;
}

.profileImage {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.sidebarSection {
    width: 100%;
    text-align: right;
    margin-bottom: 10px;
}

.sidebarTitle {
    font-size: 7px;
    font-weight: 600;
    margin-bottom: 3px;
    color: white;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    padding-bottom: 1px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
}

.contactItem {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 3px;
    font-size: 7px;
    line-height: 1.2;
    direction: rtl;
}

.contactText {
    margin-left: 4px;
    word-break: break-word;
    text-align: right;
}

.contactIcon {
    width: 8px;
    height: 8px;
    fill: white;
    opacity: 0.8;
    margin-right: 0px;
}

.skillItem {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 3px;
    direction: rtl;
}

.skillName {
    font-size: 7px;
    font-weight: 500;
    color: white;
    margin-left: 5px;
    text-align: right;
}

.languageItem {
    margin-bottom: 5px;
    text-align: right;
}

.languageName {
    font-weight: bold;
    font-size: 8px;
    margin-bottom: 1px;
}

.languageLevel {
    font-size: 7px;
    color: rgba(255,255,255,0.8);
}

.additionalSectionField {
    font-size: 6px;
    font-weight: bold;
    color: white;
    margin-bottom: 0.5px;
    text-align: right;
}

.additionalSectionSubField {
    font-size: 5px;
    font-weight: normal;
    color: rgba(255,255,255,0.8);
    margin-bottom: 0.5px;
    text-align: right;
}

.mainName {
    font-size: 18px;
    font-weight: 700;
    color: #1a237e;
    margin: 0 0 4px 0;
    text-align: right;
    line-height: 1.1;
}

.mainTitle {
    font-size: 11px;
    margin: 0 0 12px 0;
    color: #666;
    text-align: right;
    font-weight: 400;
    font-style: italic;
}

.mainSection {
    margin-bottom: 12px;
}

.mainSectionTitle {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #0d1b35;
    padding-bottom: 3px;
    margin-bottom: 7px;
    text-align: right;
}

.summaryText {
    line-height: 1.4;
    font-size: 9px;
    color: #444;
    text-align: justify;
    text-justify: inter-word;
}

.experienceItem {
    margin-bottom: 10px;
    position: relative;
    padding-right: 8px;
    border-right: 2px solid #e0e0e0;
}

.experiencePosition {
    font-weight: bold;
    font-size: 10px;
    color: #2c3e50;
    margin-bottom: 2px;
}

.experienceDate {
    font-size: 8px;
    color: #777;
    font-style: italic;
    margin-bottom: 4px;
}

.experienceDetailsList {
    list-style-type: none;
    padding-right: 0;
    margin: 5px 0 0 0;
}

.experienceDetailItem {
    display: flex;
    align-items: flex-start;
    margin-bottom: 3px;
    font-size: 8px;
    line-height: 1.3;
    color: #454545;
}

.bulletIcon {
    margin-right: 0px;
    margin-left: 4px;
    color: #0d1b35;
    font-size: 1.0em;
    line-height: 1;
    font-weight: bold;
}

.educationItem {
    margin-bottom: 8px;
    padding-right: 8px;
    border-right: 2px solid #e0e0e0;
}

.educationField {
    font-weight: bold;
    font-size: 10px;
    color: #2c3e50;
    margin-bottom: 2px;
}

.educationInstitution {
    font-size: 9px;
    color: #555;
    font-weight: 500;
}

.educationDate {
    font-size: 8px;
    color: #777;
    font-style: italic;
    background-color: #f5f5f5;
    padding: 1px 4px;
    border-radius: 6px;
}

.testItem {
    font-size: 8px;
    color: #454545;
    margin-bottom: 3px;
    padding-right: 8px;
    border-right: 2px solid #e0e0e0;
}

.noDataMessage {
    text-align: center;
    padding: 80px 40px;
    color: #999;
    background-color: #fafafa;
    border-radius: 15px;
    border: 2px dashed #ddd;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    font-size: 18px;
}

.noDataIcon {
    font-size: 64px;
    margin-bottom: 20px;
    color: #ccc;
}
      `;
      document.head.appendChild(style);
      console.log('✅ CSS מובנה נטען בהצלחה');
    };

    loadTemplateCSS();

    return () => {
      isMounted = false;
    };
  }, [templateName, API_BASE_URL]);

  // פונקציה לקבלת טוקן
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('jwtToken') || 
           localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken');
  }, []);

  // 🔴 שמירה רק ידנית
  const saveResumeWithImage = useCallback(async (forceManual = false) => {
    if (blockAutoSave && !forceManual) {
      console.log('🚫 שמירה אוטומטית נחסמה!');
      return null;
    }

    console.log('💾 שמירה ידנית - התחלה');
    
    try {
      setSaveStatus('saving');
      
      if (!formData?.firstName && !formData?.lastName && !summary && 
          experienceList.length === 0 && educationList.length === 0 && 
          testList.length === 0 && skills.length === 0) {
        console.log('🔕 אין נתונים לשמירה');
        alert('נא למלא לפחות פרט אחד לפני השמירה');
        setSaveStatus('saved');
        return;
      }

      const token = getAuthToken();
      if (!token) {
        alert('נדרש להתחבר מחדש לפני השמירה');
        throw new Error('לא נמצא טוקן התחברות');
      }

      console.log('📸 יוצר תמונה של קורות החיים...');
      
      const resumeElement = document.getElementById('resume-preview');
      if (!resumeElement) {
        throw new Error('לא נמצא אלמנט התצוגה המקדימה');
      }

      const canvas = await html2canvas(resumeElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: resumeElement.offsetWidth,
        height: resumeElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      const imageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });

      let baseFileName;
      const isLocalId = resumeId && resumeId.toString().startsWith('local_');
      if (!isLocalId && resumeId && !isInitialCreation) {
        baseFileName = `resume_${resumeId}.png`;
      } else {
        baseFileName = `resume_${Date.now()}.png`;
      }

      const imageFile = new File([imageBlob], baseFileName, { type: 'image/png' });

      console.log('✅ תמונה נוצרה:', imageFile.name, `${(imageFile.size / 1024).toFixed(1)}KB`);

      const formDataToSend = new FormData();
      
      formDataToSend.append('file', imageFile);
      formDataToSend.append('FileName', baseFileName);
      formDataToSend.append('Template', templateName);
      formDataToSend.append('FirstName', formData?.firstName || '');
      formDataToSend.append('LastName', formData?.lastName || '');
      formDataToSend.append('Position', formData?.position || '');
      formDataToSend.append('Email', formData?.email || 'default@email.com');
      formDataToSend.append('Phone', formData?.phone || '');
      formDataToSend.append('City', formData?.city || '');
      formDataToSend.append('Country', formData?.country || '');
      formDataToSend.append('Address', formData?.address || '');
      formDataToSend.append('Citizenship', formData?.citizenship || '');
      formDataToSend.append('LicenseType', formData?.licenseType || '');
      formDataToSend.append('BirthDate', formData?.birthDate || '');
      formDataToSend.append('IdNumber', formData?.idNumber || '');
      formDataToSend.append('ProfileImage', formData?.image || '');
      formDataToSend.append('Summary', summary || '');

      // המרת כל הרשימות ל-JSON
      formDataToSend.append('Skills', JSON.stringify((skills || []).map(skill => ({
        Name: skill.name || '',
        Level: skill.level || ''
      }))));

      formDataToSend.append('LanguageItems', JSON.stringify((formSelectorData.Shafot || []).map(lang => ({
        LanguageName: lang[0] || '',
        ProficiencyLevel: lang[1] || ''
      }))));

      formDataToSend.append('EmploymentExperienceItems', JSON.stringify((experienceList || []).map(exp => ({
        Company: exp.company || '',
        Position: exp.position || '',
        JobType: exp.jobType || '',
        Location: exp.location || '',
        StartDate: exp.startDate?.year && exp.startDate?.month ? 
                   new Date(parseInt(exp.startDate.year), getMonthNumber(exp.startDate.month), 1).toISOString() : 
                   new Date().toISOString(),
        EndDate: exp.currentJob ? new Date().toISOString() : 
                 (exp.endDate?.year && exp.endDate?.month ? 
                  new Date(parseInt(exp.endDate.year), getMonthNumber(exp.endDate.month), 1).toISOString() : 
                  new Date().toISOString()),
        CurrentJob: exp.currentJob || false,
        Experience: exp.experience || ''
      }))));

      formDataToSend.append('EducationItems', JSON.stringify((educationList || []).map(edu => ({
        Institution: edu.institution || '',
        Field: edu.field || '',
        StartDate: edu.startDate || '',
        EndDate: edu.endDate || ''
      }))));

      formDataToSend.append('CourseItems', JSON.stringify((formSelectorData.Korsim || []).map(item => ({
        CourseName: item[0] || '',
        Institution: item[1] || '',
        Year: item[2] || ''
      }))));

      formDataToSend.append('HobbyItems', JSON.stringify((formSelectorData.Tahbivim || []).map(item => ({
        HobbyName: item[0] || ''
      }))));

      formDataToSend.append('LinkItems', JSON.stringify((formSelectorData.Kishurim || []).map(link => ({
        Title: link[0] || '',
        Url: link[1] || ''
      }))));

      formDataToSend.append('MilitaryServiceItems', JSON.stringify((formSelectorData.SherutTzvaee || []).map(service => ({
        Unit: service[0] || '',
        Role: service[1] || ''
      }))));

      formDataToSend.append('MotivationItems', JSON.stringify((formSelectorData.Motamishit || []).map(item => ({
        Title: 'מוטיבציה אישית',
        Content: item[0] || ''
      }))));

      formDataToSend.append('ReferenceItems', JSON.stringify((formSelectorData.Mamlitsim || []).map(ref => ({
        Name: ref[0] || '',
        Role: ref[1] || '',
        Email: ref[4] || '',
        Phone: ref[3] || ''
      }))));

      formDataToSend.append('VolunteeringItems', JSON.stringify((formSelectorData.Etandvuyot || []).map(vol => ({
        Organization: vol[0] || '',
        Role: vol[1] || '',
        Year: vol[2] || ''
      }))));

      formDataToSend.append('TestItems', JSON.stringify((testList || []).map(test => ({
        Name: test.name || '',
        Score: test.score || ''
      }))));

      setBlockAutoSave(false);
      
      // קביעת סוג הפעולה - UPDATE אם יש ID קיים, CREATE אם חדש
      const isUpdate = resumeId && !resumeId.toString().startsWith('local_') && !isInitialCreation;
      const method = isUpdate ? 'PUT' : 'POST';
      const url = isUpdate ? `${API_BASE_URL}/resume-file/${resumeId}` : `${API_BASE_URL}/resume-file`;

      console.log(`🚀 ${isUpdate ? 'מעדכן' : 'יוצר'} קורות חיים בשרת...`);
      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 45000
      });
      console.log(data)
      console.log(`✅ ${isUpdate ? 'עודכן' : 'נוצר'} בשרת בהצלחה!`);
      
      setBlockAutoSave(true);
      
      if (response.data?.id) {
        setResumeId(response.data.id);
        console.log('🆔 ID נקבע:', response.data.id);
      }
      
      setIsInitialCreation(false);
      setSaveStatus('saved');
      return response.data;

    } catch (error) {
      console.error('❌ שגיאה בשמירה:', error);
      setSaveStatus('error');
      setBlockAutoSave(true);
      
      if (error.response?.status === 401) {
        console.error('🔐 בעיית הרשאה - טוקן לא תקין');
        alert('בעיית הרשאה - נא להתחבר מחדש');
        localStorage.removeItem('jwtToken');
      }
      
      throw error;
    }
  }, [formData, summary, experienceList, educationList, testList, skills, formSelectorData, resumeId, getAuthToken, API_BASE_URL, isInitialCreation, blockAutoSave, templateName]);

  // 🛡️ Event handlers פשוטים - ללא הגנות
  const handleFormChange = (data) => {
    console.log('📝 Form change קיבל:', data);
    setFormData(data);
  };

  const handleSummaryChange = (newSummary) => {
    console.log('📝 Summary change קיבל:', newSummary);
    setSummary(newSummary);
  };

  const handleAddExperience = (newExp) => {
    console.log('📝 Add experience קיבל:', newExp);
    setExperienceList(prev => [...prev, newExp]);
  };

  const handleExperienceUpdate = (updatedExperienceList) => {
    console.log('📝 Experience update קיבל:', updatedExperienceList);
    setExperienceList(updatedExperienceList);
  };

  const handleEducationUpdate = (updatedEducation) => {
    console.log('📝 Education update קיבל:', updatedEducation);
    setEducationList(updatedEducation);
  };

  const handleTestUpdate = (updatedTests) => {
    console.log('📝 Test update קיבל:', updatedTests);
    setTestList(updatedTests);
  };

  const handleSkillsChange = (updatedSkills) => {
    console.log('📝 Skills change קיבל:', updatedSkills);
    setSkills(updatedSkills);
  };

  const handleFormSelector = (formType, newData) => {
    console.log('📝 Form selector קיבל:', formType, newData);
    setFormSelectorData(prev => {
      const existing = prev[formType] || [];
      const merged = [...existing, ...newData].filter(
        (item, index, self) =>
          index === self.findIndex(other => JSON.stringify(other) === JSON.stringify(item))
      );
      return { ...prev, [formType]: merged };
    });
  };

  const handleManualSave = async () => {
    try {
      console.log('💾 שמירה ידנית - התחלה מכפתור...');
      await saveResumeWithImage(true);
      alert('✅ קורות החיים נשמרו בהצלחה!');
    } catch (error) {
      console.error('❌ שגיאה בשמירה:', error);
      alert('❌ שגיאה בשמירה. בדוק את החיבור לשרת.');
    }
  };

  // 🏠 חזרה לגלריה
  const handleBackToGallery = () => {
    window.history.back();
  };

  // הורדת PDF
  const downloadResumePDF = async () => {
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) {
      alert('שגיאה: לא ניתן למצוא את תצוגת הקורות חיים');
      return;
    }

    try {
      console.log('📄 יוצר PDF להורדה...');
      
      const originalWidth = resumeElement.offsetWidth;
      const originalHeight = resumeElement.offsetHeight;
      const aspectRatio = originalWidth / originalHeight;

      let pdfWidth = 200;
      let pdfHeight = pdfWidth / aspectRatio;
      
      const canvas = await html2canvas(resumeElement, {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: originalWidth,
        height: originalHeight,
        scrollX: 0,
        scrollY: 0
      });

      const pdf = new jsPDF('portrait', 'mm', [pdfWidth, pdfHeight]);
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `קורות_חיים_${formData?.firstName || 'ללא_שם'}_${formData?.lastName || 'ללא_משפחה'}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF הורד בהצלחה');
      
    } catch (error) {
      console.error('שגיאה ביצירת PDF:', error);
      alert('שגיאה ביצירת קובץ ה-PDF. נא לנסות שוב.');
    }
  };

  const formatExperienceDate = (exp) => {
    if (!exp.startDate || !exp.startDate.month || !exp.startDate.year) return "תאריך לא צוין";
    const startDate = `${exp.startDate.month} ${exp.startDate.year}`;
    const endDate = exp.currentJob ? 'עובד/ת כיום' : 
                    (exp.endDate && exp.endDate.month && exp.endDate.year ? `${exp.endDate.month} ${exp.endDate.year}` : 'תאריך סיום לא צוין');
    return `${startDate} - ${endDate}`;
  };

  const renderSkillProgressCircle = (level) => {
    const radius = 8;
    const strokeWidth = 1.5;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    let strokeDasharray, strokeDashoffset;
    
    if (level === 'גבוהה' || level === 'מתקדם' || level === 'גבוה') {
      strokeDasharray = `${circumference} ${circumference}`;
      strokeDashoffset = 0;
    } else if (level === 'בינונית' || level === 'בינוני') {
      strokeDasharray = `${circumference} ${circumference}`;
      strokeDashoffset = circumference * 0.5;
    } else {
      strokeDasharray = `${circumference} ${circumference}`;
      strokeDashoffset = circumference * 0.75;
    }

    return (
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          stroke="rgba(255,255,255,0.2)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="white"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    );
  };

  const renderResumePreview = () => {
    if (!formData) {
      return (
        <div className="noDataMessage">
          <span className="noDataIcon">📄</span>
          נא למלא פרטים בטפסים מימין כדי לראות תצוגה מקדימה
        </div>
      );
    }

    const formatExperiencePoints = (experienceText) => {
      if (!experienceText) return [];
      return experienceText.split('\n')
        .map(line => line.trim())
        .filter(line => line);
    };

    return (
      <div className="container">
        {/* חלק ימני (כחול כהה) של קורות החיים */}
        <div className="rightSide">
          {formData.image && (
            <div className="profileImageContainer"> 
              <img src={formData.image} alt="Profile" className="profileImage" />
            </div>
          )}

          <div className="sidebarSection">
            <h3 className="sidebarTitle">פרטי קשר</h3>
            {formData.phone && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                <span className="contactText">{formData.phone}</span>
              </div>
            )}
            {formData.email && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <span className="contactText">{formData.email}</span>
              </div>
            )}
            {formData.city && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span className="contactText">{formData.city}{formData.address ? `, ${formData.address}` : ''}</span>
              </div>
            )}
            {formData.country && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24">
                  <path d="M12 2L15 8l6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z" />
                </svg>
                <span className="contactText">{formData.country}</span>
              </div>
            )}
            {formData.citizenship && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 3.38 2.67 6.14 6 6.5V22h2v-6.5c3.33-.36 6-3.12 6-6.5 0-3.87-3.13-7-7-7z" />
                </svg>
                <span className="contactText">{formData.citizenship}</span>
              </div>
            )}
            {formData.birthDate && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24">
                  <path d="M7 10h5v5H7zm6-7h-1V1h-2v2H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3V3z" />
                </svg>
                <span className="contactText">{formData.birthDate}</span>
              </div>
            )}
            {formData.idNumber && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="contactText">{formData.idNumber}</span>
              </div>
            )}
            {formData.licenseType && (
              <div className="contactItem">
                <svg className="contactIcon" viewBox="0 0 24 24">
                  <path d="M5 16v2h14v-2H5zm7-14L5 8h14l-7-6zM7 10h10v4H7v-4z" />
                </svg>
                <span className="contactText">{formData.licenseType}</span>
              </div>
            )}
          </div>

          {skills.length > 0 && (
            <div className="sidebarSection">
              <h3 className="sidebarTitle">מיומנויות</h3>
              {skills.map((skill, index) => (
                <div key={index} className="skillItem">
                  {renderSkillProgressCircle(skill.level)}
                  <span className="skillName">{skill.name}</span>
                </div>
              ))}
            </div>
          )}

          {formSelectorData.Shafot && formSelectorData.Shafot.length > 0 && (
            <div className="sidebarSection">
              <h3 className="sidebarTitle">שפות</h3>
              {formSelectorData.Shafot.map((lang, index) => (
                <div key={index} className="languageItem">
                  <div className="languageName">{lang[0]}</div>
                  {lang[1] && <div className="languageLevel">{lang[1]}</div>}
                </div>
              ))}
            </div>
          )}
           
          {Object.entries(formSelectorData)
              .filter(([categoryKey]) => categoryKey !== 'Shafot' && categoryKey !== 'Korsim')
              .map(([categoryKey, entries]) =>
              entries.length > 0 && (
                  <div key={categoryKey} className="sidebarSection">
                  <h3 className="sidebarTitle">{formTypeLabels[categoryKey] || categoryKey}</h3>
                  {entries.map((entry, entryIndex) => (
                      <div key={entryIndex} style={{ marginBottom: '3px' }}>
                      {entry.map((field, fieldIndex) =>
                          field && (
                          <div
                              key={fieldIndex}
                              className={fieldIndex === 0 ? 'additionalSectionField' : 'additionalSectionSubField'}
                          >
                              {field}
                          </div>
                          )
                      )}
                      </div>
                  ))}
                  </div>
              )
          )}
        </div>

        {/* חלק שמאלי (לבן) של קורות החיים */}
        <div className="leftSide">
          <h1 className="mainName">{formData.firstName} {formData.lastName}</h1>
          {formData.position && <h2 className="mainTitle">{formData.position}</h2>}

          {summary && (
            <div className="mainSection">
              <h3 className="mainSectionTitle">תקציר מקצועי</h3>
              <p className="summaryText">{summary}</p>
            </div>
          )}
          
          {experienceList.length > 0 && (
            <div className="mainSection">
              <h3 className="mainSectionTitle">ניסיון מקצועי</h3>
              {experienceList.map((exp, index) => (
                exp.company && (
                  <div key={index} className="experienceItem">
                    <div className="experiencePosition">{exp.position}, {exp.company}</div>
                    <div className="experienceDate">{formatExperienceDate(exp)}</div>
                    {exp.experience && (
                      <ul className="experienceDetailsList">
                        {formatExperiencePoints(exp.experience).map((point, i) => (
                          <li key={i} className="experienceDetailItem">
                            <span className="bulletIcon">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {educationList.length > 0 && (
            <div className="mainSection">
              <h3 className="mainSectionTitle">השכלה</h3>
              {educationList.map((edu, index) => (
                 edu.institution && edu.field && (
                    <div key={index} className="educationItem">
                        <div className="educationField">{edu.field}</div>
                        <div className="educationInstitution">{edu.institution}</div>
                        <div className="educationDate">{edu.startDate} - {edu.endDate}</div>
                    </div>
                 )
              ))}
            </div>
          )}

          {formSelectorData.Korsim && formSelectorData.Korsim.length > 0 && (
            <div className="mainSection">
              <h3 className="mainSectionTitle">קורסים והכשרות</h3>
              {formSelectorData.Korsim.map((item, index) => (
                <div key={index} className="educationItem">
                  {item[0] && <div className="educationField">{item[0]}</div>}
                  {item[1] && <div className="educationInstitution">{item[1]}</div>}
                  {item[2] && <div className="educationDate">{item[2]}</div>}
                </div>
              ))}
            </div>
          )}

          {testList.length > 0 && (
            <div className="mainSection">
              <h3 className="mainSectionTitle">מבחנים</h3>
              {testList.map((test, index) => (
                <div key={index} className="testItem">
                  <strong>{test.name}:</strong> {test.score}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const layoutOptions = [
    { rightSide: '40%', leftSide: '60%' },
    { rightSide: '45%', leftSide: '55%' },
    { rightSide: '50%', leftSide: '50%' },
  ];
  const selectedOption = 2;

  // הצגת loader בזמן טעינת CSS
  if (!cssLoaded) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: "'Assistant', Arial, sans-serif",
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '18px', color: '#666' }}>טוען תבנית עיצוב...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      width: '100vw',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
      position: 'absolute', 
      top: 0,
      left: 0,
      backgroundColor: '#c0c0c0' 
    }}>
      {/* 🚫 הודעת חסימת שמירה אוטומטית */}
      {blockAutoSave && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#ff5722',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          fontFamily: "'Assistant', Arial, sans-serif"
        }}>
          🚫 שמירה אוטומטית חסומה - לחץ "שמור" כדי לשמור
        </div>
      )}

      {/* צד שמאל - תצוגה מקדימה */}
      <div style={{ 
        width: layoutOptions[selectedOption].leftSide, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
        boxSizing: 'border-box',
        backgroundColor: '#c0c0c0',
      }}>
        {/* כפתורים מעוצבים */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          padding: '0px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* כפתור חזרה לגלריה */}
            <button
              onClick={handleBackToGallery}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontFamily: "'Assistant', Arial, sans-serif",
              }}
            >
              <ArrowRight size={18} />
              <span>חזרה לגלריה</span>
            </button>

            <button
                onClick={() => alert('פונקציונליות תבנית וצבעים תתווסף בהמשך')}
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontFamily: "'Assistant', Arial, sans-serif",
                }}
            >
                <Palette size={18} />
                <span>תבנית וצבעים</span> 
            </button>
            
            <button
              onClick={handleManualSave}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontFamily: "'Assistant', Arial, sans-serif",
              }}
            >
              <Save size={18} />
              <span>שמור</span>
            </button>
           </div>
          
          <button
            onClick={downloadResumePDF}
            style={{
              background: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: '6px', 
              padding: '10px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontFamily: "'Assistant', Arial, sans-serif",
            }}
          >
            <Download size={18} />
            <span>הורדת PDF</span> 
          </button>
        </div>
        
        {/* מיכל הקורות חיים */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          overflow: 'hidden', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid #ddd',
          position: 'relative',
          maxWidth: '85%',
          maxHeight: '85%',
          margin: '0 auto',
          aspectRatio: '0.7',
        }}>
          <div id="resume-preview" style={{ height: '100%', overflowY: 'auto' }}>
            {renderResumePreview()}
          </div>
        </div>
      </div>

      {/* צד ימין - טפסים */}
      <div style={{ 
        width: layoutOptions[selectedOption].rightSide, 
        height: '100%',
        overflowY: 'auto', 
        padding: '0px', 
        backgroundColor: 'rgb(250, 250, 250)', 
        color: 'white', 
        boxSizing: 'border-box',
        borderRight: '1px solid #1f2d47',
        borderLeft: '1px solid #ddd'
      }}>
        <div style={{ paddingTop: '20px' }}> 
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#333' }}>
              {isEditingExisting ? `עריכת קורות חיים - ${existingResumeData?.fileName || 'ללא שם'}` : `עריכת קורות חיים - תבנית ${templateName}`}
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              🛑 שמירה אוטומטית חסומה - לחץ "שמור" כדי לשמור!
            </p>
            {isEditingExisting && (
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#007bff' }}>
                📝 עורך קורות חיים קיימים
              </p>
            )}
          </div>
        
          {/* כל הקומפוננטים עם props למניעת שמירה אוטומטית */}
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <PersonalDetailsForm 
              onFormChange={handleFormChange} 
              initialData={formData} 
              autoSave={false}
              blockAutoSave={true}
              manualSaveOnly={true}
            />
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <ResumeDescriptionGenerator 
              onSummaryChange={handleSummaryChange} 
              initialSummary={summary}
              autoSave={false}
              blockAutoSave={true}
              manualSaveOnly={true}
            />
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <EmploymentExperience 
              onFormChange={handleAddExperience} 
              onExperienceListChange={handleExperienceUpdate}
              initialExperiences={experienceList}
              autoSave={false}
              blockAutoSave={true}
              manualSaveOnly={true}
            />
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <EducationAndTestSection
              onEducationUpdate={handleEducationUpdate}
              onTestUpdate={handleTestUpdate}
              initialEducation={educationList}
              initialTests={testList}
              autoSave={false}
              blockAutoSave={true}
              manualSaveOnly={true}
            />
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <SkillSection 
              onSkillsChange={handleSkillsChange} 
              initialSkills={skills}
              autoSave={false}
              blockAutoSave={true}
              manualSaveOnly={true}
            />
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <FormSelector 
              onFormDataChange={handleFormSelector} 
              initialData={formSelectorData}
              autoSave={false}
              blockAutoSave={true}
              manualSaveOnly={true}
            />
          </div>
          
          <div style={{ height: '50px' }}></div>
        </div>
      </div>

      {/* CSS Animation for spinner */}
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

export default TemplateEditor;