<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card>
        <img src="/banner.png" alt="Document Scanner App" />
        <ion-card-header>
          <ion-card-title>MS Lens clone</ion-card-title>
          <ion-card-subtitle>
            using <code>OpenCV.js</code> and <code>jscanify</code>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <code>jscanify</code> is an open-source pure JavaScript implemented
          mobile document scanner designed to run in any JavaScript environment
          for <strong>FREE</strong>.
        </ion-card-content>
        <ion-button fill="clear" @click="navigateToScan">Go Scan</ion-button>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton
} from "@ionic/vue";

export default defineComponent({
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton
  },
  setup() {
    const router = useRouter();

    const navigateToScan = () => {
      try {
        router.push("/scanner");
      } catch (e) {
        console.error("navigateToScan:", e);
      }
    };

    return {
      navigateToScan
    };
  }
});
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 50px;
}
code {
  background: aliceblue;
  padding: 4px;
  border-radius: 6px;
  margin: 4px 0;
  display: inline-block;
}
</style>
