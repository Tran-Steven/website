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
                <a href="#aboutme">About</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
