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
          I enjoy working with Java, TypeScript and React. I keep notes on what
          I&apos;m learning on my{" "}
          <a
            href="https://steven-tran.notion.site/CS-Concept-Notes-a8ade4543472479ea0f3ff3a5263ad7f"
            rel="noopener noreferrer"
            target="_blank"
          >
            Notion Page
          </a>
          , check it out!
          <br />
          <br />
          When I&apos;m not online... you can probably find me spending time
          with my two cats or trying out new food in Metro-Atlanta.
        </p>
      </div>
    </div>
  );
};
export default Blurb;
