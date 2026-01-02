import DashBoard from "pages/Dashboard/DashBoard";
import LoginPage from "./pages/Auth/LoginPage";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DocumentPage from "pages/Documents/DocumentPage";
import DocumentList from "pages/Documents/DocumentList";
import FlashCard from "pages/FlashCard/FlashCard";
import FlashcradList from "pages/FlashCard/FlashcradList";
import QuizResult from "pages/Quiz/QuizResult";
import ProfilePage from "pages/Profile/ProfilePage";
import QuizTake from "pages/Quiz/QuizTake";
import ProtectedRoute from "components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContent";

const App = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        {/**/}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentPage />} />
          <Route path="/flashcards" element={<FlashcradList />} />
          <Route path="/documents/:id/flashcards" element={<FlashCard />} />
          <Route path="/quizzes/:quizId" element={<QuizTake />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResult />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
