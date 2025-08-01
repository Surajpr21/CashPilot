import React, { useEffect, useState } from "react";
import styles from "./dashboardHeader.module.css";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AnalogClock from "./AnalogClock";

const DashboardHeader = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div>
          <h2 className={styles.title}>
            Hi, Subu <span className={styles.wave}>👋</span>
          </h2>
          <p className={styles.subtitle}>
            Track your all expense and transactions
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.center}>
               <AnalogClock />
          <span className={styles.time}>
             {time} | {date} | IN
          </span>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search expenses, transaction, cards"
          />
          <MagnifyingGlassIcon className={styles.searchIcon} />
        </div>

        <div className={styles.bellWrapper}>
          <BellIcon className={styles.bellIcon} />
          <span className={styles.notification}>2</span>
        </div>

        <img
          src="https://i.imgur.com/yzKDSZa.png"
          alt="Avatar"
          className={styles.avatar}
        />
      </div>
    </header>
  );
};

export default DashboardHeader;