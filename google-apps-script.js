
// Google Apps Script for SEO Tools Hub Authentication
// Deploy this script in Google Apps Script and publish as a web app
// This provides a secure backend for authentication operations

// Configuration - Update these with your sheet IDs
const CONFIG = {
  SPREADSHEET_ID: '1T2EQFNZdjxvv-pImAtFRY_bCFshQkfy--No2lzR9YbI',
  SIGNUP_SHEET_NAME: 'signup',
  LOGIN_SHEET_NAME: 'login',
  
  // CORS headers for web requests
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }
};

// Main function to handle web app requests
function doPost(e) {
  try {
    // Handle CORS preflight
    if (e.parameter.method === 'OPTIONS') {
      return createResponse({}, 200);
    }
    
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    switch (action) {
      case 'signup':
        return handleSignup(requestData);
      case 'login':
        return handleLogin(requestData);
      case 'resetPassword':
        return handlePasswordReset(requestData);
      case 'checkUser':
        return handleCheckUser(requestData);
      default:
        return createResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
}

// Handle GET requests
function doGet(e) {
  const action = e.parameter.action;
  
  switch (action) {
    case 'test':
      return createResponse({ message: 'SEO Tools Hub API is working!' }, 200);
    default:
      return createResponse({ error: 'Invalid GET request' }, 400);
  }
}

// Handle user signup
function handleSignup(data) {
  try {
    const { email, password, firstName, lastName } = data;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return createResponse({ error: 'All fields are required' }, 400);
    }
    
    // Check if user already exists
    const loginSheet = getSheet(CONFIG.LOGIN_SHEET_NAME);
    const existingUsers = loginSheet.getDataRange().getValues();
    
    for (let i = 1; i < existingUsers.length; i++) {
      if (existingUsers[i][0] && existingUsers[i][0].toLowerCase() === email.toLowerCase()) {
        return createResponse({ error: 'User with this email already exists' }, 409);
      }
    }
    
    // Hash password
    const hashedPassword = hashPassword(password);
    const timestamp = new Date().toISOString();
    
    // Add to signup sheet
    const signupSheet = getSheet(CONFIG.SIGNUP_SHEET_NAME);
    signupSheet.appendRow([email, hashedPassword, firstName, lastName, timestamp]);
    
    // Add to login sheet
    loginSheet.appendRow([email, hashedPassword, timestamp]);
    
    return createResponse({ 
      success: true, 
      message: 'Account created successfully' 
    }, 200);
    
  } catch (error) {
    console.error('Signup error:', error);
    return createResponse({ error: 'Failed to create account' }, 500);
  }
}

// Handle user login
function handleLogin(data) {
  try {
    const { email, password } = data;
    
    // Validate input
    if (!email || !password) {
      return createResponse({ error: 'Email and password are required' }, 400);
    }
    
    // Get user from login sheet
    const loginSheet = getSheet(CONFIG.LOGIN_SHEET_NAME);
    const users = loginSheet.getDataRange().getValues();
    
    const hashedPassword = hashPassword(password);
    let userFound = false;
    let userRowIndex = -1;
    
    for (let i = 1; i < users.length; i++) {
      if (users[i][0] && users[i][0].toLowerCase() === email.toLowerCase() && 
          users[i][1] === hashedPassword) {
        userFound = true;
        userRowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (!userFound) {
      return createResponse({ error: 'Invalid email or password' }, 401);
    }
    
    // Get user details from signup sheet
    const signupSheet = getSheet(CONFIG.SIGNUP_SHEET_NAME);
    const signupUsers = signupSheet.getDataRange().getValues();
    
    let userDetails = null;
    for (let i = 1; i < signupUsers.length; i++) {
      if (signupUsers[i][0] && signupUsers[i][0].toLowerCase() === email.toLowerCase()) {
        userDetails = {
          email: signupUsers[i][0],
          firstName: signupUsers[i][2],
          lastName: signupUsers[i][3]
        };
        break;
      }
    }
    
    // Update last login time
    const loginSheet2 = getSheet(CONFIG.LOGIN_SHEET_NAME);
    loginSheet2.getRange(userRowIndex, 3).setValue(new Date().toISOString());
    
    return createResponse({
      success: true,
      user: userDetails || { email: email, firstName: '', lastName: '' }
    }, 200);
    
  } catch (error) {
    console.error('Login error:', error);
    return createResponse({ error: 'Login failed' }, 500);
  }
}

// Handle password reset
function handlePasswordReset(data) {
  try {
    const { email, newPassword } = data;
    
    // Validate input
    if (!email || !newPassword) {
      return createResponse({ error: 'Email and new password are required' }, 400);
    }
    
    // Find user in login sheet
    const loginSheet = getSheet(CONFIG.LOGIN_SHEET_NAME);
    const users = loginSheet.getDataRange().getValues();
    
    let userRowIndex = -1;
    for (let i = 1; i < users.length; i++) {
      if (users[i][0] && users[i][0].toLowerCase() === email.toLowerCase()) {
        userRowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (userRowIndex === -1) {
      return createResponse({ error: 'User not found' }, 404);
    }
    
    // Update password in login sheet
    const hashedPassword = hashPassword(newPassword);
    loginSheet.getRange(userRowIndex, 2).setValue(hashedPassword);
    
    // Update password in signup sheet
    const signupSheet = getSheet(CONFIG.SIGNUP_SHEET_NAME);
    const signupUsers = signupSheet.getDataRange().getValues();
    
    for (let i = 1; i < signupUsers.length; i++) {
      if (signupUsers[i][0] && signupUsers[i][0].toLowerCase() === email.toLowerCase()) {
        signupSheet.getRange(i + 1, 2).setValue(hashedPassword);
        break;
      }
    }
    
    return createResponse({
      success: true,
      message: 'Password updated successfully'
    }, 200);
    
  } catch (error) {
    console.error('Password reset error:', error);
    return createResponse({ error: 'Failed to reset password' }, 500);
  }
}

// Check if user exists
function handleCheckUser(data) {
  try {
    const { email } = data;
    
    if (!email) {
      return createResponse({ error: 'Email is required' }, 400);
    }
    
    const loginSheet = getSheet(CONFIG.LOGIN_SHEET_NAME);
    const users = loginSheet.getDataRange().getValues();
    
    const userExists = users.some(row => 
      row[0] && row[0].toLowerCase() === email.toLowerCase()
    );
    
    return createResponse({
      exists: userExists
    }, 200);
    
  } catch (error) {
    console.error('Check user error:', error);
    return createResponse({ error: 'Failed to check user' }, 500);
  }
}

// Utility functions
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Add headers based on sheet type
    if (sheetName === CONFIG.SIGNUP_SHEET_NAME) {
      sheet.getRange(1, 1, 1, 5).setValues([['Email', 'Password', 'FirstName', 'LastName', 'CreatedDate']]);
    } else if (sheetName === CONFIG.LOGIN_SHEET_NAME) {
      sheet.getRange(1, 1, 1, 3).setValues([['Email', 'Password', 'LastLogin']]);
    }
  }
  
  return sheet;
}

function hashPassword(password) {
  // Simple hash function for demo purposes
  // In production, use a proper cryptographic hash function
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return Utilities.base64Encode(hash);
}

function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  response.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  Object.keys(CONFIG.CORS_HEADERS).forEach(header => {
    response.setHeader(header, CONFIG.CORS_HEADERS[header]);
  });
  
  return response;
}

// Test function to verify the script is working
function testScript() {
  console.log('SEO Tools Hub Google Apps Script is working!');
  
  // Test creating sheets
  const signupSheet = getSheet(CONFIG.SIGNUP_SHEET_NAME);
  const loginSheet = getSheet(CONFIG.LOGIN_SHEET_NAME);
  
  console.log('Signup sheet created/found:', signupSheet.getName());
  console.log('Login sheet created/found:', loginSheet.getName());
  
  return 'Test completed successfully';
}