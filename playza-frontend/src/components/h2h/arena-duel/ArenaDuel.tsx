import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CoreEngine, type PlayerInput } from './engine/CoreEngine';
import type { GameState, Player } from './engine/types';
import HUD from './ui/HUD';
import MatchOver from './ui/MatchOver';

const ArenaDuel: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    return new CoreEngine(() => {}).state;
  });

  const handleGameOver = useCallback((winner: string) => {
    setGameState(prev => ({ ...prev, isGameOver: true, winner }));
  }, []);

  const engine = useMemo(() => new CoreEngine(handleGameOver), [handleGameOver]);



  const inputs = useRef<Record<string, PlayerInput>>({
    'player1': { move: { x: 0, y: 0 }, lookAt: { x: 1, y: 0 }, attack: false, ability1: false },
    'player2': { move: { x: 0, y: 0 }, lookAt: { x: -1, y: 0 }, attack: false, ability1: false }
  });

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const p1 = inputs.current['player1'];
      switch (e.key.toLowerCase()) {
        case 'w': p1.move.y = 1; break;
        case 's': p1.move.y = -1; break;
        case 'a': p1.move.x = -1; break;
        case 'd': p1.move.x = 1; break;
        case ' ': p1.attack = true; break;
        case 'shift': p1.ability1 = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const p1 = inputs.current['player1'];
      switch (e.key.toLowerCase()) {
        case 'w': if (p1.move.y === 1) p1.move.y = 0; break;
        case 's': if (p1.move.y === -1) p1.move.y = 0; break;
        case 'a': if (p1.move.x === -1) p1.move.x = 0; break;
        case 'd': if (p1.move.x === 1) p1.move.x = 0; break;
        case ' ': p1.attack = false; break;
        case 'shift': p1.ability1 = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 25, 15]} fov={40} />
        <OrbitControls enableRotate={false} enablePan={false} maxPolarAngle={Math.PI / 2.5} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />

        <GameScene engine={engine} inputs={inputs} onUpdate={setGameState} />
        
        <Environment preset="city" />
        
        {/* Arena Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.5, 0]}>
          <planeGeometry args={[32, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
        </mesh>
        
        <gridHelper args={[32, 32, 0x4f46e5, 0x1e1b4b]} position={[0, -0.49, 0]} />
      </Canvas>

      <HUD state={gameState} />
      {gameState.isGameOver && <MatchOver winner={gameState.winner} onRestart={() => window.location.reload()} />}
      
      {/* Controls Help */}
      <div className="absolute bottom-6 left-6 text-indigo-300/50 text-xs font-mono">
        WASD to Move | SPACE to Attack | L-SHIFT to Dash
      </div>
    </div>
  );
};

// Internal component to handle frame updates
const GameScene: React.FC<{ engine: CoreEngine; inputs: React.MutableRefObject<Record<string, PlayerInput>>; onUpdate: (s: GameState) => void }> = ({ engine, inputs, onUpdate }) => {
  const p1Mesh = useRef<THREE.Group>(null);
  const p2Mesh = useRef<THREE.Group>(null);
  
  useFrame((_, dt) => {
    // Basic AI for Player 2
    updateAI(engine.state.players['player2'], engine.state.players['player1'], inputs.current['player2']);
    
    engine.update(dt, inputs.current);
    onUpdate({ ...engine.state });

    // Sync meshes
    if (p1Mesh.current) {
      p1Mesh.current.position.set(engine.state.players['player1'].position.x, 0, -engine.state.players['player1'].position.y);
    }
    if (p2Mesh.current) {
      p2Mesh.current.position.set(engine.state.players['player2'].position.x, 0, -engine.state.players['player2'].position.y);
    }
  });

  return (
    <>
      <PlayerMesh ref={p1Mesh} color="#6366f1" />
      <PlayerMesh ref={p2Mesh} color="#ef4444" isOpponent />
      
      {engine.state.projectiles.map(p => (
        <ProjectileMesh key={p.id} position={[p.position.x, 0.5, -p.position.y]} color={p.ownerId === 'player1' ? '#818cf8' : '#f87171'} />
      ))}
    </>
  );
};

const PlayerMesh = React.forwardRef<THREE.Group, { color: string; isOpponent?: boolean }>(({ color, isOpponent }, ref) => (
  <group ref={ref}>
    <mesh castShadow position={[0, 0.8, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
    <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} emissive={color} emissiveIntensity={isOpponent ? 0.4 : 0.2} />
    </mesh>
    <mesh position={[0, -0.2, 0]} receiveShadow>
      <cylinderGeometry args={[0.6, 0.6, 0.1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isOpponent ? 1.5 : 1} />
    </mesh>

    {/* Direction indicator */}
    <mesh position={[0, 0.8, -0.6]} rotation={[Math.PI/2, 0, 0]}>
      <coneGeometry args={[0.2, 0.4, 4]} />
      <meshBasicMaterial color="white" />
    </mesh>
  </group>
));

const ProjectileMesh: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => (
  <mesh position={position}>
    <sphereGeometry args={[0.3, 16, 16]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
  </mesh>
);

const updateAI = (bot: Player, target: Player, botInput: PlayerInput) => {
  const dx = target.position.x - bot.position.x;
  const dy = target.position.y - bot.position.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 5) {
    botInput.move.x = dx / dist;
    botInput.move.y = dy / dist;
  } else {
    botInput.move.x = 0;
    botInput.move.y = 0;
  }

  botInput.lookAt.x = dx / dist;
  botInput.lookAt.y = dy / dist;
  botInput.attack = Math.random() < 0.05;
};

export default ArenaDuel;
