// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Headers for Node environment
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.headers = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.headers.forEach((value, key) => this.headers.set(key, value));
        } else if (typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => {
            this.headers.set(key.toLowerCase(), value);
          });
        }
      }
    }
    
    get(name) {
      return this.headers.get(name?.toLowerCase()) || null;
    }
    
    set(name, value) {
      this.headers.set(name.toLowerCase(), value);
    }
    
    has(name) {
      return this.headers.has(name?.toLowerCase());
    }
    
    delete(name) {
      this.headers.delete(name?.toLowerCase());
    }
    
    forEach(callback) {
      this.headers.forEach(callback);
    }
    
    append(name, value) {
      const existing = this.get(name);
      if (existing) {
        this.set(name, `${existing}, ${value}`);
      } else {
        this.set(name, value);
      }
    }
    
    [Symbol.iterator]() {
      return this.headers[Symbol.iterator]();
    }
  };
}

// Mock FormData for Node environment
if (typeof global.FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }
    
    append(name, value) {
      if (!this.data.has(name)) {
        this.data.set(name, []);
      }
      this.data.get(name).push(value);
    }
    
    get(name) {
      const values = this.data.get(name);
      return values ? values[0] : null;
    }
    
    getAll(name) {
      return this.data.get(name) || [];
    }
    
    has(name) {
      return this.data.has(name);
    }
  };
}

// Mock @auth/prisma-adapter
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  SessionProvider: ({ children }) => children,
}))

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))


