# Google Maps Quick Reference

## Installation & Setup (Quick Version)

```bash
# 1. Navigate to client folder
cd client

# 2. Dependencies are already configured in package.json
npm install

# 3. Add API key to .env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# 4. Start dev server
npm run dev
```

## Map Features

### Color-Coded Markers
- 🔴 **Red** = Open issue
- 🟡 **Orange** = In Progress  
- 🟢 **Green** = Resolved
- 🔵 **Blue** = Your location

### Interactive Elements
- **Click markers** to see issue details
- **Zoom buttons** to navigate
- **Map type selector** for Satellite/Terrain view
- **Info windows** show title, category, status, priority

### Map Controls
| Control | Function |
|---------|----------|
| + / - | Zoom in/out |
| 🗺️ | Toggle map type |
| ⛶ | Fullscreen |
| 🧭 | Compass (shows on tilt) |

## Using Google Maps in Components

### Basic Setup
```javascript
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'

// Wrap component with LoadScript
<LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
  <GoogleMap
    mapContainerStyle={{ height: '600px', width: '100%' }}
    center={{ lat: 22.5726, lng: 88.3639 }}
    zoom={13}
  >
    {/* Map content */}
  </GoogleMap>
</LoadScript>
```

### Adding Markers
```javascript
<Marker
  position={{ lat: 22.5726, lng: 88.3639 }}
  title="Issue Title"
  onClick={() => handleMarkerClick()}
/>
```

### Info Windows
```javascript
{selectedMarker && (
  <InfoWindow
    position={selectedMarker.position}
    onCloseClick={() => setSelectedMarker(null)}
  >
    <div>
      <h3>{selectedMarker.title}</h3>
      <p>{selectedMarker.description}</p>
    </div>
  </InfoWindow>
)}
```

## Common Tasks

### Change Map Center
```javascript
// Update center prop
center={{ lat: newLat, lng: newLng }}
```

### Zoom Level Reference
```javascript
zoom={1}   // World
zoom={5}   // Continent
zoom={10}  // City
zoom={13}  // Neighborhood (Current)
zoom={16}  // Street
zoom={19}  // Building
```

### Custom Marker Icon
```javascript
<Marker
  position={{ lat, lng }}
  icon={{
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    scale: 8,
    fillColor: '#FF0000',
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2
  }}
/>
```

### Map Options
```javascript
<GoogleMap
  options={{
    mapTypeControl: true,      // Toggle map/satellite
    zoomControl: true,         // Show zoom buttons
    streetViewControl: false,  // Hide street view
    fullscreenControl: true,   // Show fullscreen
    gestureHandling: 'auto',   // Auto vs greedy
    mapTypeId: 'roadmap',      // roadmap, satellite, terrain, hybrid
  }}
/>
```

## API Key Management

### Getting Your Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create API Key in Credentials section

### Securing Your Key
```bash
# Don't commit .env file
echo ".env" >> .gitignore

# Use .env.example for documentation
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here_as_placeholder
```

### Setting Restrictions
- Application restrictions: HTTP referrers
- API restrictions: Maps JavaScript API only

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map not loading | Check API key in .env and console errors |
| Markers invisible | Verify coordinates are in [lat, lng] format |
| Blank map | Ensure LoadScript wraps GoogleMap component |
| Performance slow | Use marker clustering for 100+ markers |
| API quota exceeded | Check Google Cloud Console billing |

## Important Files

| File | Purpose |
|------|---------|
| `client/src/pages/CitizenDashboard.jsx` | Main map component |
| `client/src/pages/CitizenDashboard.css` | Map styling |
| `client/.env` | API key configuration |
| `GOOGLE_MAPS_SETUP.md` | Detailed setup guide |
| `GOOGLE_MAPS_MIGRATION.md` | Migration from Leaflet |

## Performance Tips

1. **Lazy Load Maps** - Only render when tab is active
2. **Use Clustering** - Group markers at lower zoom levels
3. **Simplify Markers** - Use simple icons at high zoom
4. **Filter Data** - Show only relevant markers
5. **Cache Results** - Reduce API calls

## Advanced Features

### Available Components
- `GoogleMap` - Main container
- `Marker` - Point markers
- `InfoWindow` - Pop-up information
- `Polyline` - Connect points
- `Polygon` - Draw shapes
- `Rectangle` - Draw rectangles
- `Circle` - Draw circles

### Additional APIs (Requires separate setup)
- Geocoding - Address to coordinates
- Directions - Route planning
- Places - Search locations
- Distance Matrix - Calculate distances

## Support

📖 **Documentation**: https://developers.google.com/maps/documentation/javascript  
🐛 **Issues**: Check console errors first  
💬 **Community**: Stack Overflow / Google Maps Forum  

## Version Info

```json
{
  "@react-google-maps/api": "^2.19.2",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```
