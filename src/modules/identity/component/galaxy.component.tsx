import { useEffect, useRef } from 'react';
import { renderGalaxy } from '../util/render-galaxy';

export default function GalaxyComponent() {
  const mountRef = useRef(null);

  useEffect(() => {
    const galaxyHandle = renderGalaxy(mountRef); // :v

    galaxyHandle.start();

    return () => {
      galaxyHandle.doCancel();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute top-0 left-0 right-0 bottom-0"
    ></div>
  );
}
