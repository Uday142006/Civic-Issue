# Google Maps Migration Guide

## Summary of Changes

The application has been successfully migrated from **Leaflet.js** (OpenStreetMap) to **Google Maps API** for an enhanced mapping experience.

## What Changed?

### Before (Leaflet)
- Used `react-leaflet` library
- Rendered with OpenStreetMap tiles
- Basic marker popups
- Limited styling options

### After (Google Maps)
- Uses `@react-google-maps/api` library
- Professional Google Maps interface
- Color-coded markers based on issue status
- Rich info windows with detailed information
- Better performance and mobile support
- Built-in controls for zoom, fullscreen, and map type

## Files Modified

### 1. **package.json**
```diff
- "leaflet": "^1.9.4",
- "react-leaflet": "^4.2.1",
+ "@react-google-maps/api": "^2.19.2",
```

### 2. **CitizenDashboard.jsx**
- **Imports**: Replaced Leaflet imports with Google Maps imports
  ```javascript
  // Old
  import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
  
  // New
  import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
  ```

- **Map Component**: Updated map rendering
  ```javascript
  // Old
  <MapContainer center={userLocation} zoom={13} style={{ height: '600px' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  </MapContainer>
  
  // New
  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
    <GoogleMap mapContainerStyle={{ height: '600px' }} center={{ lat, lng }} zoom={13}>
      {/* Markers and Info Windows */}
    </GoogleMap>
  </LoadScript>
  ```

- **Markers**: Enhanced with custom styling
  ```javascript
  // Now includes color-coding based on status
  fillColor: report.status === 'resolved' ? '#10b981' : '#ef4444'
  ```

- **State Management**: Added selectedMarker state
  ```javascript
  const [selectedMarker, setSelectedMarker] = useState(null)
  ```

### 3. **CitizenDashboard.css**
- Added styles for Google Maps info windows
- Added styles for the map container and view details button

### 4. **Environment Variables**
- `.env.example` already had placeholder for `VITE_GOOGLE_MAPS_API_KEY`
- Requires actual API key from Google Cloud Console

## Feature Comparison

| Feature | Leaflet | Google Maps |
|---------|---------|------------|
| Tile Provider | OpenStreetMap | Google |
| Custom Markers | Basic | Advanced |
| Info Windows | Popups | Rich HTML |
| Map Controls | Basic | Full UI Suite |
| Mobile Support | Good | Excellent |
| Performance | Good | Excellent |
| Street View | No | Yes |
| Satellite View | Limited | Excellent |
| Traffic Layer | No | Yes |
| Clustering | Manual | Built-in |

## Setup Instructions

1. **Get Google Maps API Key**
   - See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for detailed instructions

2. **Update Environment Variables**
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage Examples

### Accessing Map in Component
```javascript
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'

function MyMap() {
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [location, setLocation] = useState({ lat: 22.5726, lng: 88.3639 })

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ height: '600px', width: '100%' }}
        center={location}
        zoom={13}
      >
        <Marker
          position={location}
          onClick={() => setSelectedMarker(location)}
        />
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>Marker Info</div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  )
}
```

### Marker Status Colors
```javascript
const markerColor = 
  status === 'resolved' ? '#10b981' :        // Green
  status === 'in_progress' ? '#f59e0b' :     // Amber
  '#ef4444'                                   // Red
```

## Benefits of Migration

✅ **Better Performance**: Google Maps handles large datasets efficiently  
✅ **Professional Look**: Modern Material Design UI  
✅ **Rich Features**: Street View, Satellite, Traffic, Transit layers  
✅ **Mobile Friendly**: Responsive and touch-optimized  
✅ **Better Documentation**: Extensive Google Maps documentation  
✅ **Enterprise Ready**: Used by millions of applications  
✅ **Advanced Search**: Geocoding and Place Autocomplete APIs  

## Rollback Instructions

If you need to revert to Leaflet:

1. **Update package.json**
   ```bash
   npm remove @react-google-maps/api
   npm install leaflet react-leaflet
   ```

2. **Restore CitizenDashboard.jsx** from git history
   ```bash
   git checkout HEAD -- client/src/pages/CitizenDashboard.jsx
   ```

3. **Remove Google Maps styles** from CitizenDashboard.css

## Common Questions

### Q: Is Google Maps free?
**A**: Yes, with a free tier. See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for pricing details.

### Q: Can I use both Leaflet and Google Maps?
**A**: Yes, but not recommended. They would conflict. Choose one for the entire app.

### Q: How do I add more features like Directions?
**A**: Import additional components from `@react-google-maps/api` and add them to the GoogleMap component.

### Q: Can I customize the map styling?
**A**: Yes, use the `options` prop in GoogleMap to pass custom styles.

## Next Steps

1. ✅ Google Maps API is integrated
2. ⏭️ Configure API key (see GOOGLE_MAPS_SETUP.md)
3. ⏭️ Test all map features
4. ⏭️ Consider adding advanced features (Directions, Places, etc.)

## Support Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps API Docs](https://react-google-maps-api-docs.netlify.app/)
- [Getting Started Guide](GOOGLE_MAPS_SETUP.md)

## Technical Details

### Dependencies
- `@react-google-maps/api: ^2.19.2`
- `react: ^18.2.0`
- `react-dom: ^18.2.0`

### Browser Support
- Chrome, Firefox, Safari, Edge (latest versions)
- IE 11 with polyfills

### API Version
- Using Google Maps JavaScript API v3.54+
