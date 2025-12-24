import { useEffect, useRef, useState } from "react";
import { GameEngine } from "./engine/GameEngine";
import type { GameStats } from "./engine/types";
import { UIOverlay } from "./components/UIOverlay";

function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const initialized = useRef(false);

  const [stats, setStats] = useState<GameStats>({
    shapeCount: 0,
    areaOccupied: 0,
    gravity: 2,
    shapesPerSec: 1,
  });

  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;

    initialized.current = true;

    const engine = new GameEngine(canvasRef.current, (newStats) =>
      setStats(newStats)
    );

    engine.init(window.innerWidth, window.innerHeight).then(() => {
      if (!engineRef.current) {
        engine.destroy();
      }
    });

    engineRef.current = engine;

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      initialized.current = false;
    };
  }, []);

  const handleRateChange = (delta: number) => {
    if (engineRef.current) {
      engineRef.current.setSpawnRate(engineRef.current.getSpawnRate() + delta);
    }
  };

  const handleGravityChange = (delta: number) => {
    if (engineRef.current) {
      engineRef.current.setGravity(engineRef.current.getGravity() + delta);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <UIOverlay
        stats={stats}
        onRateChange={handleRateChange}
        onGravityChange={handleGravityChange}
      />
    </div>
  );
}

export default App;
