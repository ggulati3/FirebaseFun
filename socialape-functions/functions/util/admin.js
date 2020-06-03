const admin = require('firebase-admin');
const serviceAccount = require('/Users/gauravgulati/Desktop/socialape-3be06-firebase-adminsdk-k4y2y-dcd2544adb.json')

// admin.initializeApp();
// admin w/ credentials for testing locally -- take out credentials to deploy
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-3be06.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };