import { useEffect, useState } from 'react';
import StoryHero from './StoryHero.jsx';
import StoryStage from './StoryStage.jsx';
import useMediaQuery from './useMediaQuery.js';

function hasWebGL() {
  return Boolean(document.createElement('canvas').getContext('webgl2'));
}

// The page always works as the plain first screen. The 3D code loads afterwards, only where it suits,
// and takes over only if the reader is still at the top, so nothing moves under someone already reading.
export default function Story() {
  const wide = useMediaQuery('(min-width: 768px)');
  const calm = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [startScene, setStartScene] = useState(null);
  const [webgl] = useState(hasWebGL);
  const [gaveUp, setGaveUp] = useState(false);
  const suits = wide && !calm;
  // The scene is expected: the plain screen waits without its photo. If the scene cannot come, the photo returns.
  const waiting = suits && webgl && !gaveUp && window.scrollY <= 100;

  useEffect(() => {
    if (!suits || startScene || gaveUp || window.scrollY > 100 || !webgl) return undefined;
    let cancelled = false;
    import('../story/scene.js').then(({ startStory }) => {
      if (cancelled) return;
      if (window.scrollY <= 100) setStartScene(() => startStory);
      else setGaveUp(true);
    }, () => { if (!cancelled) setGaveUp(true); });
    return () => { cancelled = true; };
  }, [suits, startScene, gaveUp, webgl]);

  return suits && startScene ? <StoryStage start={startScene} /> : <StoryHero bare={waiting} />;
}
