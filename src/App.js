import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const GRID_SIZE = 30;
const CELL_SIZE = 20;

function App() {
  const [grid, setGrid] = useState(() => {
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    // Add a glider pattern
    newGrid[10][10] = 1;
    newGrid[10][11] = 1;
    newGrid[10][12] = 1;
    newGrid[11][12] = 1;
    newGrid[12][11] = 1;
    return newGrid;
  });
  const [running, setRunning] = useState(false);

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
        const newRow = (row + i + GRID_SIZE) % GRID_SIZE;
        const newCol = (col + j + GRID_SIZE) % GRID_SIZE;
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
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(updateGrid, 100);
    }
    return () => clearInterval(interval);
  }, [running, updateGrid]);

  const clearGrid = () => {
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
  };

  return (
    <div className="App">
      <h1>Game of Life</h1>
      <div className="controls">
        <button onClick={() => setRunning(!running)}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button onClick={clearGrid}>Clear</button>
      </div>
      <div 
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
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
                width: CELL_SIZE,
                height: CELL_SIZE,
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
