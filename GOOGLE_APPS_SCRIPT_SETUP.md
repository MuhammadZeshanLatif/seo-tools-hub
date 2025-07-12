# Google Apps Script Setup Guide

## Quick Setup Instructions

### Step 1: Create Google Apps Script Project

1. Go to https://script.google.com
2. Click "New Project"
3. Delete the default code
4. Copy and paste the entire content from `google-apps-script.js` file

### Step 2: Configure Your Spreadsheet ID

In the script, update this line with your spreadsheet ID:
```javascript
SPREADSHEET_ID: '1T2EQFNZdjxvv-pImAtFRY_bCFshQkfy--No2lzR9YbI',
```

Your spreadsheet ID is the long string in your Google Sheets URL between `/d/` and `/edit`.

### Step 3: Deploy as Web App

1. Click the "Deploy" button (top right)
2. Choose "New Deployment"
3. Click the gear icon next to "Type"
4. Select "Web app"
5. Fill in the deployment settings:
   - **Description**: SEO Tools Hub Authentication API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
6. Click "Deploy"
7. **IMPORTANT**: Copy the Web App URL that appears

### Step 4: Update Your Website

1. Open the `auth.js` file in your website
2. Find this line near the top:
```javascript
WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` with the URL you copied in Step 3

### Step 5: Set Up Your Google Sheets

Make sure your Google Sheets has these two sheets with the correct column headers:

**Sheet 1: "signup"**
- Column A: Email
- Column B: Password  
- Column C: FirstName
- Column D: LastName
- Column E: CreatedDate

**Sheet 2: "login"**
- Column A: Email
- Column B: Password
- Column C: LastLogin

### Step 6: Test the Setup

1. Go to your website
2. Try to register a new account
3. Check if the data appears in your Google Sheets
4. Try logging in with the account you created

## Troubleshooting

**If registration/login doesn't work:**

1. Check the browser console (F12) for error messages
2. Make sure the Web App URL is correctly set in `auth.js`
3. Verify your Google Sheets has the correct column headers
4. Ensure the Google Apps Script is deployed with "Anyone" access

**If you get permission errors:**

1. In Google Apps Script, go to "Permissions" 
2. Click "Review permissions"
3. Allow all requested permissions

## Security Note

The Google Apps Script handles all the secure operations like password hashing and data validation. Your website only sends the data to the script, which then safely stores it in Google Sheets.

---

**Need Help?** Check the main README.md file for detailed troubleshooting steps.

