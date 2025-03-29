import * as THREE from 'three';
import React, { useState,useRef, useMemo, useContext, createContext ,useEffect} from 'react';
import { useGLTF, Merged } from '@react-three/drei';

const Context = createContext();

export function Instances({ children,onLoad,...props }) {
  const { nodes } = useGLTF('/horse.gltf');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (nodes) {
      setIsLoaded(true); // Mark as loaded
      if (onLoad) onLoad(); // Notify parent component
    }
  }, [nodes, onLoad]);
  const instances = useMemo(
    () => ({
      HorseHorseTex: nodes.Horse_HorseTex_0,
    }),
    [nodes]
  );
  return (
    <Merged meshes={instances} {...props}>
      {(instances) => <Context.Provider value={instances}>{children}</Context.Provider>}
    </Merged>
  );
}

export function Horse(props) {
  const instances = useContext(Context);

  return (
    <group {...props} dispose={null}>
      <group name="Sketchfab_horse">
        <group
          name="Sketchfab_model"
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{ name: 'Sketchfab_model' }}>
          <group
            name="954afc5081af4e60bf6911032683f0f0fbx"
            rotation={[Math.PI / 2, 0, 0]}
            userData={{ name: '954afc5081af4e60bf6911032683f0f0.fbx' }}>
            <group name="RootNode" userData={{ name: 'RootNode' }}>
              <group name="Horse" userData={{ name: 'Horse' }}>
                <instances.HorseHorseTex
                  name="Horse_HorseTex_0"
                  userData={{ name: 'Horse_HorseTex_0' }}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/horse.gltf');