import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD3vuB6KdkTVibaOCb4ILvdB22loRPYN-M",
    authDomain: "agendamentos-11b7b.firebaseapp.com",
    databaseURL: "https://agendamentos-11b7b-default-rtdb.firebaseio.com",
    projectId: "agendamentos-11b7b",
    storageBucket: "agendamentos-11b7b.firebasestorage.app",
    messagingSenderId: "291115500447",
    appId: "1:291115500447:web:266647a86ae54a553673aa",
    measurementId: "G-TXQL6RLC3S"
  };

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };