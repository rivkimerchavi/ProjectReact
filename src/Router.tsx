import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/applayout";
import Login from "./components/login";
import Register from "./components/register";

import Auth from "./components/auth";
import TemplateList from "./components/templateList";
import TemplateForStyle from "./components/templateForStyle";
import TemplateEditor from "./components/templateEditor";
import ResumeGalleryPage from "./components/ResumeFile/ResumeGalleryPage";



export const  myRouter= createBrowserRouter([
{

        path: '/',
        element: <AppLayout />,
        errorElement: <>main error</>,
        children:
         [ 
            {path:'login',element:<Login/>},
            {path:'register',element:<Register/>},
            {path:"auth" ,element:<Auth/>},
            {path:"templateList" ,element:<TemplateList/>},
            {path:"resume-gallery", element:<ResumeGalleryPage/>}, // ⭐ הוסף את זה
            {path:"templateEditor/:name", element:<TemplateEditor/>},
         
         ] 
    }
])