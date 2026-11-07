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
  const suits = wide && !calm;

  useEffect(() => {
    if (!suits || startScene || window.scrollY > 100 || !hasWebGL()) return undefined;
    let cancelled = false;
    import('../story/scene.js').then(({ startStory }) => {
      if (!cancelled && window.scrollY <= 100) setStartScene(() => startStory);
    });
    return () => { cancelled = true; };
  }, [suits, startScene]);

  return suits && startScene ? <StoryStage start={startScene} /> : <StoryHero />;
}
