export interface PathwayTopic {
  id: string;
  title: string;
  section: string;
  objective: string;
  deckNames: string[];
}

export interface Pathway {
  id: string;
  version: number;
  title: string;
  description: string;
  projectNames: string[];
  source: { title: string; url: string };
  topics: PathwayTopic[];
}

export const PATHWAYS: Pathway[] = [
  {
    id: 'java-core', version: 1, title: 'Java 27 pathway',
    description: 'Learn Java 27 from language fundamentals to core APIs and advanced Java. Each topic contains concepts and practice questions.',
    projectNames: ['Java', 'Java 21', 'Java 27', 'Java Fundamentals'],
    source: { title: 'Official Java learning resources', url: 'https://dev.java/learn/' },
    topics: [
      { id: 'types', title: 'Types, variables and operators', section: 'Foundations', deckNames: ['Variables', 'Types and variables', 'Variables & Data Types'], objective: 'Understand primitive/reference types, conversions, expressions and operator edge cases.' },
      { id: 'control-flow', title: 'Control flow', section: 'Foundations', deckNames: ['Control Flow', 'Loops and conditionals'], objective: 'Reason about branches, loops, switch expressions and execution order.' },
      { id: 'methods', title: 'Methods and scope', section: 'Foundations', deckNames: ['Methods', 'Methods & Scope'], objective: 'Understand parameters, return values, overloading, scope and pass-by-value.' },
      { id: 'arrays', title: 'Arrays', section: 'Foundations', deckNames: ['Arrays'], objective: 'Use array types, indexing, multidimensional arrays and covariance safely.' },
      { id: 'strings', title: 'Strings and text', section: 'Foundations', deckNames: ['Strings', 'Strings & String Pool', 'Strings and String Pool'], objective: 'Understand immutability, string equality, the string pool and text handling.' },
      { id: 'objects', title: 'Classes and interfaces', section: 'Object-oriented Java', deckNames: ['OOP', 'Object Oriented Programming', 'Classes & Interfaces'], objective: 'Reason about object construction, inheritance, polymorphism, interfaces and access control.' },
      { id: 'exceptions', title: 'Exceptions', section: 'Object-oriented Java', deckNames: ['Exception Handling'], objective: 'Distinguish checked/unchecked exceptions and understand propagation and finally.' },
      { id: 'generics', title: 'Generics', section: 'Core APIs', deckNames: ['Generics'], objective: 'Use type parameters, bounds and wildcards; reason about variance and erasure.' },
      { id: 'collections', title: 'Collections', section: 'Core APIs', deckNames: ['Collections', 'Java Collections', 'Collections Framework'], objective: 'Choose and use lists, sets and maps; understand equality, hashing, iteration and mutation.' },
      { id: 'lambdas', title: 'Lambdas and functional interfaces', section: 'Core APIs', deckNames: ['Lambdas', 'Functional Interfaces'], objective: 'Understand functional interfaces, lambda capture and method references.' },
      { id: 'streams', title: 'Streams', section: 'Core APIs', deckNames: ['Streams', 'Stream API'], objective: 'Reason about lazy pipelines, terminal operations, collectors and side effects.' },
      { id: 'date-time', title: 'Date and time', section: 'Core APIs', deckNames: ['Date & Time', 'Date Time API'], objective: 'Choose date/time types and reason about durations, periods and time zones.' },
      { id: 'io', title: 'I/O and resource management', section: 'Advanced Java', deckNames: ['IO', 'I/O', 'Files and I/O'], objective: 'Work with files and streams and close resources reliably.' },
      { id: 'concurrency', title: 'Concurrency', section: 'Advanced Java', deckNames: ['Concurrency', 'Multithreading'], objective: 'Understand shared state, synchronization, executors and thread lifecycle.' },
      { id: 'jvm', title: 'JVM and memory', section: 'Advanced Java', deckNames: ['JVM', 'JVM & Memory', 'Memory Management'], objective: 'Understand runtime execution, allocation, garbage collection and debugging tools.' },
    ],
  },
  {
    id: 'react-core', version: 1, title: 'React pathway',
    description: 'Build a clear mental model of rendering, state and effects, then practise reusable application patterns.',
    projectNames: ['React', 'React Fundamentals'],
    source: { title: 'Official React learning resources', url: 'https://react.dev/learn' },
    topics: [
      { id: 'components', title: 'Components, JSX and props', section: 'Foundations', deckNames: ['Components', 'JSX and Props'], objective: 'Compose components and reason about props, JSX, lists and keys.' },
      { id: 'state', title: 'Events and state', section: 'Foundations', deckNames: ['State', 'Events & State'], objective: 'Understand state snapshots, event handlers and queued updates.' },
      { id: 'rendering', title: 'Rendering and identity', section: 'Foundations', deckNames: ['Rendering', 'Reconciliation'], objective: 'Reason about pure rendering, component identity and preserving/resetting state.' },
      { id: 'shared-state', title: 'Sharing and structuring state', section: 'Application patterns', deckNames: ['Sharing State', 'State Management'], objective: 'Lift state, avoid redundant state and model updates clearly.' },
      { id: 'effects', title: 'Refs and effects', section: 'Application patterns', deckNames: ['Effects', 'React Effects', 'useEffect'], objective: 'Distinguish events from synchronization and handle dependencies and cleanup.' },
      { id: 'hooks', title: 'Custom hooks', section: 'Application patterns', deckNames: ['Hooks', 'Custom Hooks'], objective: 'Extract reusable stateful logic while respecting hook rules.' },
      { id: 'context', title: 'Context and reducers', section: 'Application patterns', deckNames: ['Context', 'Reducers'], objective: 'Combine reducers and context and reason about update propagation.' },
      { id: 'performance', title: 'Performance', section: 'Advanced React', deckNames: ['React Performance', 'Memoization'], objective: 'Measure rendering cost and apply memoization when it solves a demonstrated problem.' },
    ],
  },
];

export const normalizeTopicName = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
export const getPathway = (id: string | null | undefined) => PATHWAYS.find(pathway => pathway.id === id);
export const pathwayForProject = (name: string) => PATHWAYS.find(pathway =>
  pathway.projectNames.some(alias => normalizeTopicName(alias) === normalizeTopicName(name)));

export const topicUrl = (deckId: string, pathwayId?: string | null) =>
  `/knowledge/deck/${deckId}/concepts${getPathway(pathwayId) ? `?pathway=${encodeURIComponent(pathwayId!)}` : ''}`;

export const conceptUrl = (deckId: string, conceptId: string, pathwayId?: string | null) =>
  `/knowledge/deck/${deckId}/concept/${conceptId}${getPathway(pathwayId) ? `?pathway=${encodeURIComponent(pathwayId!)}` : ''}`;

export const practiceUrl = (deckId: string, conceptId: string, pathwayId?: string | null, returnToConcept = false) =>
  `/knowledge/study/${deckId}?conceptId=${encodeURIComponent(conceptId)}` +
  (getPathway(pathwayId) ? `&pathway=${encodeURIComponent(pathwayId!)}` : '') +
  (returnToConcept ? '&returnToConcept=1' : '');
