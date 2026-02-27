"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useHandStore, useVoiceStore } from "@/lib/store";

interface JarvisBrainProps {
    state: "listening" | "thinking" | "speaking" | "idle";
}

function Particles({ state }: { state: JarvisBrainProps["state"] }) {
    const ref = useRef<THREE.Points>(null!);
    const { viewport } = useThree();

    // Hand Store
    const handData = useHandStore();

    // Voice Store for speaking state
    const isSpeaking = useVoiceStore(state => state.isSpeaking);

    // Voice command position control
    const voiceTargetPos = useRef({ x: 0, y: 0 });
    const isVoiceControlled = useRef(false);

    // Listen for voice commands
    useEffect(() => {
        const handleBrainMove = (e: CustomEvent<{ direction: string }>) => {
            const direction = e.detail.direction;
            const step = 0.5; // Movement step size

            switch (direction) {
                case 'left':
                    voiceTargetPos.current.x = Math.max(voiceTargetPos.current.x - step, -viewport.width / 2);
                    isVoiceControlled.current = true;
                    break;
                case 'right':
                    voiceTargetPos.current.x = Math.min(voiceTargetPos.current.x + step, viewport.width / 2);
                    isVoiceControlled.current = true;
                    break;
                case 'up':
                    voiceTargetPos.current.y = Math.min(voiceTargetPos.current.y + step, viewport.height / 2);
                    isVoiceControlled.current = true;
                    break;
                case 'down':
                    voiceTargetPos.current.y = Math.max(voiceTargetPos.current.y - step, -viewport.height / 2);
                    isVoiceControlled.current = true;
                    break;
                case 'center':
                    voiceTargetPos.current = { x: 0, y: 0 };
                    isVoiceControlled.current = true;
                    break;
                case 'stop':
                    isVoiceControlled.current = false;
                    break;
            }
        };

        window.addEventListener('brain-move', handleBrainMove as EventListener);
        return () => window.removeEventListener('brain-move', handleBrainMove as EventListener);
    }, [viewport]);

    const numParticles = 4000;

    // Base Sphere
    const sphere = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        const rand = new Float32Array(numParticles);
        for (let i = 0; i < numParticles; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 1.3 + (Math.random() * 0.2);
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
            rand[i] = Math.random(); // Store random values for noise
        }
        return { positions: p, randoms: rand };
    }, []);

    // Cube Shape
    const cube = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        for (let i = 0; i < numParticles; i++) {
            const axis = Math.floor(Math.random() * 3);
            const side = Math.random() > 0.5 ? 1 : -1;
            const size = 1.2;
            p[i * 3] = (axis === 0 ? side : (Math.random() * 2 - 1)) * size;
            p[i * 3 + 1] = (axis === 1 ? side : (Math.random() * 2 - 1)) * size;
            p[i * 3 + 2] = (axis === 2 ? side : (Math.random() * 2 - 1)) * size;
        }
        return p;
    }, []);

    // Torus Shape
    const torus = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        const R = 1.2;
        const r = 0.3;
        for (let i = 0; i < numParticles; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            p[i * 3] = (R + r * Math.cos(phi)) * Math.cos(theta);
            p[i * 3 + 1] = (R + r * Math.cos(phi)) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.sin(phi);
        }
        return p;
    }, []);

    // Mini Sphere
    const miniSphere = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        for (let i = 0; i < numParticles; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 0.4 + (Math.random() * 0.1);
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
        }
        return p;
    }, []);

    // Double Ring
    const doubleRing = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        for (let i = 0; i < numParticles; i++) {
            const ringIdx = i % 2;
            const theta = Math.random() * Math.PI * 2;
            const r = 1.5 + (Math.random() * 0.05);
            if (ringIdx === 0) {
                p[i * 3] = r * Math.cos(theta);
                p[i * 3 + 1] = r * Math.sin(theta);
                p[i * 3 + 2] = 0;
            } else {
                p[i * 3] = 0;
                p[i * 3 + 1] = r * Math.sin(theta);
                p[i * 3 + 2] = r * Math.cos(theta);
            }
        }
        return p;
    }, []);

    // DNA Helix / Spiderman web shape idea
    const helix = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        for (let i = 0; i < numParticles; i++) {
            const t = (i / numParticles) * Math.PI * 10;
            const radius = 0.5 + Math.random() * 0.2;
            const isSecondHelix = i % 2 === 0;
            p[i * 3] = Math.cos(t + (isSecondHelix ? Math.PI : 0)) * radius;
            p[i * 3 + 1] = (t / (Math.PI * 10)) * 4 - 2; // Y axis spread
            p[i * 3 + 2] = Math.sin(t + (isSecondHelix ? Math.PI : 0)) * radius;
        }
        return p;
    }, []);

    const [activeTarget, setActiveTarget] = useState(sphere.positions);

    // Initial load animation time Tracker
    const timeRef = useRef(0);

    useEffect(() => {
        if (!handData.isDetected) {
            setActiveTarget(sphere.positions);
            return;
        }
        switch (handData.gestureType) {
            case 'fist': setActiveTarget(cube); break;
            case 'point': setActiveTarget(torus); break;
            case 'pinch': setActiveTarget(miniSphere); break;
            case 'peace': setActiveTarget(doubleRing); break;
            case 'spiderman': setActiveTarget(helix); break;
            case 'palm': setActiveTarget(sphere.positions); break;
            default: setActiveTarget(sphere.positions);
        }
    }, [handData.gestureType, handData.isDetected, sphere.positions, cube, torus, miniSphere, doubleRing, helix]);


    useFrame((stateObj, delta) => {
        if (!ref.current) return;

        // Track time for noise
        timeRef.current += delta;
        const time = timeRef.current;

        // Default Animation
        let rotationSpeed = 0.2;
        let targetScale = 1;
        let noiseAmount = 0.05;

        // State Based overrides
        if (state === "thinking") {
            rotationSpeed = 2.0;
            noiseAmount = 0.15; // More chaotic brain activity
        }
        if (state === "speaking" || isSpeaking) {
            rotationSpeed = 0.5;
            targetScale = 1.2 + Math.sin(time * 5) * 0.1; // Pulsing effect while speaking
            noiseAmount = 0.1;
        }

        // Voice Command Control 
        if (isVoiceControlled.current && !handData.isDetected) {
            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, voiceTargetPos.current.x, 0.05);
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, voiceTargetPos.current.y, 0.05);
        }
        // Hand Control Logic
        else if (handData.isDetected) {
            const x = (handData.position.x * viewport.width) - (viewport.width / 2);
            const y = -(handData.position.y * viewport.height) + (viewport.height / 2);

            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x, 0.1);
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y, 0.1);

            if (handData.gestureType === 'pinch') {
                targetScale = 0.5;
                rotationSpeed = 4.0;
            } else if (handData.gestureType === 'fist') {
                rotationSpeed = 0.4;
            } else if (handData.gestureType === 'spiderman') {
                rotationSpeed = 3.0;
                targetScale = 1.4;
                noiseAmount = 0.2;
            } else {
                rotationSpeed = 2.0;
                targetScale = 1.1;
                noiseAmount = 0.08;
            }
        } else {
            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 0, 0.05);
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 0, 0.05);
        }

        // Apply Rotation
        ref.current.rotation.y -= delta * rotationSpeed * 0.5;
        ref.current.rotation.x += delta * rotationSpeed * 0.1;

        // Apply Scale
        ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.1));

        // Particle Position Interpolation and Organic Noise
        const currentPositions = ref.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < numParticles; i++) {
            const i3 = i * 3;
            const rand = sphere.randoms[i];

            // Organic sine wave noise based on time and individual particle random value
            const xNoise = Math.sin(time * 2 + rand * 10) * noiseAmount;
            const yNoise = Math.cos(time * 3 + rand * 10) * noiseAmount;
            const zNoise = Math.sin(time * 2.5 + rand * 10) * noiseAmount;

            currentPositions[i3] = THREE.MathUtils.lerp(currentPositions[i3], activeTarget[i3] + xNoise, 0.1);
            currentPositions[i3 + 1] = THREE.MathUtils.lerp(currentPositions[i3 + 1], activeTarget[i3 + 1] + yNoise, 0.1);
            currentPositions[i3 + 2] = THREE.MathUtils.lerp(currentPositions[i3 + 2], activeTarget[i3 + 2] + zNoise, 0.1);
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    // Color Logic Based on Gestures
    let color = "#00ff41"; // Default Jarvis Green
    const isSpecialAction = state === "thinking" || state === "speaking" || isSpeaking;
    let bloomIntensity = 1.5;

    if (state === "thinking") { color = "#008F11"; bloomIntensity = 2.0; }
    if (state === "speaking" || isSpeaking) { color = "#ffffff"; bloomIntensity = 2.5; }

    if (handData.isDetected) {
        switch (handData.gestureType) {
            case 'pinch': color = "#ff0000"; bloomIntensity = 3.0; break;
            case 'fist': color = "#0066ff"; bloomIntensity = 1.5; break;
            case 'point': color = "#ffff00"; bloomIntensity = 2.0; break;
            case 'peace': color = "#cc00ff"; bloomIntensity = 2.0; break;
            case 'spiderman': color = "#ff0088"; bloomIntensity = 4.0; break;
            case 'palm': color = "#00ffaa"; bloomIntensity = 2.0; break;
            default: color = "#00ff41";
        }
    }

    return (
        <>
            <Points ref={ref} positions={sphere.positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color={color}
                    size={0.035} // Slightly larger to work well with Bloom
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>

            <EffectComposer>
                <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={bloomIntensity} />
            </EffectComposer>

            {/* Hand Cursor Visualization */}
            {handData.isDetected && !isSpecialAction && (
                <group position={[
                    (handData.position.x * viewport.width) - (viewport.width / 2),
                    -(handData.position.y * viewport.height) + (viewport.height / 2),
                    0
                ]}>
                    <mesh>
                        <ringGeometry args={[0.07, 0.08, 32]} />
                        <meshBasicMaterial color={color} transparent opacity={0.6} />
                    </mesh>
                </group>
            )}
        </>
    );
}

export default function JarvisBrain({ state }: JarvisBrainProps) {
    const handData = useHandStore();

    return (
        <div className="w-full h-full relative">
            {/* Gesture Name Overlay */}
            {handData.isDetected && handData.gestureType !== 'none' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-center">
                    <div className="text-4xl font-bold tracking-[0.5em] opacity-20 animate-pulse" style={{ color: getGestureColor(handData.gestureType) }}>
                        {handData.gestureType.toUpperCase()}
                    </div>
                </div>
            )}

            <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <Particles state={state} />
            </Canvas>
        </div>
    );
}

function getGestureColor(gesture: string) {
    switch (gesture) {
        case 'pinch': return "#ff0000";
        case 'fist': return "#0066ff";
        case 'point': return "#ffff00";
        case 'peace': return "#cc00ff";
        case 'spiderman': return "#ff0088";
        case 'palm': return "#00ffaa";
        default: return "#00ff41";
    }
}
