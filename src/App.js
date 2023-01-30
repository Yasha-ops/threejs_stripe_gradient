import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { Canvas, extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import "./App.css";


extend({ OrbitControls })

function CameraControls() {
  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controlsRef = useRef();
  useFrame(() => {
    controlsRef.current.update()
  })

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, domElement]}
    />
  );
}


const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uTime: 0,
    color1: new THREE.Color(0xfe4a49),
    color2: new THREE.Color(0xfed766),
    color3: new THREE.Color(0x009fb7),
    color4: new THREE.Color(0xe6e6ea),
    color5: new THREE.Color(0xf4f4f8),
  },
  // Vertex Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vWave;

    varying vec3 vColor;
    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform vec3 color4;
    uniform vec3 color5;

    void updateColor(vec3 color, float noise) {

    }

    void main() {

      vec2 noiseCoord = uv * vec2(6., 8.);

      float tilt = -1.5*uv.y;
      float incline = uv.x * 5.;

      float offset = incline * mix(2., 2.75, uv.y);

      float noise = snoise3(vec3(noiseCoord.x + uTime *.03, noiseCoord.y, uTime * .1));

      vec3 pos = vec3(position.x, position.y, position.z + noise *2. + tilt + incline + offset);

      vec3 colors[5] = vec3[](color1, color2, color3, color4, color5);


      for (int i = 0; i < 3; i++){
        float noiseFlow = .01+ float(i) * 0.04;
        float noiseSpeed = 0.01 + float(i) * 0.001;

        float noiseSeed = 1. + float(i) * 12.;
        vec2 noiseFreq = vec2(.5, 1);


        float noise = snoise3(vec3(
          noiseCoord.x * noiseFreq.x + uTime * noiseFlow,
          noiseCoord.y * noiseFreq.y,
          uTime * noiseSpeed + noiseSeed));

        vColor = mix(vColor, colors[i], noise);
      }

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform float uTime;

    varying vec2 vUv;
    varying float vWave;
    varying vec3 vColor;

    void main() {
      // gl_FragColor = vec4(0.8, 1.0, 1.0, 1.0);
      // gl_FragColor = vec4(vColor, 1.);
      gl_FragColor = vec4(vColor, 1.);
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  return (
    <mesh>
      <planeBufferGeometry args={[40, 40, 128, 128]} />
      <waveShaderMaterial
        uColor={"blue"}
        ref={ref}
      />
    </mesh>
  );
};

function AnimationCanvas() {
  return (
    <Canvas
      colorManagement={false}
      camera={{ position: [0, -5, 5], fov: 100 }}
    >
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
      <CameraControls />
    </Canvas>
  );
}


function App() {
  return (
    <div className="anim">
      <Suspense fallback={<div>Loading...</div>}>
        <AnimationCanvas />
      </Suspense>
    </div>
  );
}
export default App;
