<template>
  <div class="scanner-container">
    <canvas ref="canvas" class="hidden"></canvas>
    <CameraPreview ref="cameraPreview" />
    <button @click="captureDocument">Capture</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import cv from "@techstark/opencv-js";

import CameraPreview from "./CameraPreview.vue";

export default defineComponent({
  components: {
    CameraPreview
  },
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const cameraPreview = ref<any>(null);

    const captureDocument = () => {
      try {
        if (canvas.value && cameraPreview.value) {
          const video: HTMLVideoElement = cameraPreview.value.$refs.video;
          const context = canvas.value.getContext("2d");

          if (context) {
            canvas.value.width = video.videoWidth;
            canvas.value.height = video.videoHeight;
            context.drawImage(
              video,
              0,
              0,
              canvas.value.width,
              canvas.value.height
            );

            const src = cv.imread(canvas.value);
            const dst = new cv.Mat();
            cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
            cv.Canny(src, dst, 50, 100, 3, false);

            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(
              dst,
              contours,
              hierarchy,
              cv.RETR_EXTERNAL,
              cv.CHAIN_APPROX_SIMPLE
            );

            let maxArea = 0;
            let maxContour: cv.Mat | null = null;
            for (let i = 0; i < contours.size(); i++) {
              const contour = contours.get(i);
              const area = cv.contourArea(contour);
              if (area > maxArea) {
                maxArea = area;
                maxContour = contour;
              }
            }

            if (maxContour) {
              const approx = new cv.Mat();
              cv.approxPolyDP(
                maxContour,
                approx,
                0.02 * cv.arcLength(maxContour, true),
                true
              );

              if (approx.size().height === 4) {
                const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                  approx.data32F[0],
                  approx.data32F[1],
                  approx.data32F[2],
                  approx.data32F[3],
                  approx.data32F[4],
                  approx.data32F[5],
                  approx.data32F[6],
                  approx.data32F[7]
                ]);

                const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                  0,
                  0,
                  canvas.value.width,
                  0,
                  canvas.value.width,
                  canvas.value.height,
                  0,
                  canvas.value.height
                ]);

                const M = cv.getPerspectiveTransform(srcTri, dstTri);
                cv.warpPerspective(
                  src,
                  dst,
                  M,
                  new cv.Size(canvas.value.width, canvas.value.height)
                );

                cv.imshow("canvasOutput", dst);
                M.delete();
                srcTri.delete();
                dstTri.delete();
                approx.delete();
              }
            }

            src.delete();
            dst.delete();
            contours.delete();
            hierarchy.delete();
          }
        }
      } catch (e) {
        console.error("captureDocument:", e);
      }
    };

    return {
      canvas,
      cameraPreview,
      captureDocument
    };
  }
});
</script>

<style scoped>
.scanner-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: black;
}
button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.hidden {
  display: none;
}
</style>
