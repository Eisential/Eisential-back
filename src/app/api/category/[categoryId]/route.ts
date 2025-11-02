import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

// Eliminar una categoría (RF5)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { categoryId } = await params;

  try {
    const result = await prisma.category.deleteMany({
      where: {
        id: categoryId,
        userId: userId, // Asegurarse de que el usuario sea el propietario
      },
    });

    // Si result.count es 0, significa que la categoría no se encontró
    // o que no le pertenecía al usuario.
    if (result.count === 0) {
      return NextResponse.json({ message: 'Category not found or unauthorized' }, { status: 404 });
    }

    // 204 No Content es la respuesta estándar para un DELETE exitoso.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 });
  }
}
