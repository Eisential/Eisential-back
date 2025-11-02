import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Mock de las dependencias
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth');

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Task API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/task', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

  it('should return all tasks for authenticated user', async () => {
    const mockSession = {
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    };
    
    const now = new Date();
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        userId: 'user-123',
        categoryId: 'cat-1',
        quadrant: 'B',
        position: 0,
        completed: false,
        createdAt: now,
        updatedAt: now,
        dueDate: null,
        completedAt: null,
        category: { id: 'cat-1', name: 'Work', color: '#FF0000', userId: 'user-123' },
      },
    ];

    mockGetSession.mockResolvedValue(mockSession as any);
    mockPrisma.task.findMany.mockResolvedValue(mockTasks as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('task-1');
    expect(data[0].title).toBe('Task 1');
    expect(data[0].description).toBe('Description 1');
    expect(data[0].userId).toBe('user-123');
    expect(data[0].categoryId).toBe('cat-1');
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to fetch tasks');
    });
  });

  describe('POST /api/task', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/task', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Task' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 400 if title is missing', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/task', {
        method: 'POST',
        body: JSON.stringify({ description: 'No title' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Title is required');
    });

    it('should create a new task successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      const newTaskData = {
        title: 'New Task',
        description: 'Task description',
        categoryId: 'cat-1',
        dueDate: '2025-11-10',
        quadrant: 'B',
        position: 0,
      };

      const mockCreatedTask = {
        id: 'task-new',
        ...newTaskData,
        userId: 'user-123',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date('2025-11-10'),
        completedAt: null,
        category: { id: 'cat-1', name: 'Work', color: '#FF0000', userId: 'user-123' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.create.mockResolvedValue(mockCreatedTask as any);

      const request = new NextRequest('http://localhost:3000/api/task', {
        method: 'POST',
        body: JSON.stringify(newTaskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('task-new');
      expect(data.title).toBe('New Task');
    });

    it('should handle database errors when creating task', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };

      mockGetSession.mockResolvedValue(mockSession as any);
      mockPrisma.task.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/task', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Task' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to create task');
    });
  });
});
