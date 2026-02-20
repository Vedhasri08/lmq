export default {
  course: {
    title: "Next.js",
    slug: "nextjs",
    description: "Build full-stack React apps with Next.js",
    level: "Intermediate",
  },

  sections: [
    {
      title: "Next.js Fundamentals",
      level: "Beginner",
      lessons: [
        {
          title: "What is Next.js?",
          slug: "what-is-nextjs",
          content: {
            introduction: "Next.js is a React framework for production.",
            why: [
              "Server-side rendering",
              "File-based routing",
              "Great performance",
            ],
            codeExample: {
              language: "js",
              code: `export default function Home() {
  return <h1>Hello Next.js</h1>;
}`,
            },
          },
        },
      ],
    },
  ],
};
