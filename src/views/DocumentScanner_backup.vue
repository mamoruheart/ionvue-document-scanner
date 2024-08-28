<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Scanner</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div>
        <ScannerView ref="scannerView" />
        <input type="file" @change="onFileChange" accept="image/*" />
        <div v-for="(image, index) in scannedImages" :key="index">
          <img :src="image" alt="Scanned Document" />
        </div>
        <button @click="addPage">Add Page</button>
        <button @click="saveDocument">Save Document</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import cv from "@techstark/opencv-js";

import ScannerView from "../components/ScannerView.vue";

export default defineComponent({
  components: {
    ScannerView
  },
  setup() {
    const scannedImages = ref<string[]>([]);

    const onFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);

              // Process the image with OpenCV
              const src = cv.imread(canvas);
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

              console.log(maxContour);
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
                    canvas.width,
                    0,
                    canvas.width,
                    canvas.height,
                    0,
                    canvas.height
                  ]);

                  const M = cv.getPerspectiveTransform(srcTri, dstTri);
                  cv.warpPerspective(
                    src,
                    dst,
                    M,
                    new cv.Size(canvas.width, canvas.height)
                  );

                  cv.imshow("canvasOutput", dst);
                  M.delete();
                  srcTri.delete();
                  dstTri.delete();
                  approx.delete();
                }
              }

              const dataUrl = canvas.toDataURL("image/png");
              scannedImages.value.push(dataUrl);

              src.delete();
              dst.delete();
              contours.delete();
              hierarchy.delete();
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(input.files[0]);
      }
    };

    const addPage = () => {
      const scannerView = ref<any>(null);
      if (scannerView.value && scannerView.value.$refs.canvas) {
        const canvas: HTMLCanvasElement = scannerView.value.$refs.canvas;
        const image = canvas.toDataURL("image/png");
        scannedImages.value.push(image);
      }
    };

    const saveDocument = () => {
      // Handle saving the document (e.g., to a file, cloud storage, etc.)
    };

    return {
      scannedImages,
      onFileChange,
      addPage,
      saveDocument
    };
  }
});
</script>

<style scoped>
img {
  width: 100%;
  margin-bottom: 10px;
}
button {
  display: block;
  margin: 10px;
}
</style>
