import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_FHuBUvyRF1HSXHF_5OI5l8opBAb6ZSE",
  authDomain: "dgc-botany.firebaseapp.com",
  projectId: "dgc-botany",
  storageBucket: "dgc-botany.firebasestorage.app",
  messagingSenderId: "283901559742",
  appId: "1:283901559742:web:965e80c34b36d98edaafef"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const id = "evt-" + Date.now();
    await setDoc(doc(db, "events", id), { title: "Test Event" });
    console.log("Write success to events! ID:", id);
    const snap = await getDoc(doc(db, "events", id));
    console.log("Read back:", snap.data());
  } catch (e) {
    console.error("Failed:", e.message);
  }
  process.exit(0);
}
run();
