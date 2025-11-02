import { PATCH, DELETE } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Mock de las dependencias
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth');

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Task [taskId] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/task/[taskId]', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 404 if task does not belong to user', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Task not found or unauthorized');
    });

    it('should update task successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      const existingTask = {
        id: 'task-1',
        title: 'Old Title',
        userId: 'user-123',
        categoryId: 'cat-1',
        quadrant: 'B',
        position: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        completedAt: null,
      };

      const updatedTask = {
        ...existingTask,
        title: 'Updated Title',
        category: { id: 'cat-1', name: 'Work', color: '#FF0000', userId: 'user-123' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.findUnique.mockResolvedValue(existingTask as any);
      mockPrisma.task.update.mockResolvedValue(updatedTask as any);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Title');
    });

    it('should handle quadrant updates', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      const existingTask = {
        id: 'task-1',
        title: 'Task',
        userId: 'user-123',
        categoryId: 'cat-1',
        quadrant: 'B',
        position: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: null,
        completedAt: null,
      };

      const updatedTask = {
        ...existingTask,
        quadrant: 'Q1',
        category: { id: 'cat-1', name: 'Work', color: '#FF0000', userId: 'user-123' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.findUnique.mockResolvedValue(existingTask as any);
      mockPrisma.task.update.mockResolvedValue(updatedTask as any);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'PATCH',
        body: JSON.stringify({ quadrant: 'Q1' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quadrant).toBe('Q1');
    });

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      const existingTask = {
        id: 'task-1',
        title: 'Task',
        userId: 'user-123',
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.findUnique.mockResolvedValue(existingTask as any);
      mockPrisma.task.update.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to update task');
    });
  });

  describe('DELETE /api/task/[taskId]', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 404 if task does not exist or does not belong to user', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.deleteMany.mockResolvedValue({ count: 0 } as any);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Task not found or unauthorized');
    });

    it('should delete task successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.deleteMany.mockResolvedValue({ count: 1 } as any);

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ taskId: 'task-1' }) });

      expect(response.status).toBe(204);
    });

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.deleteMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/task/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ taskId: 'task-1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to delete task');
    });
  });
});
