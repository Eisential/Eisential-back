import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Mock de las dependencias
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth');

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Category API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/category', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return all categories for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };
      
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Work',
          color: '#FF0000',
          userId: 'user-123',
        },
        {
          id: 'cat-2',
          name: 'Personal',
          color: '#00FF00',
          userId: 'user-123',
        },
      ];

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.category.findMany.mockResolvedValue(mockCategories as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { name: 'asc' },
      });
    });

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.category.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to fetch categories');
    });
  });

  describe('POST /api/category', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Category' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 400 if name is missing', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify({ color: '#FF0000' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Name is required');
    });

    it('should create a new category successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      const newCategoryData = {
        name: 'New Category',
        color: '#0000FF',
      };

      const mockCreatedCategory = {
        id: 'cat-new',
        ...newCategoryData,
        userId: 'user-123',
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory as any);

      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify(newCategoryData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('cat-new');
      expect(data.name).toBe('New Category');
    });

    it('should create category without color', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      const newCategoryData = {
        name: 'Category Without Color',
      };

      const mockCreatedCategory = {
        id: 'cat-new',
        name: 'Category Without Color',
        color: null,
        userId: 'user-123',
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory as any);

      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify(newCategoryData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Category Without Color');
    });

    it('should handle database errors when creating category', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.category.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Category' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to create category');
    });
  });
});
