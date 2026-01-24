import React from "react";
import styles from "./dashboardHeader.module.css";

const DashboardHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div>
          <h2 className={styles.title}>
            Hi, Subu
          </h2>
          <p className={styles.subtitle}>
            Track your all expense and transactions
          </p>
        </div>
      </div>

      {/* <div className={styles.right}>
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
      </div> */}
    </header>
  );
};

export default DashboardHeader;