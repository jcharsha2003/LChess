import React, { useState, useRef, Suspense } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import "./Home.css";
import { Horse } from "../Horse/Horse";

function Home() {
  const ref = useRef();
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="row container-fluid">
      <div className="col-md-7 home-col container p-5 d-block m-auto">
        <h2 className="fw-bolder text-dark">Master the Art of Chess</h2>
        <p className="lead text-dark">
          Explore the world of chess and sharpen your strategies with
          interactive lessons. Learn from experts, practice tactics, and
          elevate your game—one move at a time!
        </p>
      </div>

      <div className="col-md-5 loader-container">
        {isLoading && (
          <div className="loader">
            <div className="inner one"></div>
            <div className="inner two"></div>
            <div className="inner three"></div>
          </div>
        )}

        <div className="home">
          <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 0, 16] }}>
            <Suspense fallback={null}>
              <Stage
                controls={ref}
                preset="rembrandt"
                intensity={1}
                environment="warehouse"
                adjustCamera={false}
              >
                <Horse onLoad={() => setIsLoading(false)} />
              </Stage>
            </Suspense>
            <OrbitControls ref={ref} autoRotate enableZoom={false} enablePan={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default Home;
