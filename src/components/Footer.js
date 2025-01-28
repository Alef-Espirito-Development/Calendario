import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { styled } from '@mui/system';

// Estilo do footer
const FooterContainer = styled(Box)({
  backgroundColor: '#1976d2',
  color: '#ffffff',
  padding: '20px 0',
  textAlign: 'center',
  marginTop: 'auto',
});

const Footer = () => {
  return (
    <FooterContainer>
      <Typography variant="body2" component="p">
        © {new Date().getFullYear()} Henry's Party - Todos os direitos reservados.
      </Typography>
      <Typography variant="body2" component="p" sx={{ mt: 1 }}>
        Desenvolvido por{' Alef Espirito '}
        <Link
          href="https://github.com/Alef-Espirito"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          underline="hover"
        >
          github
        </Link>
      </Typography>
    </FooterContainer>
  );
};

export default Footer;
