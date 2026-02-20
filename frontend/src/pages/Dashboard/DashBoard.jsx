import React, { useState, useEffect } from "react";
import Spinner from "../../components/common/Spinner";
import documentService from "../../services/documentService";
import flashcardService from "../../services/flashcardService";
import quizService from "../../services/quizService";
import { supabase } from "../../lib/supabase";
import CourseCard from "../../components/courses/CourseCard";
import TopPerformingCourses from "../../admin/TopPerformingCourses";
import {
  getAllCourses,
  getFeaturedCourses,
  createCourse,
} from "../../services/courseService";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  BookOpen,
  FilePenLine,
  TrendingUp,
  Clock,
  ArrowRight,
  Ellipsis,
} from "lucide-react";

const DashBoard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [user, setUser] = useState(null);
  const [topCourses, setTopCourses] = useState([]);

  const [activeUsers, setActiveUsers] = useState({
    last24h: null,
    last7d: null,
  });

  const fetchTopCourses = async () => {
    const { data, error } = await supabase.from("courses").select(`
    id,
    title,
    slug,
    course_enrollments(user_id),
    course_progress(completion_percent),
    course_ratings(rating)
  `);

    if (error) {
      console.error(error);
      return;
    }

    const formatted = data.map((course) => {
      const students = course.course_enrollments.length;

      const avgCompletion =
        course.course_progress.length > 0
          ? Math.round(
              course.course_progress.reduce(
                (sum, p) => sum + p.completion_percent,
                0,
              ) / course.course_progress.length,
            )
          : 0;

      const rating =
        course.course_ratings.length > 0
          ? (
              course.course_ratings.reduce((sum, r) => sum + r.rating, 0) /
              course.course_ratings.length
            ).toFixed(1)
          : null;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        students,
        avg_completion: avgCompletion,
        rating,
      };
    });

    // sort by students (top performing)
    formatted.sort((a, b) => b.students - a.students);

    const sliced = formatted.slice(0, 5);
    setTopCourses(sliced);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const documentsRes = await documentService.getDocuments();
        const flashcardsRes = await flashcardService.getAllFlashcardSets();
        const quizzesRes = await quizService.getAllQuizzes();
        const coursesResponse = await getAllCourses();
        console.log("Courses API response:", coursesResponse);

        // documentsRes may be { data: [...] } or [...]
        const documents = documentsRes.data || documentsRes || [];
        const flashcards = flashcardsRes.data || flashcardsRes || [];
        const quizzes = quizzesRes.data || quizzesRes || [];

        const coursesArray = Array.isArray(coursesResponse)
          ? coursesResponse
          : [];

        const featuredCourses = coursesArray.slice(0, 3);
        setCourses(featuredCourses);

        setDashboardData({
          overview: {
            totalDocuments: documents.length,
            totalFlashcardSets: flashcards.length,
            totalQuizzes: quizzes.length,
            totalCourses: coursesArray.length,
          },
          recentActivity: {
            documents: documents.map((doc) => ({
              ...doc,
              lastAccessed: doc.updatedAt || doc.createdAt,
            })),
            quizzes: [],
          },
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchAdminStats = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const role = sessionData?.session?.user?.app_metadata?.role;

      if (role === "admin") {
        setIsAdmin(true);
        fetchTopCourses();
        const { count, error } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        if (!error) {
          setUserCount(count);
        }
      } else {
        setIsUser(true);
      }
    };
    const trackUserActivity = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      await supabase.from("user_activity").upsert(
        {
          user_id: user.id,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    };
    const fetchActiveUsers = async () => {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const last7d = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { count: active24h } = await supabase
        .from("user_activity")
        .select("id", { count: "exact", head: true })
        .gte("last_active_at", last24h);

      const { count: active7d } = await supabase
        .from("user_activity")
        .select("id", { count: "exact", head: true })
        .gte("last_active_at", last7d);

      setActiveUsers({
        last24h: active24h,
        last7d: active7d,
      });
    };
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    fetchUser();
    fetchActiveUsers();
    trackUserActivity();
    fetchAdminStats();
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available</p>
        </div>
      </div>
    );
  }
  const stats = [
    ...(isAdmin
      ? [
          {
            label: "Total Users",
            value: userCount ?? "—",
            icon: TrendingUp,
            gradient: "from-purple-600 to-indigo-500",
            shadowColor: "shadow-purple-500/25",
          },
          {
            label: "Active Users (7d)",
            value: activeUsers.last7d ?? "—",
            icon: TrendingUp,
            gradient: "from-teal-600 to-cyan-500",
            shadowColor: "shadow-teal-500/25",
          },
          {
            label: "Total Courses",
            value: dashboardData?.overview?.totalCourses ?? 0,
            icon: BookOpen,
            gradient: "from-orange-500 to-amber-400",
            shadowColor: "shadow-orange-500/25",
          },
        ]
      : []),
    ...(isUser
      ? [
          {
            label: "Total Documents",
            value: dashboardData?.overview?.totalDocuments ?? 0,
            icon: FileText,
            gradient: "from-blue-600 to-sky-500",
            shadowColor: "shadow-blue-500/25",
          },
          {
            label: "Flashcard Sets",
            value: dashboardData?.overview?.totalFlashcardSets ?? 0,
            icon: BookOpen,
            gradient: "from-blue-500 to-blue-400",
            shadowColor: "shadow-blue-500/25",
          },
          {
            label: "Total Quizzes",
            value: dashboardData?.overview?.totalQuizzes ?? 0,
            icon: FilePenLine,
            gradient: "from-blue-700 to-blue-500",
            shadowColor: "shadow-blue-600/25",
          },
        ]
      : []),
  ];
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      {/**header */}
      <div className="relative max-w-7xl mx-auto z-10 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            {getGreeting()},{" "}
            <span className="capitalize">
              {user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                user?.email?.split("@")[0] ||
                "there"}
            </span>
          </h1>

          <p className="text-sm text-slate-500">
            Your weekly study progress is on track.{" "}
          </p>
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 shadow-sm p-5 transition hover:shadow-md"
            >
              {/* Left */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                  {stat.label}
                </p>

                <p className="text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>

              {/* Right icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4FF]">
                <stat.icon size={18} className="text-[#4F9CF9]" />
              </div>
            </div>
          ))}
        </div>

        {/* ADD OUR COURSES */}

        {isUser && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Courses</h2>
              <button
                onClick={() => navigate("/courses")}
                className="inline-flex items-center gap-2 text-sm font-light text-[#4F9CF9] hover:opacity-80 transition"
              >
                Explore all courses
                <ArrowRight size={16} />
              </button>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No courses available</p>
            )}
          </div>
        )}

        {isAdmin && topCourses.length > 0 && (
          <div className="mt-10">
            <TopPerformingCourses
              courses={topCourses}
              onViewAll={() => navigate("/courses")}
            />
          </div>
        )}

        {/* recent activity */}
        {isUser && (
          <div className="mt-12">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h3>
                <button className="text-slate-400 hover:text-slate-600">
                  <Ellipsis />
                </button>
              </div>

              {dashboardData?.recentActivity &&
              (dashboardData.recentActivity.documents?.length > 0 ||
                dashboardData.recentActivity.quizzes?.length > 0) ? (
                <div className="space-y-3">
                  {[
                    ...(dashboardData.recentActivity.documents || []).map(
                      (doc) => ({
                        id: doc._id,
                        title: doc.title,
                        timestamp: doc.lastAccessed,
                        link: `/documents/${doc._id}`,
                        type: "document",
                      }),
                    ),
                    ...(dashboardData.recentActivity.quizzes || []).map(
                      (quiz) => ({
                        id: quiz._id,
                        title: quiz.title,
                        timestamp: quiz.completedAt,
                        link: `/quizzes/${quiz._id}`,
                        type: "quiz",
                      }),
                    ),
                  ]
                    .sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
                    )
                    .slice(0, 4)
                    .map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-5 py-4"
                      >
                        {/* Left */}
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Beige icon */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4FF]">
                            <Clock size={18} className="text-[#4F9CF9]" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm text-slate-900 truncate">
                              <span className="font-semibold">
                                {activity.type === "quiz"
                                  ? "Completed quiz: "
                                  : "Accessed document: "}
                              </span>
                              <span className="text-[#4F9CF9]">
                                {activity.title}
                              </span>
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Right */}
                        <a
                          href={activity.link}
                          className="text-sm font-semibold text-[#4F9CF9] hover:underline whitespace-nowrap"
                        >
                          View Details
                        </a>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    No recent activity yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start learning to see your progress here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
