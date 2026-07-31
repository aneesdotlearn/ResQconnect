import React from 'react';
import LoadingScreen from './components/ui/LoadingScreen';
// swap the placeholder card for <LoadingScreen /> to eyeball it, then revert

function App() {
  return (
    // <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    //   <div className="card max-w-md text-center">
    //     <h1 className="text-2xl font-bold text-primary-600 mb-2">ResQconnect</h1>
    //     <p className="text-neutral-500 text-sm">
    //       Women Safety & Emergency Response Platform — scaffold running.
    //     </p>
    //   </div>
    // </div>
    <LoadingScreen />
  );
}
export default App