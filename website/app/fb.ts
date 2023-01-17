import type { FirebaseOptions} from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyC610udwU6oz6d2eEpPHyVQeigRtsY2bIc",
  authDomain: "eit-2023.firebaseapp.com",
  projectId: "eit-2023",
  storageBucket: "eit-2023.appspot.com",
  messagingSenderId: "902018616615",
  appId: "1:902018616615:web:2c6d4b9897078b31f66d02"
};

export const DRAWING_COLLECTION_NAME = 'drawings';

export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
