export const DOMAINS = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    topics: [
      'Arrays & Strings',
      'Linked Lists',
      'Stacks & Queues',
      'Trees & Graphs',
      'Sorting & Searching',
      'Dynamic Programming',
      'Greedy Algorithms',
      'Backtracking',
      'Hash Tables',
      'Heaps & Priority Queues',
    ],
  },
  {
    id: 'python',
    name: 'Python Programming',
    topics: [
      'Python Basics',
      'Data Types & Collections',
      'Functions & Decorators',
      'OOP Concepts',
      'File Handling',
      'Exception Handling',
      'Modules & Packages',
      'Comprehensions',
      'Generators & Iterators',
      'Async Programming',
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript Development',
    topics: [
      'JavaScript Fundamentals',
      'ES6+ Features',
      'DOM Manipulation',
      'Async/Await & Promises',
      'Closures & Scope',
      'Prototypes & Inheritance',
      'Event Loop',
      'Error Handling',
      'Modules',
      'Design Patterns',
    ],
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    topics: [
      'HTML & CSS',
      'Responsive Design',
      'React.js',
      'State Management',
      'API Integration',
      'Authentication',
      'Performance Optimization',
      'Testing',
      'Deployment',
      'Security Best Practices',
    ],
  },
  {
    id: 'system-design',
    name: 'System Design',
    topics: [
      'Scalability Concepts',
      'Database Design',
      'Caching Strategies',
      'Load Balancing',
      'Microservices',
      'API Design',
      'Message Queues',
      'CAP Theorem',
      'Distributed Systems',
      'Design Patterns',
    ],
  },
  {
    id: 'database',
    name: 'Database Management',
    topics: [
      'SQL Fundamentals',
      'Database Normalization',
      'Indexing',
      'Transactions & ACID',
      'Query Optimization',
      'NoSQL Databases',
      'Database Design',
      'Stored Procedures',
      'Joins & Subqueries',
      'Data Modeling',
    ],
  },
];

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'Basic concepts and fundamentals' },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Applied knowledge and problem-solving',
  },
  { id: 'advanced', name: 'Advanced', description: 'Complex scenarios and optimization' },
];

export const INTERVIEW_FORMATS = [
  {
    id: 'verbal',
    name: 'Verbal/Conversational',
    description: 'Theoretical questions with voice or text responses',
    icon: '💬',
  },
  {
    id: 'coding',
    name: 'Coding Assessment',
    description: 'Hands-on coding problems with test cases',
    icon: '💻',
  },
];

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
];
