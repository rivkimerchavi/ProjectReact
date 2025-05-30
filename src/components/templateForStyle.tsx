import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';
interface Template {
  id?: string;
  code: number;
  name: string;
  pdFp{ath: string;
  filePath: string;
}

const TemplateForStyle: React.FC = () => {
  const { name } = useParams<{ name: string }>(); // שליפת ה-ID מה-URL
  const [template, setTemplate] = useState<Template>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
alert(name)
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5227/api/TemplateForStyle/${name}`);

        setTemplate(response.data);
            console.log(response.data)
       
      } catch (err: any)   
            console.error("Error fetching template:", err);
        setError(err.response?.data?.message || err.message || "Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [name]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          marginTop: '20px',
          boxShadow: '0 8px 10px rgb(0, 188, 212)',
        }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : template ? (
          <>
            <Typography variant="h5" gutterBottom>
              {template.name}
            </Typography>
            <iframe 
              src={template.pdFpath} 
              width="100%" 
              height="600px" 
              title={template.name}
              style={{ border: 'none' }}
            ></iframe>
          </>
        ) : (
          <Typography>No template found.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default TemplateForStyle;
