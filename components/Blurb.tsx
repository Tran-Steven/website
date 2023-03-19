import styles from "../styles/Blurb.module.css";
const Blurb = () => {
  return (
    <div className={styles.container}>
      <div className={styles.blurb}>
        <h2 className={styles.aboutheading}>A little about myself</h2>
        <p className={styles.abouttext}>
          Hey there! I&apos;m Steven, an aspiring full-stack developer, and
          current Computer Science student at the University of Georgia. I love
          learning new technologies and creating personal projects to practice.
          I enjoy working with Java, TypeScript and React. When I&apos;m not
          online, you can find me spending time with my two cats and trying out
          new food in Metro-Atlanta.
        </p>
      </div>
    </div>
  );
};
export default Blurb;
