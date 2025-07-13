import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';

const MapContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '70vh',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
  marginTop: theme.spacing(4),
  '& iframe': {
    width: '100%',
    height: '100%',
    border: 0,
  },
}));

const Stores = () => {
  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>Our Store Locations | Taprodev Computers</title>
        <meta name="description" content="Find our store locations in Digana, Sri Lanka. Visit us for all your computer needs." />
      </Helmet>
      
      <Box sx={{ py: 4 }}>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Visit us near at Kandy, Sri Lanka
        </Typography>
        
        <MapContainer>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.3701645405704!2d80.7318148793457!3d7.312247000000008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3614ea51718f3%3A0xf5096094abe9ce5f!2sTAPRODEV%20(PVT)%20LTD!5e0!3m2!1sen!2ssg!4v1752244229801!5m2!1sen!2ssg" 
            width="600" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Taprodev Store Location in Digana"
          ></iframe>
        </MapContainer>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
          Taprodev Computers - Digana
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Teldeniya Rd, Digana, Sri Lanka
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Stores;
