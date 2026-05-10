import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import landTopo from 'world-atlas/land-110m.json';
import { feature } from 'topojson-client';
import { severityColor } from '../utils/format.js';

const GLOBE_RADIUS = 2;
const PARTICLES_PER_OUTBREAK = 80;

function latLngToVec3(lat, lng, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function severityFromCountry(c) {
  // composite severity 0..1 from spreadRate + (1 - controlIndex) + trend
  const base = (c.spreadRate ?? 0.4) * 0.5 + (1 - (c.controlIndex ?? 0.7)) * 0.4;
  const trend = Math.max(-1, Math.min(1, (c.trend7day ?? 0) / 30));
  return Math.max(0, Math.min(1, base + trend * 0.1));
}

function EarthSphere() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial
        color="#0d1538"
        emissive="#0a1230"
        roughness={0.95}
        metalness={0.1}
        wireframe={false}
      />
    </mesh>
  );
}

function Continents() {
  const rings = useMemo(() => {
    const land = feature(landTopo, landTopo.objects.land);
    const out = [];

    const pushRing = (ring) => {
      const pts = ring.map(([lng, lat]) => latLngToVec3(lat, lng, GLOBE_RADIUS * 1.005));
      out.push(pts);
    };

    const walk = (geom) => {
      if (!geom) return;
      if (geom.type === 'Polygon') {
        geom.coordinates.forEach(pushRing);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly) => poly.forEach(pushRing));
      } else if (geom.type === 'GeometryCollection') {
        geom.geometries.forEach(walk);
      }
    };

    if (land.type === 'FeatureCollection') {
      land.features.forEach((f) => walk(f.geometry));
    } else if (land.type === 'Feature') {
      walk(land.geometry);
    }

    return out;
  }, []);

  return (
    <group>
      {rings.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#d4af37" transparent opacity={0.55} />
        </line>
      ))}
    </group>
  );
}

function Graticule() {
  const lines = useMemo(() => {
    const group = [];
    // latitudes
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        points.push(latLngToVec3(lat, lng, GLOBE_RADIUS * 1.001));
      }
      group.push(points);
    }
    // longitudes
    for (let lng = -180; lng < 180; lng += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToVec3(lat, lng, GLOBE_RADIUS * 1.001));
      }
      group.push(points);
    }
    return group;
  }, []);

  return (
    <group>
      {lines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4a5568" transparent opacity={0.18} />
        </line>
      ))}
    </group>
  );
}

function OutbreakMarkers({ countries, onSelect, hovered, setHovered }) {
  return (
    <group>
      {countries.map((c) => {
        const pos = latLngToVec3(c.lat, c.lng, GLOBE_RADIUS * 1.01);
        const severity = severityFromCountry(c);
        const color = severityColor(severity);
        const size = 0.025 + Math.min(0.06, c.cases / 80000);
        const isHover = hovered?.code === c.code;
        return (
          <mesh
            key={c.code}
            position={pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(c);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(c);
            }}
          >
            <sphereGeometry args={[size * (isHover ? 1.6 : 1), 16, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

function ParticleSwarm({ countries }) {
  const ref = useRef();
  const data = useMemo(() => {
    const positions = [];
    const speeds = [];
    const phases = [];
    const colors = [];
    countries.forEach((c) => {
      const severity = severityFromCountry(c);
      const count = Math.round(PARTICLES_PER_OUTBREAK * severity);
      const origin = latLngToVec3(c.lat, c.lng, GLOBE_RADIUS * 1.02);
      const color = new THREE.Color(severityColor(severity));
      for (let i = 0; i < count; i++) {
        positions.push(origin.x, origin.y, origin.z);
        speeds.push(0.0008 + Math.random() * 0.0025);
        phases.push(Math.random() * Math.PI * 2);
        colors.push(color.r, color.g, color.b);
      }
    });
    return {
      positions: new Float32Array(positions),
      speeds: new Float32Array(speeds),
      phases: new Float32Array(phases),
      colors: new Float32Array(colors),
      count: positions.length / 3,
      origins: positions.slice(),
    };
  }, [countries]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < data.count; i++) {
      const idx = i * 3;
      const ox = data.origins[idx];
      const oy = data.origins[idx + 1];
      const oz = data.origins[idx + 2];
      const phase = data.phases[i];
      const speed = data.speeds[i];
      // particle rises then loops
      const lift = ((t * speed * 60 + phase) % 1.0);
      const radial = GLOBE_RADIUS * 1.02 + lift * 0.35;
      const wobble = Math.sin(t * 0.8 + phase) * 0.04;
      const dir = new THREE.Vector3(ox, oy, oz).normalize();
      const tangent = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      arr[idx] = dir.x * radial + tangent.x * wobble;
      arr[idx + 1] = dir.y * radial + wobble * 0.5;
      arr[idx + 2] = dir.z * radial + tangent.z * wobble;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function AutoRotate({ enabled = true, speed = 0.05 }) {
  useFrame(({ scene }) => {
    if (!enabled) return;
    scene.rotation.y += speed * 0.01;
  });
  return null;
}

export default function Globe({ countries = [], onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative w-full h-[480px] bg-financial-charcoal rounded-xl hairline overflow-hidden shadow-card">
      <Canvas
        className="globe-canvas"
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} color="#d4af37" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#4a5568" />
        <Suspense fallback={null}>
          <Stars radius={50} depth={30} count={2000} factor={3} saturation={0} fade speed={0.5} />
          <EarthSphere />
          <Graticule />
          <Continents />
          <OutbreakMarkers
            countries={countries}
            onSelect={onSelect}
            hovered={hovered}
            setHovered={setHovered}
          />
          <ParticleSwarm countries={countries} />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          minDistance={3.5}
          maxDistance={10}
          enablePan={false}
        />
        <AutoRotate enabled={!hovered} speed={0.04} />
      </Canvas>

      {hovered && (
        <div className="absolute top-3 left-3 max-w-xs bg-financial-navy/95 hairline rounded-lg p-3 pointer-events-none shadow-card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider text-financial-muted">{hovered.code}</span>
            <span className="text-xs text-financial-gold">{hovered.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-financial-muted">Cases</span>
            <span className="tabular text-right text-financial-text">{hovered.cases.toLocaleString()}</span>
            <span className="text-financial-muted">Deaths</span>
            <span className="tabular text-right text-virus-red">{hovered.deaths.toLocaleString()}</span>
            <span className="text-financial-muted">Per 100k</span>
            <span className="tabular text-right">{hovered.casesPer100k}</span>
            <span className="text-financial-muted">7d trend</span>
            <span className={`tabular text-right ${hovered.trend7day >= 0 ? 'text-virus-red' : 'text-virus-safe'}`}>
              {hovered.trend7day > 0 ? '+' : ''}{hovered.trend7day}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-financial-muted">Click to drill down →</div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 flex flex-col gap-1 text-[10px] text-financial-muted">
        <Legend color="#e63946" label="Outbreak" />
        <Legend color="#ff8c00" label="Spreading" />
        <Legend color="#ffd60a" label="Slowing" />
        <Legend color="#06d6a0" label="Controlled" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
