import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const pointConnections = [
  [3, 1],
  [1, 2],
  [2, 4],
  [1, 0],
  [2, 0],
  [5, 6],
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

const MODEL_PATH =
  "https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4";

const WebCam = () => {
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

    // @ts-ignore : TOFIX!!
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
          runModel(webCamElem);
          // setInterval(() => {
          //   runModel(webCamElem);
          // }, 500);
        });
      }
    });
  };
  useEffect(() => {
    const canvas = document.getElementById("pointCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (dataPoints && dataPoints?.length > 1 && context) {
      context.beginPath();
      const locations = dataPoints.map((p) => {
        const x = Math.floor(p[0] * 345 + 15),
          y = Math.floor(p[1] * 345 + 170);
        return [x, y];
      });

      pointConnections.map((line) => {
        context.moveTo(locations[line[0]][0], locations[line[0]][1]);
        context.lineTo(locations[line[1]][0], locations[line[1]][1]);
      });
      context.stroke();
    }
  }),
    [dataPoints];
  return (
    <>
      <canvas
        id="pointCanvas"
        width="640"
        height="480"
        style={{ position: "fixed", top: 0, left: 0, zIndex: 9 }}
      />
      <video
        style={{ position: "fixed", top: 0, left: 0 }}
        id="webcam"
        autoPlay
        width="640"
      />
      <button
        onClick={() => {
          console.log("clicked");
          turnOnCam();
        }}
      >
        Turn on Cam & Predict
      </button>
    </>
  );
};

export default WebCam;
