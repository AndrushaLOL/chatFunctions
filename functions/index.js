/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp();

const db = admin.firestore();

module.exports.createLastMessageInRoom = functions.firestore
    .document('dialogs/{dialogId}/messages/{messageId}')
    .onCreate((snap, context) => {
        const messageData = snap.data();
        const dialogId = context.params.dialogId;
        const messageId = context.params.messageId;
        const users = dialogId.split('_');


        users.forEach((userId) => {
            db.collection(`users/${userId}/dialogs`).doc(dialogId).update({
                lastMessage: {
                    user: {
                        username: messageData.user['username'],
                    },
                    text: messageData.text,
                    time: messageData.time,
                    messageId: messageId
                }
            })
        });
    });

module.exports.updateLastMessageInRoom = functions.firestore
    .document('dialogs/{dialogId}/messages/{messageId}')
    .onUpdate((snap, context) => {
        const messageData = snap.data();
        const dialogId = context.params.dialogId;
        const messageId = context.params.messageId;

        let lastMessageId
        db.doc(`dialogs/${dialogId}`).get().then((snap) => {
            lastMessageId = snap.data().messageId
        }).catch((e) => console.log('huy'));

        if (messageId === lastMessageId) {
            db.collection('dialogs').doc(dialogId).set({
                lastMessage: {
                    user: {
                        username: messageData.user['username'],
                    },
                    text: messageData.text,
                    time: messageData.time,
                    messageId: messageId
                }
            })
        }
    });

module.exports.deleteLastMessageInRoom = functions.firestore
    .document('dialogs/{dialogId}/messages/{messageId}')
    .onDelete((snap, context) => {
        const dialogId = context.params.dialogId;
        const messageId = context.params.messageId;


        let lastMessageId = db.doc(`dialogs/${dialogId}`).get().then((snap) => {
            return snap.data().messageId
        });

        if (messageId === lastMessageId) {
            let messageData;
            db.collection(`dialogs/${dialogId}/messages`).orderBy('time', 'desc').get((snapshots) => {
                lastMessage = snapshots.docs[0]
                console.log(lastMessage);
            })

            db.collection('dialogs').doc(dialogId).set({
                lastMessage: {
                    user: {
                        username: messageData.user['username'],
                    },
                    text: messageData.text,
                    time: messageData.time,
                    messageId: messageId
                }
            })
        }
    });



module.exports.countUnreadMessages = functions.firestore
    .document('dialogs/{dialogId}/messages/{messageId}')
    .onCreate((snap, context) => {

    })