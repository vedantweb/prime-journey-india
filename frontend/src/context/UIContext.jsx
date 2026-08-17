import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService } from '../services/mockService';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  // Public customer login is intentionally removed; the isolated authService
  // remains for post-export integration. `user` only prefills booking forms.
  const [user] = useState(() => authService.current());
  const [booking, setBooking] = useState({ open: false, preset: null });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null);

  const openBooking = useCallback((preset = null) => setBooking({ open: true, preset }), []);
  const closeBooking = useCallback(() => setBooking({ open: false, preset: null }), []);
  const openFeedback = useCallback(() => setFeedbackOpen(true), []);
  const closeFeedback = useCallback(() => setFeedbackOpen(false), []);
  const openLegal = useCallback((doc) => setLegalDoc(doc), []);
  const closeLegal = useCallback(() => setLegalDoc(null), []);

  const value = useMemo(
    () => ({
      user,
      booking, openBooking, closeBooking,
      feedbackOpen, openFeedback, closeFeedback,
      legalDoc, openLegal, closeLegal,
    }),
    [user, booking, openBooking, closeBooking, feedbackOpen, openFeedback, closeFeedback, legalDoc, openLegal, closeLegal]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => useContext(UIContext);
