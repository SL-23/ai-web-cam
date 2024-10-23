import { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "./App.css";

const MODEL_PATH =
  "https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4";

function App() {
  const [dataPoints, setDataPoints] = useState<Array<number[]> | null>(null);

  const runModel = async (videoEle: HTMLVideoElement) => {
    let movenet = undefined;
    movenet = await tf.loadGraphModel(MODEL_PATH, { fromTFHub: true });

    let imageTensor = tf.browser.fromPixels(videoEle);

    console.log(imageTensor.shape);

    let cropStartPoint = [15, 170, 0];

    let cropSize = [345, 345, 3];

    let croppedTensor = tf.slice(imageTensor, cropStartPoint, cropSize);

    let resizedTensor = tf.image
      .resizeBilinear(croppedTensor, [192, 192], true)
      .toInt();

    console.log(resizedTensor.shape);

    let tensorOutput = movenet.predict(tf.expandDims(resizedTensor));

    let arrayOutput = await tensorOutput.array();

    setDataPoints(arrayOutput[0][0]);

    console.log(arrayOutput, ">>>");
  };

  const turnOnCam = () => {
    const webCam = document.getElementById("webcam");
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (webCam) {
        const webCamElem = webCam as HTMLVideoElement;
        webCamElem.srcObject = stream;
        webCamElem.addEventListener("loadeddata", () => {
          setInterval(() => {
            runModel(webCamElem);
          }, 10);
        });
      }
    });
  };
  return (
    <>
      <video
        style={{ position: "fixed", top: 0, left: 0 }}
        id="webcam"
        autoPlay
        width="640"
        height="360"
      />

      <button
        onClick={() => {
          console.log("clicked");
          turnOnCam();
        }}
      >
        Turn on Cam & Predict
      </button>
      {dataPoints && dataPoints?.length > 0 && (
        <>
          {dataPoints.map((p, i) => {
            console.log(p);
            return (
              <div
                key={i}
                style={{
                  position: "fixed",
                  top: p[0] * 345 + 15,
                  left: p[1] * 345 + 170,
                  height: 10,
                  width: 10,
                  borderRadius: "50%",
                  background: "green",
                }}
              ></div>
            );
          })}
        </>
      )}
    </>
  );
}

export default App;
