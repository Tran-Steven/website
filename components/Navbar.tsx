import styles from "@styles/Navbar.module.css";
import { useState } from "react";

const Navbar = () => {
  return (
    <header className={styles.wrapper}>
      <div className={styles.navbar}>
        <div className={styles.navname}>
          <a href="#">st</a>
        </div>
        <div className={styles.menu}>
          <ul className={styles.menucontent}>
            <li>
              <a href="#aboutme">about</a>
            </li>
            <li>
              <a href="#projects">projects</a>
            </li>
            <li>
              <a href="#contact">contact</a>
            </li>
          </ul>
        </div>
        <div className={styles.rightContent}>
          {/* Additional content here, e.g., a theme switcher or login button */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
