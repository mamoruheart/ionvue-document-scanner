<template>
  <div ref="cameraContainer" class="camera-container">
    <video ref="video" autoplay playsinline></video>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  setup() {
    const cameraContainer = ref<HTMLDivElement | null>(null);
    const video = ref<HTMLVideoElement | null>(null);

    onMounted(async () => {
      try {
        if (video.value) {
          const constraints = {
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          video.value.srcObject = stream;
        }
      } catch (e) {
        console.error("CameraPreview_onMounted:", e);
      }
    });

    return {
      cameraContainer,
      video
    };
  }
});
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: black;
}
video {
  width: 100%;
  height: 100%;
}
</style>
