import { useState, useEffect } from "react";
import styles from "../styles/Blurb.module.css";

interface BlurbProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const Blurb = ({ isVisible, onAnimationComplete }: BlurbProps) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationClass(styles.slideInDown);
    } else {
      setAnimationClass(styles.slideOutUp);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.container} ${animationClass}`}>
      <div className={styles.blurb}>
        <h2 className={styles.aboutheading}>A little about myself</h2>
        <p className={styles.abouttext}>
          I&apos;m a Los Angeles based Software Engineer and Computer Science
          graduate from the University of Georgia focusing in full-stack
          development. Previously doing undergraduate research at the
          Neuro-Symbolic Computing Lab.
          <br />
          <br />
          I keep notes on what I&apos;m learning on my{" "}
          <a
            href="https://steven-tran.notion.site/CS-Concept-Notes-a8ade4543472479ea0f3ff3a5263ad7f"
            rel="noopener noreferrer"
            target="_blank"
          >
            Notion Page
          </a>
          , feel free to check it out.
        </p>
      </div>
    </div>
  );
};

export default Blurb;
