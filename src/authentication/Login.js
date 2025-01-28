import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Estilo do formulário
const FormContainer = styled(Container)({
  marginTop: '50px',
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: '#f5f5f5',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para o spinner
  const auth = getAuth();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/calendario');
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true); // Ativa o loading

    try {
      // Faz login no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Obtém o token do usuário autenticado
      const token = await userCredential.user.getIdToken();
      console.log('Token gerado:', token); // Verificação do token gerado

      // Armazena o token no armazenamento local para uso posterior
      localStorage.setItem('authToken', token);

      setError('');
      navigate('/calendario'); // Redireciona para o painel principal
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false); // Desativa o loading
    }
  };

  return (
    <FormContainer maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} noValidate>
        <TextField
          label="E-mail"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Senha"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Box mt={3} display="flex" justifyContent="center">
          {loading ? (
            <CircularProgress />
          ) : (
            <Button type="submit" variant="contained" color="primary" size="large">
              Entrar
            </Button>
          )}
        </Box>
      </Box>
    </FormContainer>
  );
};

export default Login;
