import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BlogsPage from './pages/BlogsPage';
import ChakrasPage from './pages/ChakrasPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FeedbackPage from './pages/FeedbackPage';
import DoctorsPage from './pages/DoctorsPage';
import ProductsPage from './pages/ProductsPage';
import PrakritiPage from './pages/PrakritiPage';
import LabPage from './pages/LabPage';
import SymptomFormPage from './pages/SymptomFormPage';
import RemediesPage from './pages/RemediesPage';
import DietPage from './pages/DietPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/RequireAuth';
import WeightManagementPage from './pages/WeightManagementPage';
import WeightAssessmentPage from './pages/WeightAssessmentPage';
import WeightPlanPage from './pages/WeightPlanPage';
import WeightProgressPage from './pages/WeightProgressPage';
import PanchakarmaPage from './pages/PanchakarmaPage';

export default function App() {
  // useAuth kept so Header can read user/logout
  useAuth();

  return (
    <div className="app-bg">
      <Header />
      <div className="content-shell">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/chakras" element={<ChakrasPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/prakriti" element={<PrakritiPage />} />
          <Route path="/labs" element={<LabPage />} />
          <Route path="/symptoms" element={<SymptomFormPage />} />
          <Route path="/remedies" element={<RemediesPage />} />
          <Route path="/diet" element={<DietPage />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          {/* Weight Management */}
          <Route path="/weight" element={<RequireAuth><WeightManagementPage /></RequireAuth>} />
          <Route path="/weight/assessment" element={<RequireAuth><WeightAssessmentPage /></RequireAuth>} />
          <Route path="/weight/plan" element={<RequireAuth><WeightPlanPage /></RequireAuth>} />
          <Route path="/weight/progress" element={<RequireAuth><WeightProgressPage /></RequireAuth>} />
          {/* Panchakarma */}
          <Route path="/panchakarma" element={<PanchakarmaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
