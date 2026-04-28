# 3D Venue Tour Architecture

## Overview
Implement interactive 3D restaurant walkthroughs using **Three.js + React Three Fiber** with fallback to **360° video** for quick wins.

---

## TECH CHOICES

### Option 1: Three.js + Custom Models (Recommended for Differentiation)
**Pros:**
- Full interactivity (click hotspots, real-time table highlighting)
- AR on mobile (WebXR)
- Complete control over UX
- Lightweight after optimization

**Cons:**
- Requires 3D modeling effort
- Performance tuning needed
- Browser WebGL support variance

**Implementation:**
```
Stack:
  - three.js r166              — 3D engine
  - @react-three/fiber        — React renderer
  - @react-three/drei         — helpers (gltf loaders, controls, etc)
  - zustand                   — state (selected table, zoom, etc)

Model Format:
  - glTF 2.0 (.glb, .gltf)    — efficient, widely supported
  - Blender → Babylon exporter or Khronos converter
  - Textures: WebP 512x512 baked for performance
  - LOD (Level of Detail): High-poly in viewport, low-poly in distance
```

### Option 2: Matterport 3D Tours (Premium, Fastest Launch)
**Pros:**
- Professional photogrammetry (phone → 3D)
- Zero modeling work
- Browser-native, no WebGL quirks

**Cons:**
- $600-1200 per tour per year
- No custom interactivity
- Vendor lock-in

**When to use:** Phase 2 launch for 5-10 premium restaurant partners.

### Option 3: 360° Videos (Quick Win, Lower Engagement)
**Pros:**
- Simple to capture (360° camera rental)
- Works on all browsers (HTML5 video)
- Low file size

**Cons:**
- No interactivity (can't click to reserve table)
- No real-time table overlay
- Not as immersive

---

## ARCHITECTURE

### Frontend Component Hierarchy

```
<RestaurantDetail>
  ├── <VideoGallery />           — chef videos, ambiance reels
  ├── <ThreeDViewer />           — THE MAGIC
  │   ├── <Canvas>               — Three.js renderer
  │   │   ├── <Scene>            — 3D world
  │   │   │   ├── <Model>        — restaurant.glb
  │   │   │   ├── <Lights>       — ambient + spotlights
  │   │   │   ├── <Hotspots />   — clickable zones
  │   │   │   └── <Tables />     — table objects
  │   │   └── <CameraControl />  — mouse/touch input
  │   ├── <HUD>                  — overlay UI
  │   │   ├── <TableSelector />  — highlight on click
  │   │   ├── <ZoneInfo />       — details on hover
  │   │   └── <BookButton />     — reserve table
  │   └── <LoadingBar />         — progress
  └── <BookingForm />            — final step
```

### Data Flow

```
GET /restaurants/{id}/3d-config
  ↓
Returns:
{
  model_url: "https://cdn.example.com/restaurants/123-hq.glb",
  model_scale: 0.01,  // unit scaling
  camera: {
    position: [0, 2, 8],
    target: [0, 0, 0]
  },
  hotspots: [
    {
      id: "bar",
      position: [5, 1, 2],
      label: "Cocktail Bar",
      description: "Live DJ every Friday"
    }
  ],
  zones: [
    {
      id: "main-hall",
      name: "Main Dining",
      capacity: 150,
      tables: [...],
      lighting: "warm-yellow"
    }
  ]
}

GET /restaurants/{id}/tables?date=2026-05-15&time=19:00
  ↓
Returns real-time availability:
{
  tables: [
    {
      id: "table-1",
      position: [2, 0, 1],
      seats: 4,
      zone: "main-hall",
      available: true,
      price_per_plate: 2000
    },
    {
      id: "table-2",
      seats: 6,
      available: false,  // booked
      booked_until: "2026-05-15T21:30:00Z"
    }
  ]
}
```

---

## IMPLEMENTATION PHASES

### Phase 2A: Basic 3D Viewer (Week 5-6)
```jsx
// /web/components/3d/SceneRenderer.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

export default function SceneRenderer({ modelUrl, onTableClick }) {
  const { scene } = useGLTF(modelUrl);

  return (
    <Canvas camera={{ position: [0, 2, 8] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      <primitive object={scene} />
      
      <OrbitControls 
        enableZoom={true}
        autoRotate={false}
      />
    </Canvas>
  );
}
```

### Phase 2B: Table Overlay & Selection (Week 6-7)
```jsx
// /web/components/3d/TableLayer.tsx
function TableObjects({ tables, selectedId, onSelect }) {
  return (
    <group>
      {tables.map(table => (
        <group key={table.id} position={table.position}>
          {/* 3D table geometry */}
          <mesh onClick={() => onSelect(table.id)}>
            <cylinderGeometry args={[0.5, 0.5, 0.03, 8]} />
            <meshStandardMaterial 
              color={selectedId === table.id ? '#FFD700' : '#8B7355'}
              emissive={selectedId === table.id ? '#FFD700' : '#000000'}
            />
          </mesh>
          
          {/* Seat count label (above table) */}
          {selectedId === table.id && (
            <Text position={[0, 0.8, 0]} fontSize={0.4}>
              Table {table.id} · {table.seats} seats · ₹{table.price}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
}
```

### Phase 2C: AR Preview on Mobile (Week 7-8)
```jsx
// /mobile/lib/features/3d_viewer/ar_viewer.dart
// Flutter WebXR integration
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';

class ARViewer extends StatelessWidget {
  final String modelUrl;
  
  @override
  Widget build(BuildContext context) {
    return WebviewScaffold(
      url: 'https://api.example.com/ar-viewer?model=$modelUrl',
      // Delegates to Next.js WebXR page
    );
  }
}

// /web/app/ar-viewer/page.tsx
// Uses WebXR API for AR placement
import { useWebXR } from '@react-three/xr';

export default function ARViewerPage() {
  return (
    <ARCanvas>
      <XROrigin />
      <primitive object={restaurantModel} />
    </ARCanvas>
  );
}
```

---

## PERFORMANCE OPTIMIZATION

### Model Optimization
```
Max file size: 5MB total (model + textures)
- Use Draco compression in glTF
- Bake lighting into textures (reduces draw calls)
- Separate LOD variants:
  * Low-poly: <10K triangles (initial load)
  * Medium-poly: <50K (main interaction)
  * High-poly: <100K (close-up)

Loading strategy:
  useGLTF(modelUrl, '/draco/')  // auto-decompress
  setTimeout(() => loadHighPoly(), 2000) // progressive
```

### Rendering Optimization
```
- Frustum culling (Three.js built-in)
- Lazy-load hotspot text
- Offscreen canvas for secondary calculations
- Frame budget: 60fps on mid-range mobile

useFrame hook for custom logic:
  const { clock, camera } = useThree();
  const elapsed = clock.getElapsedTime();
  // Only update every Nth frame on mobile
```

### Network Optimization
```
- CDN: Cloudflare / Bunny for glb files (geo-cached)
- Request headers: Accept-Encoding: gzip, br
- Service Worker: Cache 3D models locally
- Lazy-load on scroll (Intersection Observer)
```

---

## HOTSPOT & ZONE SYSTEM

```tsx
// /web/components/3d/HotspotLayer.tsx
function Hotspot({ position, label, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position} ref={ref}>
      {/* Clickable sphere (invisible) */}
      <mesh onClick={onClick} onPointerEnter={() => setHovered(true)}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial transparent={true} opacity={0} />
      </mesh>

      {/* Visual indicator + label on hover */}
      {hovered && (
        <>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color="#FF6B9D" wireframe />
          </mesh>
          <Text fontSize={0.3} color="white">
            {label}
          </Text>
        </>
      )}
    </group>
  );
}
```

---

## BACKEND SUPPORT

```go
// /api/internal/restaurants/models.go
type Restaurant3DConfig struct {
  ModelURL      string              `json:"model_url"`
  ModelScale    float64             `json:"model_scale"`
  Camera        CameraConfig        `json:"camera"`
  Hotspots      []Hotspot           `json:"hotspots"`
  Zones         []Zone              `json:"zones"`
}

type Hotspot struct {
  ID          string   `json:"id"`
  Position    [3]float64 `json:"position"`
  Label       string   `json:"label"`
  Description string   `json:"description"`
}

type Zone struct {
  ID        string   `json:"id"`
  Name      string   `json:"name"`
  Capacity  int      `json:"capacity"`
  TableIDs  []string `json:"table_ids"`
}

// /api/internal/restaurants/handlers.go
func (h *Handler) Get3DConfig(w http.ResponseWriter, r *http.Request) {
  restaurantID := chi.URLParam(r, "id")
  config, err := h.db.GetRestaurant3DConfig(r.Context(), restaurantID)
  // Return config as JSON
}
```

---

## SAMPLE MODELS & ASSETS

**Where to source:**
1. **Hire 3D modeler** (Fiverr, Upwork) — ~$500-2000/restaurant
2. **Sketchfab free models** — placeholder during dev
3. **Blender community packs** — restaurant furniture assets
4. **Capture with photogrammetry** — phone + Polycam app

**Recommended workflow:**
```
1. Walk through restaurant with phone 360 camera
2. Use Polycam → auto-generates 3D model
3. Refine in Blender
4. Export as .glb
5. Compress + upload to CDN
```

---

## BROWSER & DEVICE SUPPORT

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 60+ | ✅ Full | WebGL2, WebXR |
| Firefox 55+ | ✅ Full | WebGL2 |
| Safari 12+ | ⚠️ Limited | WebGL1 only, no WebXR |
| Mobile Chrome | ✅ Full | WebXR working |
| Mobile Safari | ⚠️ Degraded | No AR, slower |
| Edge 79+ | ✅ Full | Chromium-based |

**Fallback strategy:**
```
if (!hasWebGL) {
  return <Video360Fallback videoUrl={...} />
}
```

---

## FUTURE ENHANCEMENTS

- **Multiplayer:** See other guests selecting tables in real-time (WebSocket)
- **AI Walking Tour:** Audio guide (Claude API) describing each zone
- **Dress Code Visualizer:** See how your outfit looks in the venue lighting
- **Menu Preview:** Click on table → see menu items recommended for that zone
- **Live Kitchen Feed:** 360 stream from restaurant kitchen during booking

---

**Status:** 📋 Ready for Development  
**Framework Choice:** Three.js + React Three Fiber (Phase 1)  
**Backup Plan:** 360 videos if modeling timeline slips
