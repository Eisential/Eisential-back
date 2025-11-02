import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Obtener todas las tareas (Backlog)
export async function GET() {
  const session = await getSession(); 
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId, // Usar camelCase como define Prisma
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Crear una nueva tarea (RF2)
export async function POST(req: NextRequest) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { title, description, dueDate, categoryId, quadrant, position } = body;

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: userId,
        categoryId: categoryId || null,
        quadrant: quadrant || 'B',
        position: position || 0,
      },
      include: { category: true }, // Incluir categoría en la respuesta
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}