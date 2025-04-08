import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Horse(props) {
  const groupRef = useRef();
  const { scene } = useGLTF("/horse.gltf"); // Load the model

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload model to optimize rendering
useGLTF.preload("/horse.gltf");
