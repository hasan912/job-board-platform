import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableNetwork, enableIndexedDbPersistence } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBJBiYBI_dcN0IwR429jy3aKFG2HQxTTEo",
  authDomain: "job-board-platform-d0430.firebaseapp.com",
  projectId: "job-board-platform-d0430",
  storageBucket: "job-board-platform-d0430.firebasestorage.app",
  messagingSenderId: "909282859289",
  appId: "1:909282859289:web:f69f13a4a0320a18c10d88",
  measurementId: "G-3C2KGRR3CF"
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn("Firebase configuration incomplete. Please check environment variables.")
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("Firestore offline persistence enabled")
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser doesn't support offline persistence")
    }
  })

// Enable network access
enableNetwork(db).catch((error) => {
  console.warn("Failed to enable Firestore network:", error.message)
})
