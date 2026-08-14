"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 56;
const BAR_GAP = 3;
const MIN_BAR_HEIGHT = 3;

export function Waveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let stopped = false;
    let frame = 0;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let bins: Uint8Array<ArrayBuffer> | null = null;
    const smoothed = new Array<number>(BAR_COUNT).fill(0);
    const start = performance.now();
    const color = getComputedStyle(canvas).color;

    function barTarget(index: number, now: number) {
      if (bins) {
        // Frequency bins are linear but hearing is not, so sample logarithmically
        // to keep the low end from dominating every bar.
        const position = (index + 1) / BAR_COUNT;
        const bin = Math.floor(bins.length ** position) - 1;
        return bins[Math.min(Math.max(bin, 0), bins.length - 1)] / 255;
      }
      const t = (now - start) / 1000;
      return (
        0.2 +
        0.16 * Math.sin(t * 4 + index * 0.5) +
        0.1 * Math.sin(t * 7.3 + index * 0.9)
      );
    }

    function draw(now: number) {
      if (stopped || !canvas || !context) return;

      if (analyser && bins) analyser.getByteFrequencyData(bins);

      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;

      const barWidth = Math.max(2, width / BAR_COUNT - BAR_GAP);
      const center = height / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const target = Math.min(Math.max(barTarget(i, now), 0), 1);
        smoothed[i] += (target - smoothed[i]) * 0.35;
        const barHeight = Math.max(MIN_BAR_HEIGHT, smoothed[i] * height * 0.9);
        const x = i * (barWidth + BAR_GAP);

        context.beginPath();
        context.roundRect(
          x,
          center - barHeight / 2,
          barWidth,
          barHeight,
          barWidth / 2,
        );
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    async function connectMicrophone() {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (stopped) {
          micStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = micStream;
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.75;
        audioContext.createMediaStreamSource(micStream).connect(analyser);
        bins = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        // Mic blocked or unavailable: the synthetic animation stands in.
      }
    }

    void connectMicrophone();
    frame = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      void audioContext?.close();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-20 w-full max-w-md text-primary"
    />
  );
}
