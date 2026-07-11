import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
    const snap = await getDocs(collection(db, "events"));
    console.log("Total events:", snap.size);
    snap.forEach(doc => {
      console.log(doc.id, doc.data().title);
    });
  } catch (e) {
    console.error("Failed:", e.message);
  }
  process.exit(0);
}
run();
