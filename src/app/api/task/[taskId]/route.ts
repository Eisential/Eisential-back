import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

// Para verificar si la tarea pertenece al usuario
async function checkTaskOwnership(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: userId },
  });
  return task;
}

// Actualizar tarea (incluye mover en matriz - RF5)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { taskId } = await params;

  try {
    // 1. Verificar propiedad de la tarea
    if (!(await checkTaskOwnership(taskId, userId))) {
      return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    // 2. Ejecutar la actualización
    const body = await req.json();
    const { dueDate, categoryId, completedAt, ...rest } = body;
    
    // Construir el objeto de datos dinámicamente
    const updateData: any = { ...rest };
    
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }
    
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }
    
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}

// Eliminar tarea (CRUD)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { taskId } = await params;

  try {
    const result = await prisma.task.deleteMany({
      where: { id: taskId, userId: userId },
    });
    
    if (result.count === 0) {
      return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 });
  }
}