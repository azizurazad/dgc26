const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc } = require('firebase/firestore');

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
    await setDoc(doc(db, "test", "testDoc"), { hello: "world" });
    console.log("Write success!");
  } catch (e) {
    console.error("Write failed:", e);
  }
}
run();
