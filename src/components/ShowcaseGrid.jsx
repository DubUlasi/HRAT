import React, { useEffect, useState } from 'react';

const videoList = [
  "1106665_1080p_4k_1280x720.mp4",
  "1107191_1080p_Sanitary_1280x720.mp4",
  "1166776_Man_Smiling_1280x720.mp4",
  "1474131_People_1280x720.mp4",
  "1474335_People_Lifestyle_1280x720.mp4",
  "4931771_Person_Human_1280x720.mp4",
  "4935989_People_Person_1280x720.mp4",
  "4962374_Woman_Portrait_1280x720.mp4",
  "5369523_Coll_wavebreak_Millennial_1280x720.mp4",
  "5374097_Coll_wavebreak_Gen_Z_1280x720.mp4",
  "5381103_Coll_wavebreak_Gen_Z_1280x720.mp4",
  "5394500_Coll_wavebreak_People_1280x720.mp4",
  "5411355_Coll_wavebreak_People_1280x720.mp4",
  "5431647_Coll_wavebreak_People_1280x720 (1).mp4",
  "5998547_People_Person_1280x720.mp4",
  "6004017_Person_People_1280x720.mp4"
];

const checkerboardSets = [
  [0, 2, 5, 7, 8, 10, 13, 15], // Set 0: Non-touching even cells on 4x4 grid
  [1, 3, 4, 6, 9, 11, 12, 14]  // Set 1: Non-touching odd cells on 4x4 grid
];

export default function ShowcaseGrid() {
  const [activeCells, setActiveCells] = useState(new Set());
  const [animatingCells, setAnimatingCells] = useState(new Set());

  useEffect(() => {
    let setIdx = 0;

    function pickRandom(arr, count) {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, arr.length));
    }

    function triggerCycle() {
      setIdx = (setIdx + 1) % checkerboardSets.length;
      const currentSet = checkerboardSets[setIdx];
      const selected = pickRandom(currentSet, 4);

      setAnimatingCells(new Set(selected));

      setTimeout(() => {
        setActiveCells(new Set(selected));
        setTimeout(() => {
          setAnimatingCells(new Set());
        }, 400);
      }, 250);
    }

    triggerCycle();
    const interval = setInterval(triggerCycle, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-showcase">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      <div className="video-grid">
        {videoList.map((src, index) => {
          const isRevealed = activeCells.has(index);
          const isAnimating = animatingCells.has(index);

          return (
            <div
              key={index}
              className={`video-square ${isRevealed ? 'revealed' : ''} ${isAnimating ? 'color-animating' : ''}`}
            >
              <video
                src={`/${src}`}
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
