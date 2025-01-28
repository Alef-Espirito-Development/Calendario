import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Calendar from './pages/Calendar';
import Footer from './components/Footer';
import Login from '../src/authentication/Login';
import CreateUser from '../src/authentication/CreateUser';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import { useAuth } from '../src/context/AuthContext';
import ListUsers from './pages/ListUsers';

const App = () => {
  const { user, isAdmin } = useAuth(); // Estado do usuário autenticado

  return (
    <Router>
      <CssBaseline />
      <Box display="flex" flexDirection="column" minHeight="100vh">
        {/* Exibe a Navbar apenas se o usuário estiver autenticado */}
        {user && <Navbar />}
        <Container
          maxWidth="lg"
          style={{
            flex: '1 0 auto',
            marginTop: '20px',
            marginBottom: '40px', // Garante espaço entre o conteúdo e o footer
          }}
        >
          <Routes>
            {/* Rota de Login */}
            <Route path="/" element={<Login />} />

            {/* Rota protegida para o calendário */}
            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />

            {/* Rota protegida para o usuários - Apenas administrador */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  {isAdmin(user) ? <ListUsers /> : <p>Acesso negado!</p>}
                </ProtectedRoute>
              }
            />

            {/* Rota protegida para criar usuários - Apenas administrador */}
            <Route
              path="/create-user"
              element={
                <ProtectedRoute>
                  {isAdmin(user) ? <CreateUser /> : <p>Acesso negado!</p>}
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
        {/* Renderiza o Footer apenas se o usuário estiver autenticado */}
        {user && (
          <Box
            component="footer"
            style={{
              flexShrink: 0, // Garante que o footer não sobreponha o conteúdo
              backgroundColor: '#f5f5f5',
              padding: '10px 0',
              textAlign: 'center',
            }}
          >
            <Footer />
          </Box>
        )}
      </Box>
    </Router>
  );
};

export default App;
