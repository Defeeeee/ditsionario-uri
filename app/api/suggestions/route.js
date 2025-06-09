import { 
  getPendingSuggestions, 
  getApprovedSuggestions, 
  addPendingSuggestion, 
  approveSuggestion, 
  rejectSuggestion 
} from '../../utils/database';

// GET handler for fetching suggestions
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  
  try {
    let data = {};
    
    if (type === 'pending' || type === 'all') {
      data.pending = await getPendingSuggestions();
    }
    
    if (type === 'approved' || type === 'all') {
      data.approved = await getApprovedSuggestions();
    }
    
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return Response.json({ success: false, error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

// POST handler for adding a new suggestion
export async function POST(request) {
  try {
    const suggestion = await request.json();
    
    // Validate suggestion data
    if (!suggestion.term || !suggestion.definition) {
      return Response.json({ 
        success: false, 
        error: 'Term and definition are required' 
      }, { status: 400 });
    }
    
    // Add timestamp and status if not provided
    if (!suggestion.id) suggestion.id = Date.now().toString();
    if (!suggestion.date) suggestion.date = new Date().toISOString();
    if (!suggestion.status) suggestion.status = 'pending';
    
    const success = await addPendingSuggestion(suggestion);
    
    if (success) {
      return Response.json({ success: true, message: 'Suggestion added successfully' });
    } else {
      return Response.json({ 
        success: false, 
        error: 'Failed to add suggestion' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding suggestion:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}

// PUT handler for approving a suggestion
export async function PUT(request) {
  try {
    const { id, action } = await request.json();
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Suggestion ID is required' 
      }, { status: 400 });
    }
    
    let success = false;
    
    if (action === 'approve') {
      success = await approveSuggestion(id);
    } else if (action === 'reject') {
      success = await rejectSuggestion(id);
    } else {
      return Response.json({ 
        success: false, 
        error: 'Invalid action. Use "approve" or "reject"' 
      }, { status: 400 });
    }
    
    if (success) {
      return Response.json({ 
        success: true, 
        message: `Suggestion ${action}d successfully` 
      });
    } else {
      return Response.json({ 
        success: false, 
        error: `Failed to ${action} suggestion` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error processing suggestion:`, error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}