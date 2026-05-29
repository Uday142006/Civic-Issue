# Google Maps API Integration Setup

## Overview
The Civic Issue Reporter application now uses **Google Maps API** instead of the traditional Leaflet/OpenStreetMap for an enhanced map experience with better performance, features, and UI/UX.

## Features Included
✅ Interactive Google Maps with custom markers  
✅ Color-coded markers based on issue status (Red: Open, Yellow: In Progress, Green: Resolved)  
✅ User location marker with blue color  
✅ Info windows displaying issue details on marker click  
✅ Map controls (zoom, fullscreen, map type toggle)  
✅ Real-time marker updates as issues are reported  

## Step 1: Get Google Maps API Key

### Prerequisites
- Google Account (create at google.com if needed)

### Steps to Obtain API Key

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create a new project**
   - Click on the project dropdown (top left)
   - Select "NEW PROJECT"
   - Enter "Civic Issue Reporter" as the project name
   - Click "CREATE"

3. **Enable the Maps JavaScript API**
   - In the Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click on it and select "ENABLE"

4. **Create an API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "CREATE CREDENTIALS" > "API Key"
   - A new API key will be generated
   - Copy the API key

5. **(Optional but Recommended) Restrict your API Key**
   - In Credentials, click on your API key
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000`)
   - Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"
   - Click "SAVE"

## Step 2: Configure Environment Variables

1. **Update `.env` file in the client directory**
   ```
   d:\B.Tech. Projects\SIH25031\Civic-Issue\client\.env
   ```

2. **Add your Google Maps API key**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
   Replace `YOUR_API_KEY_HERE` with the API key you obtained in Step 1

3. **Example .env file**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyD1234567890abcdefghijklmnop
   VITE_CLOUDINARY_NAME=your_cloudinary_cloud_name
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

## Step 3: Install Dependencies

1. **Navigate to the client directory**
   ```bash
   cd d:\B.Tech. Projects\SIH25031\Civic-Issue\client
   ```

2. **Install packages**
   ```bash
   npm install
   ```
   This will install the new `@react-google-maps/api` package along with other dependencies

## Step 4: Verify Installation

1. **Check package.json**
   - Verify `@react-google-maps/api` is listed in dependencies:
   ```bash
   npm list @react-google-maps/api
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Test the map**
   - Navigate to the dashboard
   - Click on "🗺️ Live Map" tab
   - Verify that:
     - The Google Map loads with your location
     - Markers appear for all issues
     - Clicking on markers shows info windows
     - Map controls are visible

## Marker Color Coding

| Status | Color | Meaning |
|--------|-------|---------|
| 🔴 **Open** | Red | Unresolved issue |
| 🟡 **In Progress** | Yellow/Orange | Issue being worked on |
| 🟢 **Resolved** | Green | Issue resolved |
| 🔵 **Your Location** | Blue | Your current position |

## Map Features

### Info Windows
- **Click on any marker** to see an info window with:
  - Issue title
  - Category
  - Current status
  - Priority level
  - Brief description
  - "View Details" button

### User Location
- Your current location is marked with a blue circle marker
- Click it to see your latitude and longitude

### Map Controls
- **Zoom Control**: Use + and - buttons to zoom in/out
- **Map Type Control**: Toggle between Map, Satellite, and Hybrid views
- **Fullscreen**: Expand map to fullscreen view

## API Key Best Practices

⚠️ **Security Tips:**
1. Never commit your API key to public repositories
2. Use `.env` and ensure it's in `.gitignore`
3. Restrict your API key to specific domains and APIs
4. Monitor API usage in the Google Cloud Console
5. Set up billing alerts in Google Cloud Console

## Troubleshooting

### Map Not Loading
- **Issue**: "Google is not defined" error
- **Solution**: Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in `.env` and restart dev server

### Blank Map
- **Issue**: Map container shows but no map content
- **Solution**: 
  - Check browser console for errors
  - Verify API key is valid and enabled
  - Check that `@react-google-maps/api` is installed

### Markers Not Showing
- **Issue**: Map loads but markers are not visible
- **Solution**:
  - Ensure issues have valid latitude/longitude coordinates
  - Check database records for location data
  - Restart the dev server

### API Quota Exceeded
- **Issue**: "You have exceeded your daily quota" message
- **Solution**:
  - Check Google Cloud Console for current usage
  - Upgrade to a paid plan if needed
  - Implement marker clustering for better performance

## Billing Information

The Google Maps JavaScript API is **free with the following quotas:**
- 28,000 free map loads per day for an existing customer or 25,000 free map loads per day for a new customer
- Usage beyond this quota incurs charges

For more details, visit: https://developers.google.com/maps/billing-and-pricing

## Map Performance Optimization

For large numbers of markers, consider:

1. **Marker Clustering** - Group nearby markers
2. **Radius Search** - Show only markers within a certain radius
3. **Pagination** - Display issues in pages
4. **Zoom-based Filtering** - Show different granularity at different zoom levels

## API Documentation

- **Google Maps Platform**: https://developers.google.com/maps
- **React Google Maps**: https://react-google-maps-api-docs.netlify.app/
- **Maps JavaScript API**: https://developers.google.com/maps/documentation/javascript

## Next Steps

1. Obtain your Google Maps API key
2. Add it to your `.env` file
3. Run `npm install` (if not done automatically)
4. Start the development server: `npm run dev`
5. Test the map feature in the dashboard

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is valid
3. Ensure the Maps JavaScript API is enabled in Google Cloud Console
4. Review troubleshooting section above
5. Check Google Maps JavaScript API documentation
