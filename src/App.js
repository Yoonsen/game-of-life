import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// Default parameters
const DEFAULT_GRID_SIZE = 20;
const DEFAULT_CELL_SIZE = 15;
const DEFAULT_SPEED = 100; // milliseconds between updates

// Predefined patterns
const PATTERNS = {
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ],
  blinker: [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ],
  block: [
    [1, 1],
    [1, 1]
  ],
  random: null // Will be generated dynamically
};

function App() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [grid, setGrid] = useState(() => {
    const newGrid = Array(DEFAULT_GRID_SIZE).fill().map(() => Array(DEFAULT_GRID_SIZE).fill(0));
    // Add a glider pattern in the center
    const center = Math.floor(DEFAULT_GRID_SIZE / 2);
    // Glider pattern
    newGrid[center - 1][center] = 1;
    newGrid[center][center + 1] = 1;
    newGrid[center + 1][center - 1] = 1;
    newGrid[center + 1][center] = 1;
    newGrid[center + 1][center + 1] = 1;
    return newGrid;
  });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const createEmptyGrid = (size) => {
    return Array(size).fill().map(() => Array(size).fill(0));
  };

  const placePattern = (pattern, startRow, startCol) => {
    if (!pattern) return;
    const newGrid = grid.map(row => [...row]);
    pattern.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (startRow + i < gridSize && startCol + j < gridSize) {
          newGrid[startRow + i][startCol + j] = cell;
        }
      });
    });
    setGrid(newGrid);
  };

  const generateRandomGrid = () => {
    const newGrid = createEmptyGrid(gridSize);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newGrid[i][j] = Math.random() > 0.7 ? 1 : 0;
      }
    }
    setGrid(newGrid);
  };

  const handlePatternSelect = (patternName) => {
    if (patternName === 'random') {
      generateRandomGrid();
    } else {
      const pattern = PATTERNS[patternName];
      const startRow = Math.floor((gridSize - pattern.length) / 2);
      const startCol = Math.floor((gridSize - pattern[0].length) / 2);
      placePattern(pattern, startRow, startCol);
    }
  };

  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
    setGrid(createEmptyGrid(newSize));
  };

  const toggleCell = (row, col) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      newGrid[row][col] = prevGrid[row][col] ? 0 : 1;
      return newGrid;
    });
  };

  const countNeighbors = (grid, row, col) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = (row + i + gridSize) % gridSize;
        const newCol = (col + j + gridSize) % gridSize;
        count += grid[newRow][newCol];
      }
    }
    return count;
  };

  const updateGrid = useCallback(() => {
    setGrid(prevGrid => {
      return prevGrid.map((row, i) => {
        return row.map((cell, j) => {
          const neighbors = countNeighbors(prevGrid, i, j);
          if (cell === 1) {
            return neighbors === 2 || neighbors === 3 ? 1 : 0;
          } else {
            return neighbors === 3 ? 1 : 0;
          }
        });
      });
    });
  }, [gridSize]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(updateGrid, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, updateGrid, speed]);

  const clearGrid = () => {
    setGrid(createEmptyGrid(gridSize));
  };

  return (
    <div className="App">
      <h1>Game of Life</h1>
      <div className="controls">
        <div className="control-group">
          <button onClick={() => setRunning(!running)}>
            {running ? 'Stop' : 'Start'}
          </button>
          <button onClick={clearGrid}>Clear</button>
        </div>
        
        <div className="control-group">
          <label>
            Grid Size:
            <input
              type="range"
              min="10"
              max="50"
              value={gridSize}
              onChange={(e) => handleGridSizeChange(Number(e.target.value))}
            />
            {gridSize}x{gridSize}
          </label>
        </div>

        <div className="control-group">
          <label>
            Cell Size:
            <input
              type="range"
              min="10"
              max="30"
              value={cellSize}
              onChange={(e) => setCellSize(Number(e.target.value))}
            />
            {cellSize}px
          </label>
        </div>

        <div className="control-group">
          <label>
            Speed:
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            {speed}ms
          </label>
        </div>

        <div className="control-group">
          <label>
            Pattern:
            <select onChange={(e) => handlePatternSelect(e.target.value)}>
              <option value="">Select a pattern</option>
              <option value="glider">Glider</option>
              <option value="blinker">Blinker</option>
              <option value="block">Block</option>
              <option value="random">Random</option>
            </select>
          </label>
        </div>
      </div>

      <div 
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '1px',
          backgroundColor: '#ccc',
          padding: '1px',
        }}
      >
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => toggleCell(i, j)}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? '#000' : '#fff',
                cursor: 'pointer',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
