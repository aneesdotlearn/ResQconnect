import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, setInitialized } from '@/store/slices/authSlice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import LoadingScreen from '@/components/ui/LoadingScreen';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
// const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
// const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));
// const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'));
// const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
// const SOSPage = lazy(() => import('@/features/sos/SOSPage'));
// const TrackingPage = lazy(() => import('@/features/tracking/TrackingPage'));
// const ContactsPage = lazy(() => import('@/features/contacts/ContactsPage'));
// const IncidentsPage = lazy(() => import('@/features/incidents/IncidentsPage'));
// const ZonesPage = lazy(() => import('@/features/zones/ZonesPage'));
// const SubscriptionPage = lazy(() => import('@/features/subscription/SubscriptionPage'));
// const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'));
// const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
// const TrackSOSPage = lazy(() => import('@/features/sos/TrackSOSPage'));

export default function App() {
  const dispatch = useDispatch();
  const { accessToken, initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    if (accessToken) dispatch(fetchMe());
    else dispatch(setInitialized());
  }, [accessToken]);

  if (!initialized && accessToken) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/track/:sosId" element={<TrackSOSPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/zones" element={<ZonesPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}