import { Outlet } from "react-router-dom";

const CourseLayout = () => {
  return (
    <div className="h-screen bg-slate-50">
      <Outlet />
    </div>
  );
};

export default CourseLayout;
