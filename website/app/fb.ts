import type { FirebaseOptions } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDvk-ZpcDuJlDqyLEYJh4b4bjHAmjKKY8Q",
  authDomain: "eit-2023-drawings.firebaseapp.com",
  projectId: "eit-2023-drawings",
  storageBucket: "eit-2023-drawings.appspot.com",
  messagingSenderId: "165068122997",
  appId: "1:165068122997:web:a070a473a35fe6fa5bc13c",
};

export const DRAWING_COLLECTION_NAME = "drawings";

export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
