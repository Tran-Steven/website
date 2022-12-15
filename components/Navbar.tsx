import styles from "@styles/Navbar.module.css";
const Navbar = () => {
  return (
    <header>
      <div className={styles.wrapper}>
        <div className={styles.navbar}>
          <div className={styles.navcontent}>
            <div className={styles.navname}>
              <a href="#">Steven Tran</a>
            </div>
            <div className={styles.menu}>
              <ul className={styles.menucontent}>
                <a href="#">About</a>
                <a href="#">Projects</a>
                <a href="#">Contact</a>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
