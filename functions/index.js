const functions = require("firebase-functions");
const admin = require("firebase-admin")
admin.initializeApp()

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

exports.createNewGame = functions.https.onCall((data, context) => {
  try {
    let Game = {    
      "title" : "",
      "hostId" : "",
      "guestId" : "",
      "gameStarted" : false,
      "gameOver" : false,
      "hostsMove" : true,
      "nextMove" : false,
      "winner" : "",
      "cards" : [],
      "discardPile" : [],
      "hostHand" : [],
      "guestHand" : []
    }
  
    let cards = [];
  
    // Create cards of four different colors and 0-9, S, +4
    let colors = ["red", "green", "blue", "yellow"]
  
    for (color in colors) {
        for (let i = 0; i <=11; i++) {
            var editedColor = colors[color]
            var content = i.toString()
            if (i == 10) {
                content = "S"
            } else if (i == 11) {
                content = "+4"
                editedColor = ""
            }
            let Card = {
              "id": content + colors[color],
              "content": content,
              "color": editedColor
            }
            cards.push(Card)
        }
    }
  
    // Shuffle cards
    cards = shuffle(cards)
  
    // Deal 7 cards to each player
    var hostHand = []
    var guestHand= []
  
    for (let i = 1; i <= 7; i++) {
        hostHand.push(cards.pop())
        guestHand.push(cards.pop())
    }
  
    // Sort hands by color then content
    // hostHand.sortWith(compareBy({ it.color }, { it.content }))
    // guestHand.sortWith(compareBy({ it.color }, { it.content }))
    hostHand.sort((card1, card2) => {
      if(card1.color == card2.color) {
        return card2.color - card1.color;
  
      } else {
        return card2.content - card1.content;
      }
    });
  
    var discardPile = []
  
    // Does not allow game to start with +4 and adds card from deck to discard game
    while(cards[cards.length - 1].content == "+4") {
        cards = shuffle(cards)
    }
    discardPile.push(cards.pop())
  
    // game.value = game.value.copy(cards = cards, hostHand = hostHand, guestHand = guestHand, discardPile = discardPile)
  
    Game["cards"] = cards;
    Game["hostHand"] = hostHand;
    Game["guestHand"] = guestHand;
    Game["discardPile"] = discardPile;
    Game["title"] = data.gameTitle;
    Game["hostId"] = context.auth.uid;
  
    let docRef = admin.firestore().collection("Games").doc(Game["hostId"]);
    docRef.set(Game).then((response) => {
      console.log(response);
    });

    return Game;
  } catch(err) {
    console.error(err)
    return err;
  }

});

exports.joinGame = functions.https.onCall((data, context) => {
  try {
    let docRef = admin.firestore().collection("Games").doc(data.hostId);
    docRef.update({'guestId' : data.guestId, 'gameStarted' : true})
    .then((response) => {
      return response;
    });
  } catch(err) {
    console.error(err);
    return err;
  }
});

exports.drawCard = functions.https.onCall((data, context) => {
  let docRef = admin.firestore().collection("Games").doc(data.gameId);
  let game = docRef.get();
  let hostHand = data.hostHand;
  let plusFourColor = data.plusFourColor;

  let playingHand;
  let opponentHand;

    function findValidHostHand(hostHand) {
      if (hostHand && game.value.hostsMove) {
        return true
      } else if (!hostHand && !game.value.hostsMove) {
        return false
      } 
  }

  let validHostMove = findValidHostHand(hostHand)

  if (validHostMove != null) {
    if (validHostMove == true) {
        playingHand = game.hostHand
        opponentHand = game.guestHand
    } else if (validHostMove == false) {
        playingHand = game.guestHand
        opponentHand = game.hostHand
    }

    let drawnCard

    if (game.cards.length == 1) {
        drawnCard = game.cards[0]
        let placeholderCard = game.discardPile.shift()
        game.cards.concat(game.discardPile)
        game.discardPile = []
        game.discardPile.push(placeholderCard)
        game.cards.shuffle()
    } else {
        drawnCard = game.cards.pop()
    }

    if (drawnCard.content == "+4") {
        var editedCard = drawnCard
        editedCard.color = plusFourColor
        game.discardPile.unshift(editedCard)

        for(let i = 0; i <= 3; i++) {
            if (!game.cards.length == 0) {
                opponentHand.unshift(game.cards.pop())
            }
        }

        game.hostsMove = !game.hostsMove
        opponentHand.sort((card1, card2) => {
          if(card1.color == card2.color) {
            return card2.color - card1.color;
      
          } else {
            return card2.content - card1.content;
          }
        });
        game.nextMove = !game.nextMove
        docRef.update(game)
        return {"message" : "You drew and played a " + drawnCard.content}
    } else if (drawnCard.content == game.value.discardPile[0].content || drawnCard.color == game.value.discardPile[0].color) {
        game.discardPile.unshift(drawnCard)
        if (drawnCard.content != "S") {
            game.hostsMove = !game.hostsMove
        }
        game.nextMove = !game.nextMove
        docRef.update(game)
        return {"message" : "You drew and played a " + drawnCard.content + " of " + drawnCard.color}
    } else {
        playingHand.unshift(drawnCard)
        game.hostsMove = !game.hostsMove
        playingHand.sort((card1, card2) => {
          if(card1.color == card2.color) {
            return card2.color - card1.color;
      
          } else {
            return card2.content - card1.content;
          }
        });
        game.nextMove = !game.nextMove

        docRef.update(game)
        return {"message" : "You drew a " + drawnCard.content + " of " + drawnCard.color}
    }

    
  } else {
      return {"message" : R.string.wrongTurn}
  }
});

exports.playCard = functions.https.onCall((data, context) => {

  return data;
});

exports.leaveGame = functions.https.onCall((data, context) => {
  try {
    let docRef = admin.firestore().collection("Games").doc(data.gameId);
    let game = docRef.get();
    docRef.update({'gameOver' : true})
    .then(() => {
      docRef.delete().then((response) => {
        return response
      })
    });
  } catch(err) {
    console.error(err);
    return err;
  }
  return data;
});