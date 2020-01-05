const {admin} = require('./firebase-admin');

function syncHey() {
  admin.firestore().collection('hubs').doc('emma').set({
    profile: {
      presence: {
        lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      }
    }
  }, { merge: true }).then(() => {
    console.log("updated successfully!");
  })
  .catch((err) => {
    console.error("update error",err);
  });
}

module.exports = syncHey;