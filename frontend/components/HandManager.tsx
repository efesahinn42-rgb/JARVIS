"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useHandStore } from "@/lib/store";

// Helper for smoothing out jittery coordinates
const lerp = (start: number, end: number, amt: number) => {
    return (1 - amt) * start + amt * end;
};

export default function HandManager() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const setHandData = useHandStore((state) => state.setHandData);
    const isGestureMode = useHandStore((state) => state.isGestureMode);

    const animationRef = useRef<number>(null);
    const lastValidTargetPos = useRef({ x: 0.5, y: 0.5 });
    const smoothedPos = useRef({ x: 0.5, y: 0.5 });

    // Gesture debouncing
    const gestureHistory = useRef<string[]>([]);
    const GESTURE_HISTORY_SIZE = 10; // Frames to consider for stable gesture
    const frameCount = useRef(0);

    useEffect(() => {
        if (!isGestureMode) {
            setHandData({ isDetected: false, gestureType: 'none' });
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        let handLandmarker: HandLandmarker | null = null;
        let webcamRunning = false;

        const setupMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );

            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });

            startWebcam();
        };

        const startWebcam = async () => {
            if (!videoRef.current) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, frameRate: { ideal: 30 } }
                });
                videoRef.current.srcObject = stream;
                videoRef.current.addEventListener("loadeddata", predictWebcam);
                webcamRunning = true;
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        const getMostFrequentGesture = (history: string[]): string => {
            if (history.length === 0) return 'none';
            const counts = history.reduce((acc, curr) => {
                acc[curr] = (acc[curr] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        };

        const predictWebcam = () => {
            if (!handLandmarker || !videoRef.current || !webcamRunning) return;

            const startTimeMs = performance.now();
            const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];

                // 4: Thumb, 8: Index, 12: Middle, 16: Ring, 20: Pinky
                const isThumbExtended = landmarks[4].x < landmarks[3].x;
                const isIndexExtended = landmarks[8].y < landmarks[6].y;
                const isMiddleExtended = landmarks[12].y < landmarks[10].y;
                const isRingExtended = landmarks[16].y < landmarks[14].y;
                const isPinkyExtended = landmarks[20].y < landmarks[18].y;

                // Pinch detection (Distance between thumb and index tips)
                const distancePinch = Math.hypot(
                    landmarks[8].x - landmarks[4].x,
                    landmarks[8].y - landmarks[4].y
                );
                const isPinching = distancePinch < 0.05;

                // Grab detection (All fingers curled towards palm)
                const isGrabbing = !isPinching && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;

                // Spiderman gesture (Thumb + Index + Pinky extended, Middle & Ring curled)
                const isSpiderman = isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended;

                let currentRawGesture: 'none' | 'palm' | 'fist' | 'pinch' | 'point' | 'peace' | 'spiderman' = 'none';

                if (isPinching) currentRawGesture = 'pinch';
                else if (isSpiderman) currentRawGesture = 'spiderman';
                else if (isGrabbing) currentRawGesture = 'fist';
                else if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) currentRawGesture = 'peace';
                else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) currentRawGesture = 'point';
                else if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) currentRawGesture = 'palm';

                // Update gesture history
                gestureHistory.current.push(currentRawGesture);
                if (gestureHistory.current.length > GESTURE_HISTORY_SIZE) {
                    gestureHistory.current.shift();
                }

                // Debounce gesture to prevent flickering
                const stableGesture = getMostFrequentGesture(gestureHistory.current);

                // Target raw positions
                const rawX = 1 - landmarks[8].x; // Mirrored index finger X
                const rawY = landmarks[8].y;     // Index finger Y

                // Smooth out the position (Low-Pass Filter)
                smoothedPos.current = {
                    x: lerp(smoothedPos.current.x, rawX, 0.4),
                    y: lerp(smoothedPos.current.y, rawY, 0.4)
                };

                lastValidTargetPos.current = smoothedPos.current;

                // THRESHOLD OPTIMIZATION: Only update Zustand state slightly less often than every exact frame
                frameCount.current++;
                if (frameCount.current % 2 === 0) {
                    setHandData({
                        isDetected: true,
                        position: { x: smoothedPos.current.x, y: smoothedPos.current.y },
                        isPinching: stableGesture === 'pinch',
                        gestureType: stableGesture as any
                    });
                }
            } else {
                gestureHistory.current = [];
                setHandData({ isDetected: false, isPinching: false, gestureType: 'none' });
            }

            animationRef.current = requestAnimationFrame(predictWebcam);
        };

        setupMediaPipe();

        return () => {
            webcamRunning = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isGestureMode, setHandData]);

    return (
        <div className="fixed top-4 right-4 z-[60] flex flex-col items-end pointer-events-none">
            {/* Kept out of viewport but active for processing */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-1 h-1 opacity-0 absolute pointer-events-none"
            />
        </div>
    );
}
