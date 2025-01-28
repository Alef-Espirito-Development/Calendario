import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState('Carregando...');
  const [fetchError, setFetchError] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Inclui o estado de loading
  const auth = getAuth();

  useEffect(() => {
    console.log('Estado do usuário no Navbar:', user);
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!loading && user?.uid) { // Certifica-se de que o carregamento terminou e o user existe
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const { firstName, lastName } = userDoc.data();
            setUserName(`${firstName} ${lastName}`);
            setFetchError(false); // Reseta erros, caso já tenha ocorrido
          } else {
            setFetchError(true);
            console.error('Usuário não encontrado no Firestore.');
          }
        } catch (error) {
          setFetchError(true);
          console.error('Erro ao buscar informações do usuário:', error);
        }
      } else if (!user) {
        setFetchError(true);
        console.error('UID do usuário não disponível.');
      }
    };

    fetchUserData();
  }, [user, loading]); // Inclui o estado de loading no array de dependências


  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Henry's Party
          </Typography>
          {loading ? ( // Exibe estado de carregamento enquanto o AuthContext carrega
            <Typography variant="body2" sx={{ mr: 2 }}>
              Carregando...
            </Typography>
          ) : user && !fetchError ? (
            <Typography variant="body2" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30, bgcolor: '#4caf50', fontSize: 14, mr: 1 }}
              >
                {userName[0]}
              </Avatar>
              {userName}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mr: 2, color: 'red' }}>
              Erro ao carregar nome
            </Typography>
          )}
          {user ? (
            <Button
              startIcon={<LogoutIcon />}
              color="inherit"
              onClick={handleLogout}
              sx={{ fontWeight: 'bold' }}
            >
              Logout
            </Button>
          ) : (
            <Button
              startIcon={<LoginIcon />}
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ fontWeight: 'bold' }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List sx={{ width: 250 }}>
          {user && (
            <>
              <ListItem>
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: 'center',
                    width: '100%',
                    fontWeight: 'bold',
                    color: '#1976d2',
                  }}
                >
                  Menu
                </Typography>
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/calendario')}>
                <ListItemIcon>
                  <CalendarTodayIcon />
                </ListItemIcon>
                <ListItemText primary="Calendário" />
              </ListItem>
              <ListItem button onClick={() => navigate('/usuarios')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Usuários" />
              </ListItem>
              <ListItem button onClick={() => navigate('/sobre')}>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary="Sobre" />
              </ListItem>
              <ListItem button onClick={() => navigate('/create-user')}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Criar Usuário" />
              </ListItem>
            </>
          )}
          <Divider />
          {!user && (
            <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
