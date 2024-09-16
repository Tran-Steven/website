import React from "react";
import styles from "../styles/TechMarquee.module.css";

const techLogos = [
  { src: "/react.svg", alt: "React" },
  { src: "/javascript.svg", alt: "JavaScript" },
  { src: "/typescript.svg", alt: "TypeScript" },
  { src: "/java.svg", alt: "Java" },
  { src: "/spring.svg", alt: "Spring" },
  { src: "/postgresql.svg", alt: "PostgreSQL" },
  { src: "/nextjs.svg", alt: "Next.js" },
  { src: "/docker.svg", alt: "Docker" },
  { src: "/mysql.svg", alt: "MySQL" },
];

const TechMarquee: React.FC = () => {
  return (
    <div className={styles.marqueeContainer}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {techLogos.concat(techLogos).map((logo, index) => (
            <div key={index} className={styles.logo}>
              <img src={logo.src} alt={logo.alt} className={styles.logoImage} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechMarquee;
