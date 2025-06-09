// Database utility module for CSV operations
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Define paths for CSV files
const DATA_DIR = path.join(process.cwd(), 'data');
const PENDING_SUGGESTIONS_FILE = path.join(DATA_DIR, 'pending_suggestions.csv');
const APPROVED_SUGGESTIONS_FILE = path.join(DATA_DIR, 'approved_suggestions.csv');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fsPromises.access(DATA_DIR);
  } catch (error) {
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
};

// Ensure CSV files exist
const ensureCSVFiles = async () => {
  await ensureDataDir();
  
  try {
    await fsPromises.access(PENDING_SUGGESTIONS_FILE);
  } catch (error) {
    await fsPromises.writeFile(PENDING_SUGGESTIONS_FILE, 'id,term,definition,date,status\n');
  }
  
  try {
    await fsPromises.access(APPROVED_SUGGESTIONS_FILE);
  } catch (error) {
    await fsPromises.writeFile(APPROVED_SUGGESTIONS_FILE, 'id,term,definition,date,status\n');
  }
};

// Parse CSV to array of objects
const parseCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

// Convert array of objects to CSV
const objectsToCSV = (objects) => {
  if (objects.length === 0) return 'id,term,definition,date,status\n';
  
  const headers = Object.keys(objects[0]);
  const csvLines = objects.map(obj => 
    headers.map(header => obj[header]).join(',')
  );
  
  return [headers.join(','), ...csvLines].join('\n');
};

// Read pending suggestions from CSV
export const getPendingSuggestions = async () => {
  await ensureCSVFiles();
  
  try {
    const csvContent = await fsPromises.readFile(PENDING_SUGGESTIONS_FILE, 'utf-8');
    return parseCSV(csvContent);
  } catch (error) {
    console.error('Error reading pending suggestions:', error);
    return [];
  }
};

// Read approved suggestions from CSV
export const getApprovedSuggestions = async () => {
  await ensureCSVFiles();
  
  try {
    const csvContent = await fsPromises.readFile(APPROVED_SUGGESTIONS_FILE, 'utf-8');
    return parseCSV(csvContent);
  } catch (error) {
    console.error('Error reading approved suggestions:', error);
    return [];
  }
};

// Add a new suggestion to pending suggestions
export const addPendingSuggestion = async (suggestion) => {
  await ensureCSVFiles();
  
  try {
    const suggestions = await getPendingSuggestions();
    suggestions.push(suggestion);
    
    const csvContent = objectsToCSV(suggestions);
    await fsPromises.writeFile(PENDING_SUGGESTIONS_FILE, csvContent);
    
    return true;
  } catch (error) {
    console.error('Error adding pending suggestion:', error);
    return false;
  }
};

// Approve a suggestion (move from pending to approved)
export const approveSuggestion = async (suggestionId) => {
  await ensureCSVFiles();
  
  try {
    // Get pending suggestions
    const pendingSuggestions = await getPendingSuggestions();
    const suggestionToApprove = pendingSuggestions.find(s => s.id === suggestionId);
    
    if (!suggestionToApprove) return false;
    
    // Update status
    suggestionToApprove.status = 'approved';
    
    // Add to approved suggestions
    const approvedSuggestions = await getApprovedSuggestions();
    approvedSuggestions.push(suggestionToApprove);
    
    // Remove from pending suggestions
    const updatedPendingSuggestions = pendingSuggestions.filter(s => s.id !== suggestionId);
    
    // Write both files
    await fsPromises.writeFile(
      PENDING_SUGGESTIONS_FILE, 
      objectsToCSV(updatedPendingSuggestions)
    );
    
    await fsPromises.writeFile(
      APPROVED_SUGGESTIONS_FILE, 
      objectsToCSV(approvedSuggestions)
    );
    
    return true;
  } catch (error) {
    console.error('Error approving suggestion:', error);
    return false;
  }
};

// Reject a suggestion (remove from pending)
export const rejectSuggestion = async (suggestionId) => {
  await ensureCSVFiles();
  
  try {
    // Get pending suggestions
    const pendingSuggestions = await getPendingSuggestions();
    
    // Remove from pending suggestions
    const updatedPendingSuggestions = pendingSuggestions.filter(s => s.id !== suggestionId);
    
    // Write file
    await fsPromises.writeFile(
      PENDING_SUGGESTIONS_FILE, 
      objectsToCSV(updatedPendingSuggestions)
    );
    
    return true;
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    return false;
  }
};

// Initialize database
export const initDatabase = async () => {
  await ensureCSVFiles();
};