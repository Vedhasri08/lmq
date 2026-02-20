import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashBoard from "pages/Dashboard/DashBoard";
import LoginPage from "./pages/Auth/LoginPage";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";
import RoleRoute from "./pages/routes/RoleRoutes";
import Sidebar from "./components/layout/Sidebar";
import DocumentDetail from "pages/Documents/DocumentDetail";
import DocumentList from "pages/Documents/DocumentList";
import CoursesList from "./pages/Courses/CourseList";
import CourseDetail from "./pages/Courses/CourseDetail";
import FlashCard from "pages/FlashCard/FlashCard";
import FlashcradList from "pages/FlashCard/FlashcardList";
import QuizResult from "pages/Quiz/QuizResult";
import ProfilePage from "pages/Profile/ProfilePage";
import QuizTake from "pages/Quiz/QuizTake";
import CourseFlashcards from "pages/Courses/CourseFlashcards";
import ProtectedRoute from "components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AddCourse from "./admin/AddCourse";
import AddChapters from "./admin/AddChapters";
import AddLessons from "./admin/AddLessons";
import useSupabaseAuth from "./hooks/useSupabaseAuth";
import LessonDetail from "./pages/Courses/LessonDetail";
import AddCourseStructure from "./admin/AddCourseStructure";
import AdminUsers from "./admin/AdminUsers";
import Spinner from "./components/common/Spinner";

import { supabase } from "./lib/supabase";
import LessonFlashcards from "pages/Courses/LessonFlashcards";

const App = () => {
  const user = useSupabaseAuth();
  const AdminLayoutInline = ({ children }) => {
    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white">
          {/* reuse existing sidebar component */}
          <Sidebar />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  };

  //console.log("Supabase client:", supabase);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/profile"
            element={
              <RoleRoute role="user">
                <ProfilePage />
              </RoleRoute>
            }
          />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/courses" element={<CoursesList />} />
          <Route path="/courses/:slug" element={<CourseDetail />}>
            <Route path="lessons/:lessonId" element={<LessonDetail />} />
          </Route>
          <Route path="/flashcards" element={<FlashcradList />} />
          <Route path="/documents/:id/flashcards" element={<FlashCard />} />
          <Route path="/quizzes/:quizId" element={<QuizTake />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResult />} />
          <Route
            path="/lessons/:lessonId/flashcards"
            element={<LessonFlashcards />}
          />{" "}
          {/**admin routes */}
          <Route
            path="/admin/add-course"
            element={
              <AdminRoute>
                <AddCourse />
              </AdminRoute>
            }
          />
        </Route>
        <Route
          path="/admin/courses/:courseId/chapters"
          element={
            <AdminRoute>
              <AddChapters />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/chapters/:sectionId/lessons"
          element={
            <AdminRoute>
              <AddLessons />
            </AdminRoute>
          }
        />{" "}
        <Route
          path="/admin/course/:courseId/edit"
          element={
            <AdminRoute>
              <AddCourseStructure />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/course/:courseId/structure"
          element={
            <AdminRoute>
              <AddCourseStructure />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
