
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { GestureType } from './types';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [gesture, setGesture] = useState<GestureType>(GestureType.NONE);

  const handleStart = () => {
    setHasStarted(true);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!hasStarted ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <>
          <Experience gesture={gesture} onHandUpdate={(g) => {
            // Only update state if the gesture actually changed to prevent re-render lag
            setGesture(prev => prev !== g ? g : prev);
          }} />
          <UIOverlay gesture={gesture} />
        </>
      )}
    </div>
  );
};

export default App;
