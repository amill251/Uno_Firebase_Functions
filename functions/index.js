const functions = require("firebase-functions");

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
  
    let cards = [];
  
    // Create cards of four different colors and 0-9, S, +4
    let colors = ["red", "green", "blue", "yellow"]
  
    for (color in colors) {
        for (let i = 0; i <=11; i++) {
            var editedColor = color
            var content = i.toString()
            if (i == 10) {
                content = "S"
            } else if (i == 11) {
                content = "+4"
                editedColor = ""
            }
            let Card = {
              "id": content + color,
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
        hostHand.push(cards.splice(-1))
        guestHand.push(cards.splice(-1))
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
        cards.shuffle()
    }
    discardPile.push(cards.splice(-1))
  
    // game.value = game.value.copy(cards = cards, hostHand = hostHand, guestHand = guestHand, discardPile = discardPile)
  
    Game["cards"] = cards;
    Game["hostHand"] = hostHand;
    Game["guestHand"] = guestHand;
    Game["discardPile"] = discardPile;
    Game["title"] = data;
    console.log(Game)
    return Game;
  } catch(err) {
    console.log(err)
    console.error(err)
    return err;
  }

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