import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJKOVES8P_BPkIdDJ0iNHU5fPGwGiSBUs",
  authDomain: "neonatosclamptesis-fb6d7.firebaseapp.com",
  projectId: "neonatosclamptesis-fb6d7",
  storageBucket: "neonatosclamptesis-fb6d7.firebasestorage.app",
  messagingSenderId: "1000104650019",
  appId: "1:1000104650019:web:d6da8ebb257f981f045896"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
