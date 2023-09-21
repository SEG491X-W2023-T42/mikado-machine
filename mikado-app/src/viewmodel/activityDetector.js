// temporary file to figure out how to implement activity detector
// will probably integrate into DisplayLayer

import React, { useState, useEffect } from 'react';

function activityDetector() {
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [secondsSinceLastActivity, setSecondsSinceLastActivity] = useState(0);

  // debouncer
  // currently this debounces the "detecting events" activity; output just to console log but should be triggering saving layer to db (which becomes "autosave")
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
  };

  const handleActivity = debounce(() => {
    const currentTime = Date.now();
    setSecondsSinceLastActivity((currentTime - lastActivityTime) / 1000);
    setLastActivityTime(currentTime);
  }, 10000); //debounce 10s, change if necessary

  useEffect(() => {
    const activityTimer = setTimeout(() => {
      console.log(`Time since last activity: ${secondsSinceLastActivity} seconds`);
    }, 1000); // Log every 1 second

    return () => {
      clearTimeout(activityTimer);
    };
  }, [secondsSinceLastActivity]);

  useEffect(() => {
    // Add event listeners for user activity
    // TODO: optimize choice of activity to detect, refer to operations in DisplayLayer
        
    return () => {

    };
  }, []);

  return (
    <div>
      <p>Last Activity: {new Date(lastActivityTime).toLocaleTimeString()}</p>
      <p>Seconds Since Last Activity: {secondsSinceLastActivity.toFixed(1)}</p>
    </div>
  );
}

export default activityDetector;
