import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AddressesPage from './pages/AddressesPage';
import AddressFormPage from './pages/AddressFormPage';
import AccountPage from './pages/AccountPage';
import RequestPage from './pages/RequestPage';
import PartnersPage from './pages/PartnersPage';
import PartnerDetailsPage from './pages/PartnerDetailsPage';
import NewPage from './pages/NewPage';
import ShipmentsNewPage from './pages/ShipmentsNewPage';
import AdminQuotationPage from './pages/AdminQuotationPage';
import SettingsPage from './pages/SettingsPage';
import ScanPage from './pages/ScanPage';
import PrivateRoute from './components/PrivateRoute';
import { UserProvider } from './store/UserStore';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <PrivateRoute>
              <AddressesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/addresses/new"
          element={
            <PrivateRoute>
              <AddressFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/addresses/:id/edit"
          element={
            <PrivateRoute>
              <AddressFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/request"
          element={
            <PrivateRoute>
              <RequestPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <PrivateRoute>
              <PartnersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/partners/:id"
          element={
            <PrivateRoute>
              <PartnerDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/new"
          element={
            <PrivateRoute>
              <NewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/shipments/new"
          element={
            <PrivateRoute>
              <ShipmentsNewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/quotation"
          element={
            <PrivateRoute>
              <AdminQuotationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <PrivateRoute>
              <ScanPage />
            </PrivateRoute>
          }
        />
      </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
