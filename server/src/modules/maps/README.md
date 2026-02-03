# Maps Module

Location search and geocoding service integrating Mapbox with OpenStreetMap fallback. Provides location search for trip planning and address lookup.

---

## Overview

Handles location searches across two providers:
1. **Primary**: Mapbox Geocoding API (preferred, more features)
2. **Fallback**: OpenStreetMap Nominatim (when Mapbox unavailable)

---

## Configuration

```typescript
{
  mapboxToken: string                    // From MAPBOX_ACCESS_TOKEN env var
  mapboxBaseUrl: https://api.mapbox.com/geocoding/v5/mapbox.places
  cacheTtl: 10 minutes                  // Results cache duration
  cache: Map<string, CachedResult>     // In-memory cache
}
```

---

## Search Contexts

### Trip Context
Search for trip destinations (cities, countries, regions).

**Mapbox Types Returned**:
- `country` - Countries
- `region` - States/provinces
- `place` - Cities
- `district` - Districts

### Destination Context
Search within trip for POIs and addresses.

**Mapbox Types Returned**:
- `poi` - Points of interest
- `address` - Street addresses
- `locality` - Neighborhoods
- `neighborhood` - Small neighborhoods
- `place` - Cities

---

## LocationSearchResult

```typescript
{
  name: string              // Location name
  address: string          // Full address
  coordinates: {
    lat: number           // Latitude
    lng: number          // Longitude
  }
  placeId: string         // Mapbox place ID
  type?: string          // Location type (country, city, etc.)
  country?: string       // Country name
  city?: string         // City name
}
```

---

## MapService Methods

### Public API

```typescript
searchLocation(
  query: string,
  options?: {
    limit?: number                         // Results count (default: 5)
    proximity?: { lng: number, lat: number }  // Bias coordinates
    types?: string[]                       // Override types filter
    context?: 'trip' | 'destination'     // Search context
  }
): Promise<LocationSearchResult[]>
// Primary search method
// Returns cached or fresh results
// Auto-falls back from Mapbox to OSM on error
```

### Private Methods

```typescript
searchLocationMapbox(query: string, options): Promise<LocationSearchResult[]>
// Call Mapbox Geocoding API
// Requires MAPBOX_ACCESS_TOKEN

searchLocationOSM(query: string, limit: number): Promise<LocationSearchResult[]>
// Call OpenStreetMap Nominatim API
// No authentication required
// Fallback provider

getFromCache(provider: string, key: string, limit: number): LocationSearchResult[] | null
// Retrieve cached results
// Returns null if expired or not found

setCache(provider: string, key: string, limit: number, results: LocationSearchResult[]): void
// Store results with TTL

validateCoordinates(lat: number, lng: number): boolean
// Check latitude [-90, 90] and longitude [-180, 180]

buildGeoPoint(lat: number, lng: number): GeoJSON.Point
// Create GeoJSON Point object
```

---

## Caching Strategy

**Cache Key Components**:
- Provider (mapbox/osm)
- Query string (lowercase, trimmed)
- Result limit
- Proximity coordinates (if provided)

**Features**:
- TTL: 10 minutes per entry
- Separate caches for each provider
- Automatic expiration check on retrieval
- In-memory storage (resets on server restart)

**Example Cache Key**: `mapbox:london:5:51.5074,-0.1278`

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Mapbox unavailable | Log warning, fall back to OSM |
| OSM unavailable | Return empty array |
| Invalid query | Return empty array |
| Missing token (Mapbox) | Log warning, attempt fallback |
| Network timeout | Catch and fallback |

---

## HTTP Endpoints

**Public Routes**:
- `GET /api/trips/search-location?q=london` - Search locations
  - Query params:
    - `q` - Search query (required)
    - `limit` - Results limit (optional, default: 5)
    - `proximity` - Bias by coordinates (optional)
    - `context` - 'trip' or 'destination' (optional)

---

## Integration Points

**Called by**:
- Trip creation endpoints for location search
- Destination creation for address lookup
- User-facing search UI

**Environment Variables**:
```
MAPBOX_ACCESS_TOKEN=pk_xxx...    # From Mapbox dashboard
```

---

## Response Format

**Search Success**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "name": "London",
        "address": "London, United Kingdom",
        "coordinates": {
          "lat": 51.5074,
          "lng": -0.1278
        },
        "placeId": "mapbox.place:...",
        "type": "place",
        "country": "United Kingdom",
        "city": "London"
      },
      {
        "name": "Londonderry",
        "address": "Londonderry, United Kingdom",
        "coordinates": {
          "lat": 55.0088,
          "lng": -7.3100
        },
        "placeId": "mapbox.place:...",
        "type": "place",
        "country": "United Kingdom",
        "city": "Londonderry"
      }
    ]
  }
}
```

**Search Error**:
```json
{
  "success": false,
  "message": "No locations found"
}
```

---

## Examples

### Search for Trip Destination

```typescript
GET /api/trips/search-location?q=paris&limit=5&context=trip

// Response: Top 5 cities/regions named Paris
```

### Search with Proximity Bias

```typescript
GET /api/trips/search-location?q=restaurants&proximity=48.8566,2.3522&context=destination&limit=10

// Response: Restaurants near Paris coordinates
```

### Integrated Search in Trip Creation

```typescript
const locations = await mapService.searchLocation('Barcelona', {
  context: 'trip',
  limit: 5
});

// Frontend displays: Barcelona (Spain), Barceloneta, etc.
// User selects one for destinationLocation
```

---

## Mapbox vs OpenStreetMap

| Feature | Mapbox | OSM |
|---------|--------|-----|
| Authentication | Required token | None |
| Rate limits | 600 req/min | Higher |
| Response quality | Better | Good |
| POI detail | Excellent | Good |
| Address accuracy | Higher | Good |
| Cost | Paid | Free |

**Strategy**: Use Mapbox for primary searches, fall back to OSM when unavailable.

---

## Coordinate Validation

All coordinates validated for correctness:

```typescript
validateCoordinates(51.5074, -0.1278)  // Valid
validateCoordinates(90.0001, 0)        // Invalid: latitude > 90
validateCoordinates(0, 180.0001)       // Invalid: longitude > 180
```

