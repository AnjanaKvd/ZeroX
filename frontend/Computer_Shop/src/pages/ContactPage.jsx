import React from 'react';
import { Container, Typography, Box, Grid, Link, Paper, Button } from '@mui/material';
import { Phone, Email, Language, LocationOn, Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';

const ContactPage = () => {
  const contactInfo = {
    phone: '+94 77 123 4567',
    email: 'taprodev@gmail.com',
    website: 'taprodev.com',
    address: 'No:254, Rjawella 02, Digana, Kandy',
    social: {
      facebook: 'https://facebook.com/taprodev',
      instagram: 'https://instagram.com/taprodev',
      twitter: 'https://twitter.com/taprodev',
      linkedin: 'https://linkedin.com/company/taprodev'
    },
    businessHours: {
      weekdays: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    }
  };

  const contactItems = [
    {
      icon: <LocationOn fontSize="large" color="primary" />,
      title: 'Our Location',
      value: contactInfo.address,
      href: 'https://maps.google.com',
      isLink: true
    },
    {
      icon: <Phone fontSize="large" color="primary" />,
      title: 'Phone Number',
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone.replace(/\s+/g, '')}`,
      isLink: true
    },
    {
      icon: <Email fontSize="large" color="primary" />,
      title: 'Email Address',
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
      isLink: true
    }
  ];

  const socialIcons = [
    { icon: <Facebook />, url: contactInfo.social.facebook, name: 'Facebook' },
    { icon: <Instagram />, url: contactInfo.social.instagram, name: 'Instagram' },
    { icon: <Twitter />, url: contactInfo.social.twitter, name: 'Twitter' },
    { icon: <LinkedIn />, url: contactInfo.social.linkedin, name: 'LinkedIn' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Get In Touch
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
          Have questions or want to discuss your project? We'd love to hear from you!
          Reach out to us using the information below or send us a message.
        </Typography>
      </Box>

      {/* Contact Cards */}
      <Grid 
        container 
        spacing={4} 
        mb={8}
        justifyContent="center"
        sx={{
          '& > .MuiGrid-item': {
            display: 'flex',
            justifyContent: 'center',
            maxWidth: '100%'
          }
        }}
      >
        {contactItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper 
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                maxWidth: 350,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
                mx: 'auto',
                position: 'relative',
              }}
            >
              <Box 
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  flexShrink: 0,
                }}
              >
                {React.cloneElement(item.icon, { sx: { fontSize: 32 } })}
              </Box>
              <Typography 
                variant="h6" 
                component="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.title}
              </Typography>
              <Box sx={{ 
                mt: 'auto',
                width: '100%',
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {item.isLink ? (
                  <Link 
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    color="text.primary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                      },
                      width: '100%',
                      display: 'inline-block',
                    }}
                  >
                    {item.value}
                  </Link>
                ) : (
                  <Typography>{item.value}</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Social Media */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h5" component="h2" gutterBottom>
          Follow Us
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          {socialIcons.map((social, index) => (
            <Button
              key={index}
              variant="outlined"
              color="primary"
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                minWidth: 'auto',
                width: 50,
                height: 50,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
              aria-label={social.name}
            >
              {social.icon}
            </Button>
          ))}
        </Box>
      </Box>

    </Container>
  );
};

export default ContactPage;
