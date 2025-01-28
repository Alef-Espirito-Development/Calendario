import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado do usuário
  const [loading, setLoading] = useState(true); // Controle de carregamento

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setLoading(false); // Finaliza o carregamento apenas após receber o estado do usuário
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = (user) => user?.email === 'alefj.development@gmail.com';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {!loading && children} {/* Aguarda o carregamento antes de renderizar os filhos */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
