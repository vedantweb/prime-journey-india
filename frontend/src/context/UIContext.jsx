import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService } from '../services/mockService';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [user, setUser] = useState(() => authService.current());
  const [booking, setBooking] = useState({ open: false, preset: null });
  const [auth, setAuth] = useState({ open: false, mode: 'login' });
  const [legalDoc, setLegalDoc] = useState(null);

  const openBooking = useCallback((preset = null) => setBooking({ open: true, preset }), []);
  const closeBooking = useCallback(() => setBooking({ open: false, preset: null }), []);
  const openAuth = useCallback((mode = 'login') => setAuth({ open: true, mode }), []);
  const closeAuth = useCallback(() => setAuth((a) => ({ ...a, open: false })), []);
  const openLegal = useCallback((doc) => setLegalDoc(doc), []);
  const closeLegal = useCallback(() => setLegalDoc(null), []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user, setUser, logout,
      booking, openBooking, closeBooking,
      auth, openAuth, closeAuth,
      legalDoc, openLegal, closeLegal,
    }),
    [user, logout, booking, openBooking, closeBooking, auth, openAuth, closeAuth, legalDoc, openLegal, closeLegal]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => useContext(UIContext);
