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
      <ion-list>
        <ion-item
          v-for="(image, index) in images"
          :key="index"
          @click="setSelImage(image)"
          :class="{ selected: selImage && selImage.src === image.src }"
        >
          <ion-thumbnail slot="start">
            <img :src="image.src" />
          </ion-thumbnail>
          <ion-label>{{ `Image ${index + 1}` }}</ion-label>
        </ion-item>
      </ion-list>

      <div ref="containerRef" class="result-container">
        <div v-if="canvases.length > 0" class="result-row">
          <div
            v-for="(canvas, index) in canvases"
            :key="index"
            class="result-item"
            @click="openModal(canvas)"
          >
            <ion-chip :color="canvas.chip">{{ canvas.caption }}</ion-chip>
            <canvas
              :ref="(el: any) => appendCanvas(el, index)"
              class="result-canvas"
            ></canvas>
          </div>
        </div>
      </div>

      <ion-modal
        v-if="showModal"
        @ionModalDidDismiss="showModal = false"
        :isOpen="showModal"
        canDismiss="true"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ modalTitle }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <img :src="modalImageSrc" class="modal-image" />
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonChip,
  IonModal,
  IonButton,
  toastController
} from "@ionic/vue";

export default defineComponent({
  name: "DocumentScanner",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonChip,
    IonModal,
    IonButton
  },
  setup() {
    const containerRef = ref<HTMLDivElement | null>(null);
    const selImage = ref<{ src: string } | undefined>(undefined);
    const canvases = ref<
      {
        canvas: HTMLCanvasElement;
        caption: string;
        chip: string;
        height: number;
      }[]
    >([]);
    const showModal = ref(false);
    const modalImageSrc = ref<string | undefined>(undefined);
    const modalTitle = ref<string>("");

    const images = [
      { src: "/paper-high.png" },
      { src: "/paper-2.png" },
      { src: "/paper-blue.png" }
    ];

    onMounted(() => {
      if (!window.cv) {
        loadOpenCVLibs();
      }
    });

    const showToast = async (
      message: string,
      position: "top" | "middle" | "bottom"
    ) => {
      try {
        const toast = await toastController.create({
          message,
          duration: 1500,
          position
        });
        await toast.present();
      } catch (e) {
        console.error("showToast:", e);
      }
    };

    const loadOpenCVLibs = () => {
      try {
        const scriptOpenCV = document.createElement("script");
        /**
         * https://docs.opencv.org/4.7.0/opencv.js
         */
        scriptOpenCV.src = "/assets/js/opencv-js/v4.7.0/opencv.js";
        scriptOpenCV.async = true;
        scriptOpenCV.onload = () => {
          console.log("OpenCV.js loaded");
          const scriptJscanify = document.createElement("script");
          /**
           * https://cdn.jsdelivr.net/gh/ColonelParrot/jscanify@master/src/jscanify.min.js
           */
          scriptJscanify.src = "/assets/js/jscanify/jscanify.min.js";
          scriptJscanify.async = true;
          scriptJscanify.onload = () => {
            console.log("jscanify loaded");
            showToast("OpenCV libraries loaded OK", "bottom");
          };
          document.head.appendChild(scriptJscanify);
        };
        document.head.appendChild(scriptOpenCV);
      } catch (e: any) {
        console.error("loadOpenCVLibs:", e);
        showToast(e.message, "bottom");
      }
    };

    const setSelImage = (image: { src: string }) => {
      try {
        selImage.value = image;
      } catch (e) {
        console.error("setSelImage:", e);
      }
    };

    const appendCanvas = (el: HTMLCanvasElement, index: number) => {
      try {
        if (el && canvases.value[index]) {
          const context = el.getContext("2d");
          if (context) {
            const canvasData = canvases.value[index].canvas;
            el.width = canvasData.width;
            el.height = canvasData.height;
            context.drawImage(canvasData, 0, 0, el.width, el.height);
          }
        }
      } catch (e) {
        console.error("appendCanvas:", e);
      }
    };

    const openModal = (canvas: {
      canvas: HTMLCanvasElement;
      caption: string;
    }) => {
      try {
        const dataUrl = canvas.canvas.toDataURL();
        modalImageSrc.value = dataUrl;
        modalTitle.value = canvas.caption;
        showModal.value = true;
      } catch (e) {
        console.error("openModal:", e);
      }
    };

    watch(selImage, (newVal) => {
      try {
        if (!window.cv) {
          let msg = "OpenCV.js is not initialized yet";
          showToast(msg, "bottom");
          loadOpenCVLibs();
          throw new Error(msg);
        }

        const scanner = new (window as any).jscanify();

        if (newVal) {
          canvases.value = [];
          const newImg = document.createElement("img");
          newImg.src = newVal.src;

          newImg.onload = () => {
            try {
              const w = 386;
              const h = 500;
              const extractCanvas = scanner.extractPaper(newImg, w, h);
              const highlightCanvas = scanner.highlightPaper(newImg);
              const extractHeight =
                (w / extractCanvas.width) * extractCanvas.height;
              const highlightHeight =
                (w / highlightCanvas.width) * highlightCanvas.height;
              canvases.value = [
                {
                  canvas: extractCanvas,
                  caption: "Extracted",
                  chip: "success",
                  height: extractHeight
                },
                {
                  canvas: highlightCanvas,
                  caption: "Highlighted",
                  chip: "warning",
                  height: highlightHeight
                }
              ];
            } catch (err) {
              console.error(err);
            }
          };
        }
      } catch (e) {
        console.error("watch_selImage:", e);
      }
    });

    return {
      images,
      selImage,
      setSelImage,
      canvases,
      containerRef,
      appendCanvas,
      showModal,
      modalImageSrc,
      modalTitle,
      openModal
    };
  }
});
</script>

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  margin-top: 16px;
}
.result-row {
  display: flex;
  justify-content: space-around;
  width: 100%;
  gap: 16px;
}
.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
}
.caption {
  margin-bottom: 8px;
  font-weight: bold;
  text-align: center;
}
.result-canvas {
  width: 100%;
  object-fit: contain;
}
.selected {
  background-color: rgba(0, 0, 255, 0.1);
  border: 1px solid blue;
}
.modal-image {
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
</style>
