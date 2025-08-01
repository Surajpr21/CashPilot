import React, { useEffect, useState } from 'react';
import styles from './analogClock.module.css';

// Returns IST time (UTC + 5:30)
const getISTTime = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 19800000); // 5.5 hours in ms
};

const AnalogClock = () => {
  const [time, setTime] = useState(getISTTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getISTTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1; // adds smooth movement
  const hourDeg = hours * 30 + minutes * 0.5;     // every minute, hour hand moves 0.5°

  return (
    <div className={styles.clock}>
      <div className={styles.hand + ' ' + styles.hour} style={{ transform: `rotate(${hourDeg}deg)` }} />
      <div className={styles.hand + ' ' + styles.minute} style={{ transform: `rotate(${minuteDeg}deg)` }} />
      <div className={styles.hand + ' ' + styles.second} style={{ transform: `rotate(${secondDeg}deg)` }} />
      <div className={styles.centerDot}></div>
    </div>
  );
};

export default AnalogClock;
