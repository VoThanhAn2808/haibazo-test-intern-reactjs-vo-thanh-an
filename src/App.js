import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const getRandomPosition = () => ({
  top: Math.random() * 90 + '%',
  left: Math.random() * 90 + '%',
});

const Point = ({ number, onClick, pos }) => (
  <div
    className="point"
    style={{
      top: pos.top,
      left: pos.left,
      zIndex: 999999 - number, 
    }}
    onClick={() => onClick(number)}
  >
    {number}
  </div>
);


const FadingPoint = ({ number, pos, countdown }) => {
  const opacity = Math.max(0, countdown / 3);

  return (
    <div
      className="point fading"
      style={{
        top: pos.top,
        left: pos.left,
        opacity: opacity,
        zIndex: 1000000, // luôn nằm trên cùng
      }}
    >
      <div>{number}</div>
      <div className="countdown">{countdown.toFixed(1)}s</div>
    </div>
  );
};


export default function App() {
  const [inputTotal, setInputTotal] = useState(5);
  const [totalPoints, setTotalPoints] = useState(0);
  const [points, setPoints] = useState([]);
  const [fadingPoints, setFadingPoints] = useState([]);
  const [current, setCurrent] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const fadeInterval = useRef(null);
  const [pointPositions, setPointPositions] = useState({});
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!autoPlay || !gameStarted || gameOver) return;

    if (current <= totalPoints) {
      const timeout = setTimeout(() => {
        handleClick(current);
      }, 900);

      return () => clearTimeout(timeout);
    }
  }, [autoPlay, current, totalPoints, gameStarted, gameOver]);


  useEffect(() => {
    if (startTime && !gameOver && (current <= totalPoints || fadingPoints.length > 0)) {
      const timer = setInterval(() => {
        setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [startTime, current, totalPoints, fadingPoints, gameOver]);

  useEffect(() => {
    if (fadingPoints.length === 0 || gameOver) return;

    fadeInterval.current = setInterval(() => {
      setFadingPoints(prev =>
        prev
          .map(p => ({ ...p, countdown: p.countdown - 0.1 }))
          .filter(p => p.countdown > 0)
      );
    }, 100);

    return () => clearInterval(fadeInterval.current);
  }, [fadingPoints, gameOver]);

  const handleClick = (number) => {
    if (gameOver) return;
    if (!startTime) setStartTime(Date.now());

    if (number === current) {
      const pos = pointPositions[number];
      setPoints(prev => prev.filter(p => p !== number));
      setFadingPoints(prev => [...prev, { number, countdown: 3, pos }]);
      setCurrent(prev => prev + 1);
    } else {
      setGameOver(true);
      clearInterval(fadeInterval.current);
    }
  };

  const handleStart = () => {
    const total = parseInt(inputTotal);
    if (isNaN(total) || total <= 0 || total > 999999) {
      alert("Please enter a number between 1 and 999999.");
      return;
    }

    const initialPoints = [...Array(total).keys()].map(i => i + 1);
    let tempPoints = initialPoints.map(n => ({
      number: n,
      pos: getRandomPosition(),
    }));

    tempPoints.sort((a, b) => parseFloat(a.pos.top) - parseFloat(b.pos.top));

    const posMap = {};
    const sortedPoints = tempPoints.map(p => {
      posMap[p.number] = p.pos;
      return p.number;
    });

    setPointPositions(posMap);
    setTotalPoints(total);
    setPoints(sortedPoints);
    setFadingPoints([]);
    setCurrent(1);
    setElapsed(0);
    setGameStarted(true);
    setGameOver(false);
    setStartTime(Date.now());
    setAutoPlay(false);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setInputTotal(5);
    setPoints([]);
    setFadingPoints([]);
    setTotalPoints(0);
    setCurrent(1);
    setStartTime(null);
    setElapsed(0);
    setGameOver(false);
    setAutoPlay(false);

    setTimeout(() => {
      handleStart();
    }, 0);
  };

  return (
    <div className="main-container">
      <h2
        className={
          !gameStarted
            ? ""
            : gameOver
              ? "header-red"
              : current > totalPoints && fadingPoints.length === 0
                ? "header-green"
                : ""
        }
      >
        {!gameStarted
          ? "LET'S PLAY"
          : gameOver
            ? "GAME OVER"
            : current > totalPoints && fadingPoints.length === 0
              ? "ALL CLEARED"
              : "LET'S PLAY"}
      </h2>

      <div className="controls">
        <div className='control-item'>
          <label>
            Points:{' '}
            {!gameStarted ? (
              <input
                type="number"
                value={inputTotal}
                onChange={(e) => setInputTotal(e.target.value)}
                min="1"
                max="50"
              />
            ) : (
              <span className='total-point'>{totalPoints}</span>
            )}
          </label>
        </div>

        <div className="control-item">
          <label>Time:</label>
          <span>{elapsed}s</span>
        </div>
        <div className='control-item'>
          {!gameStarted ? (
            <>
              <button onClick={handleStart}>Play</button>
            </>
          ) : (
            <>
              <button onClick={handleRestart}>Restart</button>
            </>
          )}

          {gameStarted && !gameOver && !(current > totalPoints && fadingPoints.length === 0) && (
            <button onClick={() => setAutoPlay(prev => !prev)}>
              Auto Play {autoPlay ? "ON" : "OFF"}
            </button>
          )}
        </div>

      </div>

      <div className="game-area">
        {points.map((p) => (
          <Point key={p} number={p} onClick={handleClick} pos={pointPositions[p]} />
        ))}

        {fadingPoints.map((fp) => (
          <FadingPoint
            key={fp.number}
            number={fp.number}
            countdown={fp.countdown}
            pos={fp.pos}
          />
        ))}
      </div>
    </div>
  );
}
