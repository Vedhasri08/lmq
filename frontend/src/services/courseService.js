import axiosInstance from "../utils/axiosinstance";
import api from "../utils/axiosinstance";
const API_BASE = "http://localhost:8000/api";
import axios from "axios";
import { supabase } from "../lib/supabase";
/**
 * Get all courses
 */
export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Get course by slug
 */
export const getCourseBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Get sections for a course
 */
export const getSectionsByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get lessons for a section
 */
export const getLessonsBySection = async (sectionId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("section_id", sectionId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data;
};
/**
 * Get featured courses (for dashboard)
 */
export const getFeaturedCourses = async () => {
  const response = await axiosInstance.get("/api/courses");
  return response.data;
};
/**
 * Create a new course (ADMIN only)
 */
export const createCourse = async (course) => {
  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        title: course.title,
        slug: course.slug,
        description: course.description,
        is_published: course.is_published ?? false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
