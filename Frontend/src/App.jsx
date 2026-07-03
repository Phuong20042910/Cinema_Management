import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';
import DashboardLayout from './layouts/DashboardLayout';

import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import ShowtimesPage from './pages/ShowtimesPage';
import CinemasPage from './pages/CinemasPage';
import PromotionsPage from './pages/PromotionsPage';
import BookingPage from './pages/BookingPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import MoviesManager from './pages/admin/MoviesManager';
import CinemasManager from './pages/admin/CinemasManager';
import ShowtimesManager from './pages/admin/ShowtimesManager';
import UsersManager from './pages/admin/UsersManager';
import PromotionsManager from './pages/admin/PromotionsManager';
import BookingsManager from './pages/admin/BookingsManager';
import TodayShowtimes from './pages/admin/TodayShowtimes';
import StaffShiftStats from './pages/admin/StaffShiftStats';
import SmartPOS from './pages/admin/SmartPOS';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            background: 'rgba(30, 30, 35, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '15px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#1e1e23',
            },
            style: {
              borderLeft: '4px solid #00ff88',
            }
          },
          error: {
            iconTheme: {
              primary: '#ff3333',
              secondary: '#fff',
            },
            style: {
              borderLeft: '4px solid #ff3333',
            }
          }
        }} 
      />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="showtimes" element={<ShowtimesPage />} />
          <Route path="cinemas" element={<CinemasPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="movie/:id" element={<MovieDetailsPage />} />
          <Route path="booking/:movieId" element={<BookingPage />} />
          <Route path="booking/:showtimeId/seats" element={<SeatSelectionPage />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="overview" element={<AdminDashboard />} />
          <Route path="pos" element={<SmartPOS />} />
          <Route path="today-showtimes" element={<TodayShowtimes />} />
          <Route path="shift-stats" element={<StaffShiftStats />} />
          <Route path="movies"     element={<MoviesManager />} />
          <Route path="cinemas"    element={<CinemasManager />} />
          <Route path="showtimes"  element={<ShowtimesManager />} />
          <Route path="users"      element={<UsersManager />} />
          <Route path="promotions" element={<PromotionsManager />} />
          <Route path="bookings"   element={<BookingsManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
