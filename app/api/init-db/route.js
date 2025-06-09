import { initDatabase } from '../../utils/database';

// GET handler to initialize the database
export async function GET() {
  try {
    await initDatabase();
    return Response.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to initialize database' 
    }, { status: 500 });
  }
}