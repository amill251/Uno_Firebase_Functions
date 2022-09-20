const functions = require("firebase-functions");

exports.createNewGame = functions.https.onCall((data, context) => {
  let response = 'This is the response'
  return response;
});

exports.joinGame = functions.https.onCall((data, context) => {

  return data;
});

exports.drawCard = functions.https.onCall((data, context) => {

  return data;
});

exports.playCard = functions.https.onCall((data, context) => {

  return data;
});

exports.leaveGame = functions.https.onCall((data, context) => {

  return data;
});