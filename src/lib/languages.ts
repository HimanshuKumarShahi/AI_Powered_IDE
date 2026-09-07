import type { Language } from "./types";

// ─── Codebox Language Registry ────────────────────────────────────────────────
// All language IDs are sourced directly from Hitesh Choudhary'"'"'s Codebox:
// https://github.com/hiteshchoudhary/Codebox/tree/main/src/languages
//
// Codebox Docker images used:
//   codebox/python:3.8     (Python 3.8.10)
//   codebox/node:18        (Node.js 18.15.0)
//   codebox/typescript:5   (TypeScript 5.0.3)
//   codebox/gcc:9          (GCC 9.4.0 — C and C++)
//   codebox/java:17        (OpenJDK 17)
//
// RapidAPI aliases also accepted by Codebox:
//   92  → Python  |  93, 102 → JavaScript  |  94 → TypeScript
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES: Language[] = [
  {
    id: 71,
    name: "Python 3",
    monacoLang: "python",
    extension: "py",
    codeboxSupported: true,
    codeboxRuntime: "Python 3.8.10",
    defaultCode: `# Python 3.8 — NexusIDE + Codebox\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nresult = greet("World")\nprint(result)\n\n# Try something complex\nnumbers = [1, 2, 3, 4, 5]\nsquared = list(map(lambda x: x ** 2, numbers))\nprint(f"Squares: {squared}")\n`,
  },
  {
    id: 63,
    name: "JavaScript",
    monacoLang: "javascript",
    extension: "js",
    codeboxSupported: true,
    codeboxRuntime: "Node.js 18.15.0",
    defaultCode: `// JavaScript (Node.js 18) — NexusIDE + Codebox\nconst greet = (name) => \`Hello, \${name}!\`;\nconsole.log(greet("World"));\n\nconst data = [1, 2, 3, 4, 5];\nconst result = data.filter((n) => n % 2 === 0).map((n) => n * n);\nconsole.log("Even squares:", result);\n`,
  },
  {
    id: 74,
    name: "TypeScript",
    monacoLang: "typescript",
    extension: "ts",
    codeboxSupported: true,
    codeboxRuntime: "TypeScript 5.0.3 → Node.js",
    defaultCode: `// TypeScript 5.0 — NexusIDE + Codebox\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst greet = (user: User): string =>\n  \`Hello, \${user.name}! (ID: \${user.id})\`;\n\nconst user: User = { id: 1, name: "World" };\nconsole.log(greet(user));\n\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\nconsole.log(first([10, 20, 30]));\n`,
  },
  {
    id: 54,
    name: "C++",
    monacoLang: "cpp",
    extension: "cpp",
    codeboxSupported: true,
    codeboxRuntime: "GCC 9.4.0 (C++17)",
    defaultCode: `// C++ (GCC 9.4.0, C++17) — NexusIDE + Codebox\n#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <string>\n\nstd::string greet(const std::string& name) {\n    return "Hello, " + name + "!";\n}\n\nint main() {\n    std::cout << greet("World") << std::endl;\n    std::vector<int> nums = {5, 3, 1, 4, 2};\n    std::sort(nums.begin(), nums.end());\n    for (int n : nums) std::cout << n << " ";\n    std::cout << std::endl;\n    return 0;\n}\n`,
  },
  {
    id: 50,
    name: "C",
    monacoLang: "c",
    extension: "c",
    codeboxSupported: true,
    codeboxRuntime: "GCC 9.4.0 (C17)",
    defaultCode: `// C (GCC 9.4.0, C17) — NexusIDE + Codebox\n#include <stdio.h>\n\nvoid greet(const char* name) {\n    printf("Hello, %s!\\n", name);\n}\n\nint main() {\n    greet("World");\n    return 0;\n}\n`,
  },
  {
    id: 62,
    name: "Java",
    monacoLang: "java",
    extension: "java",
    codeboxSupported: true,
    codeboxRuntime: "OpenJDK 17",
    defaultCode: `// Java (OpenJDK 17) — NexusIDE + Codebox\nimport java.util.Arrays;\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class Main {\n    public static String greet(String name) {\n        return "Hello, " + name + "!";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(greet("World"));\n        List<Integer> nums = Arrays.asList(5, 3, 1, 4, 2);\n        List<Integer> sorted = nums.stream().sorted().collect(Collectors.toList());\n        System.out.println("Sorted: " + sorted);\n    }\n}\n`,
  },
];
