import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContent";
import { supabase } from "../../lib/supabase";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import CourseProgressList from "./CourseProgressList";
import SkillsSection from "./SkillsSection";
import Improvement from "./Improvement";
import Goal from "./Goal";

const ProfilePage = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    inProgress: 0,
    totalMinutes: 0,
    avgScore: 0,
    improvement: 0,
  });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" },
  );
  useEffect(() => {
    if (!courses.length) {
      setStats({
        enrolled: 0,
        completed: 0,
        inProgress: 0,
        totalMinutes: 0,
      });
      return;
    }

    const completedCourses = courses.filter((c) => c.progress === 100).length;

    const inProgressCourses = courses.filter(
      (c) => c.progress > 0 && c.progress < 100,
    ).length;

    const totalMinutes = courses.reduce(
      (sum, c) => sum + (c.completedLessons || 0) * 5,
      0,
    );

    setStats({
      enrolled: courses.length,
      completed: completedCourses,
      inProgress: inProgressCourses,
      totalMinutes,
    });
  }, [courses]);
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
    };
    const fetchUserCourses = async () => {
      try {
        // 1️⃣ Get enrolled courses
        const { data: enrollments, error: enrollError } = await supabase
          .from("course_enrollments")
          .select("course_id")
          .eq("user_id", user.id);

        if (enrollError) throw enrollError;
        if (!enrollments.length) {
          setCourses([]);
          return;
        }

        const courseIds = enrollments.map((e) => e.course_id);

        // 2️⃣ Get courses
        const { data: coursesData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, skills")

          .in("id", courseIds);

        if (courseError) throw courseError;

        // 3️⃣ For each course, calculate progress
        const coursesWithProgress = [];

        for (const course of coursesData) {
          // sections
          const { data: sections } = await supabase
            .from("sections")
            .select("id")
            .eq("course_id", course.id);

          const sectionIds = sections.map((s) => s.id);

          // lessons
          const { data: lessons } = await supabase
            .from("lessons")
            .select("id")
            .in("section_id", sectionIds);

          const lessonIds = lessons.map((l) => l.id);

          // completed lessons
          const { count: completedCount } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", true)
            .in("lesson_id", lessonIds);

          const progress = lessonIds.length
            ? Math.round((completedCount / lessonIds.length) * 100)
            : 0;

          coursesWithProgress.push({
            ...course,
            progress,
            completedLessons: completedCount,
          });
        }
        console.log("Courses:", courses);

        setCourses(coursesWithProgress);
      } catch (err) {
        console.error("Fetch courses error:", err);
      }
    };
    const fetchQuizStats = async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("score, total_marks, created_at")
        .eq("user_id", user.id);

      if (error) {
        console.error("Quiz stats error:", error);
        return;
      }

      if (!data.length) {
        setStats((prev) => ({
          ...prev,
          avgScore: 0,
          improvement: 0,
        }));
        return;
      }

      // 🔢 Average score
      const totalScore = data.reduce((s, q) => s + q.score, 0);
      const totalMarks = data.reduce((s, q) => s + q.total_marks, 0);

      const avgScore = Math.round((totalScore / totalMarks) * 100);

      // 📈 Improvement calculation (below)
      calculateImprovement(data, avgScore);
    };
    const calculateImprovement = (quizzes = []) => {
      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        return { avgScore: 0, improvement: 0 };
      }

      const scores = quizzes.map((q) =>
        Math.round((q.score / q.total_marks) * 100),
      );

      const avgScore = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );

      const improvement =
        scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;

      return { avgScore, improvement };
    };

    fetchProfile();
    fetchUserCourses();
    fetchQuizStats();
    calculateImprovement();
  }, [user]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <ProfileHeader user={user} profile={profile} />

      {/* STATS ROW */}
      <ProfileStats stats={stats} />

      {/* GOALS / MILESTONES / SKILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Goal />

        <Improvement />

        <SkillsSection courses={courses} />
      </div>

      {/* COURSES + ACHIEVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CourseProgressList courses={courses} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A]">Calendar</h3>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="text-slate-400 hover:text-slate-600"
              >
                ◀
              </button>

              <span className="text-xs font-medium text-slate-600">
                {monthName} {currentYear}
              </span>

              <button
                onClick={nextMonth}
                className="text-slate-400 hover:text-slate-600"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-[10px] text-slate-400 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Empty slots */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`
            h-8 flex items-center justify-center rounded-lg
            ${
              isToday
                ? "bg-sky-500 text-white font-semibold"
                : "text-slate-600 hover:bg-slate-100"
            }
            transition cursor-pointer
          `}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NEXT STEP CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" />
      </div>
    </div>
  );
};

export default ProfilePage;
