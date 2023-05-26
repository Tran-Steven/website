import Draggable from "react-draggable";
import ReactPlayer from "react-player/youtube";
import styles from "@styles/Drag.module.css";
const DraggableVideo = () => {
  return (
    <div className={styles.dragcon}>
      <Draggable>
        <ReactPlayer
          bounds="parent"
          url="https://youtu.be/dvjy6V4vLlI"
          playing={true}
          volume={0}
          className={styles.con}
        />
      </Draggable>
    </div>
  );
};
export default DraggableVideo;
