"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 56;
const BAR_GAP = 3;
const MIN_BAR_HEIGHT = 3;
const SILENCE_RMS = 0.02;
const SPEAKING_RMS = 0.04;
const QUIET_AFTER_MS = 1600;

export function Waveform({
  active,
  stream,
  onQuietChange,
}: {
  active: boolean;
  stream: MediaStream | null;
  onQuietChange?: (quiet: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onQuietChangeRef = useRef(onQuietChange);

  useEffect(() => {
    onQuietChangeRef.current = onQuietChange;
  });

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let stopped = false;
    let frame = 0;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let bins: Uint8Array<ArrayBuffer> | null = null;
    let samples: Uint8Array<ArrayBuffer> | null = null;
    let quiet = false;
    let quietSince: number | null = null;
    const smoothed = new Array<number>(BAR_COUNT).fill(0);
    const start = performance.now();
    const color = getComputedStyle(canvas).color;

    function setQuiet(next: boolean) {
      if (quiet === next) return;
      quiet = next;
      onQuietChangeRef.current?.(next);
    }

    function trackSilence(now: number) {
      if (!analyser || !samples) return;
      analyser.getByteTimeDomainData(samples);

      let sumSquares = 0;
      for (let i = 0; i < samples.length; i++) {
        const deviation = (samples[i] - 128) / 128;
        sumSquares += deviation * deviation;
      }
      const rms = Math.sqrt(sumSquares / samples.length);

      if (rms > SPEAKING_RMS) {
        quietSince = null;
        setQuiet(false);
        return;
      }
      // Levels between the two thresholds hold the current state so a breath
      // between sentences does not flip it back and forth.
      if (rms > SILENCE_RMS) return;

      quietSince ??= now;
      if (now - quietSince >= QUIET_AFTER_MS) setQuiet(true);
    }

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
      trackSilence(now);

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
      if (!stream) return;
      try {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.75;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        bins = new Uint8Array(analyser.frequencyBinCount);
        samples = new Uint8Array(analyser.fftSize);
      } catch {
        // The synthetic animation remains visible if audio analysis is unavailable.
      }
    }

    void connectMicrophone();
    frame = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      setQuiet(false);
      void audioContext?.close();
    };
  }, [active, stream]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-20 w-full max-w-md text-primary"
    />
  );
}
