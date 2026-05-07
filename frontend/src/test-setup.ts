import "@testing-library/jest-dom/vitest";

// Mock IntersectionObserver for framer-motion whileInView in jsdom
global.IntersectionObserver = class {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as any;
