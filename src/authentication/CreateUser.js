import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Estilo do formulário
const FormContainer = styled(Container)({
  marginTop: '50px',
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: '#f5f5f5',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const CreateUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para o spinner
  const auth = getAuth();

  const departments = [
    'Desenvolvedor de software',
    'Mídia',
    'Planejamento',
    'TI',
    'Assessor de Gabinete',
    'Contole interno',
    'Desenvolvimento Econômico, Agricultura, Meio Ambiente',
    'Assistência social',
    'Administração',
    'Desenvolvimento Rural',
    'Educação',
    'Esporte',
    'Cultura, Lazer, Turismo',
    'Infraestrutura',
    'Planejamento e Finanças',
    'Saúde',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const { firstName, lastName, department, email, password } = formData;
  
    // Verifica se todos os campos estão preenchidos
    if (!firstName || !lastName || !department || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
  
    // Verifica se o e-mail é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
  
    // Verifica se a senha tem pelo menos 6 caracteres
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
  
    setLoading(true); // Ativa o loading
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simula 3 segundos de loading
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      // Salva dados adicionais no Firestore, usando o UID como ID do documento
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        department,
        email,
        password,
      });
  
      setError('');
      alert('Usuário criado com sucesso!');
      setFormData({
        firstName: '',
        lastName: '',
        department: '',
        email: '',
        password: '',
      });
    } catch (err) {
      console.error('Erro ao criar usuário:', err.message);
      setError('Erro ao criar usuário. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false); // Desativa o loading
    }
  };  

  return (
    <FormContainer maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Criar Usuário
      </Typography>
      <Box component="form" onSubmit={handleCreateUser} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome"
              fullWidth
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sobrenome"
              fullWidth
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Departamento"
              fullWidth
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              margin="normal"
              variant="outlined"
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Senha"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>
        </Grid>
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
              Criar Usuário
            </Button>
          )}
        </Box>
      </Box>
    </FormContainer>
  );
};

export default CreateUser;
