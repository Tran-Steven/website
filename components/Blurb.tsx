import styles from "../styles/Blurb.module.css";
import TechMarquee from "./TechMarquee";
const Blurb = () => {
  return (
    <div className={styles.container}>
      <div className={styles.blurb}>
        <h2 className={styles.aboutheading}>A little about myself</h2>
        <p className={styles.abouttext}>
          ATL-based Software Engineer and Computer Science graduate from the
          University of Georgia focusing in full-stack development. Previously
          doing undergraduate research at the Neuro-Symbolic Computing Lab.
          <br></br>
          <br></br>I keep notes on what I'm learning on my{" "}
          <a
            href="https://steven-tran.notion.site/CS-Concept-Notes-a8ade4543472479ea0f3ff3a5263ad7f"
            rel="noopener noreferrer"
            target="_blank"
          >
            Notion Page
          </a>
          , feel free to check it out.
        </p>
        <br />
        <br />
        <p className={styles.techheading}>Technologies I&apos;ve Worked With</p>
        <TechMarquee />
      </div>
    </div>
  );
};
export default Blurb;
