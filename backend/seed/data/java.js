export default {
  course: {
    title: "Java Programming",
    slug: "java",
    description: "Learn Java from scratch with OOP concepts",
    level: "Beginner",
  },

  sections: [
    {
      title: "Java Basics",
      level: "Beginner",
      lessons: [
        {
          title: "Introduction to Java",
          slug: "introduction-to-java",
          content: {
            introduction:
              "Java is a platform-independent programming language.",
            why: [
              "Write once, run anywhere",
              "Used in enterprise apps",
              "Strong OOP support",
            ],
            codeExample: {
              language: "java",
              code: `class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`,
            },
          },
        },
      ],
    },
  ],
};
