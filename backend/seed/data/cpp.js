export default {
  course: {
    title: "C++ Programming",
    slug: "cpp",
    description: "Complete C++ course from basics to modern C++",
    level: "Beginner",
  },

  sections: [
    {
      title: "Introduction to C++",
      level: "Beginner",
      lessons: [
        { title: "History of C++", slug: "history-of-cpp" },
        { title: "Features of C++", slug: "features-of-cpp" },
        {
          title: "Difference between C and C++",
          slug: "difference-between-c-and-cpp",
        },
        { title: "Applications of C++", slug: "applications-of-cpp" },
        {
          title: "Structure of a C++ Program",
          slug: "structure-of-cpp-program",
        },
        { title: "Compilation Process", slug: "compilation-process" },
        { title: "First C++ Program", slug: "first-cpp-program" },
        { title: "Keywords and Identifiers", slug: "keywords-and-identifiers" },
        { title: "Comments", slug: "comments-in-cpp" },
      ],
    },

    {
      title: "Variables and Data Types",
      level: "Intermediate",
      lessons: [
        { title: "Variables and Constants", slug: "variables-and-constants" },
        { title: "Naming Conventions", slug: "naming-conventions" },
        { title: "Primitive Data Types", slug: "primitive-data-types" },
        { title: "Signed vs Unsigned", slug: "signed-vs-unsigned" },
        { title: "sizeof Operator", slug: "sizeof-operator" },
        { title: "Type Casting", slug: "type-casting" },
        { title: "auto Keyword", slug: "auto-keyword" },
        { title: "const Keyword", slug: "const-keyword" },
      ],
    },

    {
      title: "Operators",
      level: "Beginner",
      lessons: [
        { title: "Arithmetic Operators", slug: "arithmetic-operators" },
        { title: "Relational Operators", slug: "relational-operators" },
        { title: "Logical Operators", slug: "logical-operators" },
        { title: "Assignment Operators", slug: "assignment-operators" },
        { title: "Bitwise Operators", slug: "bitwise-operators" },
        { title: "Ternary Operator", slug: "ternary-operator" },
        { title: "Operator Precedence", slug: "operator-precedence" },
      ],
    },

    // 👉 Continue same pattern for remaining sections
  ],
};
