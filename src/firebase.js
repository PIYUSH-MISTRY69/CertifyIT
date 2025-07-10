// Replace values with your Firebase config
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCt2U3fVZRkEy8CM5KQplYBOp3db0aDtgA",
  authDomain: "certifyit-c4155.firebaseapp.com",
  projectId: "certifyit-c4155",
  storageBucket: "certifyit-c4155.firebasestorage.app",
  messagingSenderId: "1092929327151",
  appId: "1:1092929327151:web:388e9a8420d02b1485b6da"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"  // ✅ This forces the account chooser
});
export const db = getFirestore(app);
export const storage = getStorage(app);
