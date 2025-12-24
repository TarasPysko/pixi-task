import React from "react";
import type { GameStats } from "../engine/types";

interface Props {
  stats: GameStats;
  onRateChange: (delta: number) => void;
  onGravityChange: (delta: number) => void;
}

export const UIOverlay: React.FC<Props> = ({
  stats,
  onRateChange,
  onGravityChange,
}) => {
  return (
    <>
      <div style={styles.topPanel}>
        <div style={styles.box}>
          Shapes: <strong>{stats.shapeCount}</strong>
        </div>
        <div style={styles.box}>
          Area: <strong>{stats.areaOccupied} px²</strong>
        </div>
      </div>

      <div style={styles.bottomPanel}>
        <div style={styles.controlGroup}>
          <span style={styles.label}>
            Shapes/sec: <strong>{stats.shapesPerSec.toFixed(1)}</strong>
          </span>
          <button onClick={() => onRateChange(-0.5)} style={styles.btn}>
            -
          </button>
          <button onClick={() => onRateChange(0.5)} style={styles.btn}>
            +
          </button>
        </div>

        <div style={styles.controlGroup}>
          <span style={styles.label}>
            Gravity: <strong>{stats.gravity.toFixed(1)}</strong>
          </span>
          <button onClick={() => onGravityChange(-0.5)} style={styles.btn}>
            -
          </button>
          <button onClick={() => onGravityChange(0.5)} style={styles.btn}>
            +
          </button>
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topPanel: {
    position: "absolute",
    top: 20,
    left: 20,
    display: "flex",
    gap: 20,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 20,
    left: 20,
    display: "flex",
    gap: 20,
  },
  box: {
    background: "rgba(255,255,255,0.9)",
    padding: "10px 20px",
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "sans-serif",
  },
  controlGroup: {
    background: "rgba(255,255,255,0.9)",
    padding: "10px",
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    fontFamily: "sans-serif",
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "none",
    background: "#007bff",
    color: "white",
    fontSize: 18,
    cursor: "pointer",
  },
  label: { marginRight: 5 },
};
