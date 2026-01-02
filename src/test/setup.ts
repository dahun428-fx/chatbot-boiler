import '@testing-library/jest-dom/vitest';

// Global test setup
beforeAll(() => {
    // Setup before all tests
});

afterEach(() => {
    // Cleanup after each test
});

afterAll(() => {
    // Cleanup after all tests
});

// Mock matchMedia for tests that use responsive design
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe = () => { };
    disconnect = () => { };
    unobserve = () => { };
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
    observe = () => { };
    disconnect = () => { };
    unobserve = () => { };
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
});
