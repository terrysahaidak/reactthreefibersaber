import { Canvas } from '@react-three/fiber';
import {
  createXRStore,
  DefaultXRController,
  noEvents,
  PointerEvents,
  useXRControllerButtonEvent,
  useXRInputSourceStateContext,
  XR,
  XROrigin,
  XRSpace,
} from '@react-three/xr';
import { Physics } from '@react-three/cannon';
import { FloorCross } from './components/FloorCross';
import { SaberMesh } from './components/Saber';
import {
  BLADE_POSITION,
  BLADE_ROTATION,
  // SPAWN_STAGE_LENGTH,
  // SPAWN_STAGE_POSITION_Z,
  // SPAWN_STAGE_WIDTH,
  // STAGE_LENGTH,
  // STAGE_WIDTH,
} from './constants';
import { gameStore } from './store/store';
import { observer } from 'mobx-react';
import { Router } from './components/Router';
import { useEffect } from 'react';
import { setPreferredColorScheme } from '@react-three/uikit';

setPreferredColorScheme('light');

function useController(hand: 'left' | 'right') {
  const inputState = useXRInputSourceStateContext('controller');

  useEffect(() => {
    const actuator = inputState.inputSource.gamepad?.hapticActuators?.[0];

    if (actuator) {
      gameStore.sabers.setHapticActuator(hand, actuator);
    }

    return () => {
      actuator?.reset();
    };
  }, [inputState.inputSource.gamepad, hand]);

  // Handle trigger press event to spawn a bullet
  useXRControllerButtonEvent(inputState, 'xr-standard-trigger', (state) => {
    // console.log('Trigger state:', state);
    // if (state === 'pressed' && hand === 'right') {
    //   console.log('Trigger pressed');
    //   gameStore.onTriggerPress();
    // }
  });
}

const xrStore = createXRStore({
  emulate: 'metaQuest3',
  controller: {
    rayPointer: true,
    right: function RightController() {
      // const { rotation, position } = useComponentControls('Saber', BLADE_POSITION, BLADE_ROTATION);
      useController('right');

      if (gameStore.state === 'menu' || gameStore.state === 'map-pause') {
        return <DefaultXRController />;
      }

      return (
        <>
          <XRSpace space="grip-space">
            <SaberMesh isRightHand position={BLADE_POSITION} rotation={BLADE_ROTATION} />
          </XRSpace>
        </>
      );
    },
    left: function LeftController() {
      useController('left');

      if (gameStore.state === 'menu' || gameStore.state === 'map-pause') {
        return <DefaultXRController />;
      }

      return (
        <XRSpace space="grip-space">
          <SaberMesh isRightHand={false} position={BLADE_POSITION} rotation={BLADE_ROTATION} />
        </XRSpace>
      );
    },
  },
  // handTracking: false,
  frameBufferScaling: 2.0,
});

const App = observer(function App() {
  function enterAR() {
    if (gameStore.state !== 'loading') {
      return;
    }

    xrStore.enterAR();

    gameStore.onReady();
  }

  // useEffect(() => {
  // setTimeout(() => {
  //   enterAR();
  // }, 500);
  // }, []);

  return (
    <>
      {gameStore.state === 'loading' && (
        <button className="vr-button" onClick={enterAR}>
          Enter AR
        </button>
      )}
      <Canvas events={noEvents} camera={{ fov: 45 }}>
        <PointerEvents batchEvents={false} />

        <Physics>
          <XR store={xrStore}>
            <XROrigin>
              <directionalLight position={[5, 5, 5]} intensity={3} />

              <FloorCross />

              <XROrigin>
                {/* <DebugGrid /> */}

                {/* <mesh>
                  <boxGeometry args={[STAGE_WIDTH, 0.01, STAGE_LENGTH]} />
                  <meshBasicMaterial color="white" transparent opacity={0.7} />
                </mesh>

                <mesh position={[0, 0, -SPAWN_STAGE_POSITION_Z - SPAWN_STAGE_LENGTH / 2]}>
                  <boxGeometry args={[SPAWN_STAGE_WIDTH, 0.01, SPAWN_STAGE_LENGTH]} />
                  <meshBasicMaterial color="white" transparent opacity={0.7} />
                </mesh> */}
              </XROrigin>

              <Router />
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
});

export default App;
