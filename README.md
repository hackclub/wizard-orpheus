# Wizard Orpheus

Wizard Orpheus is a JavaScript library that makes it easy peasy to build AI apps in JavaScript with minimal prior knowledge!

### How To Use It

Create an HTML file:

```html
<html>
  <head>
    <title>My Game</title>
  </head>
  <body>
    <!-- Import Wizard Orpheus -->
    <script src="https://cdn.jsdelivr.net/gh/hackclub/wizard-orpheus@ff51edc57157adda99abff5cc4ac71a20285712c/wizard_orpheus.js"></script>

    <!-- Your JavaScript goes here -->
    <script>
      const openAIKey = "PUT_YOUR_OPENAI_KEY_HERE"

      const gamePrompt = `You are a rug merchant. You are selling a rug for
      $200. Your job is to negotiate with the customer to sell the rug for the
      highest possible value, settling at last resort at $100. It should take
      at least 5 messages.`

      // Initiate the Wizard Orpheus game engine. gamePrompt has all of the
      // "rules" of your game in it. You can add more rules by adding more
      // sentences to the prompt.
      let myGame = new WizardOrpheus(openAIKey, gamePrompt)

      // You can define variables that the game engine keeps track of like this.
      // Every time an action in the game happens, Wizard Orpheus will
      // automaticlaly update these variables and send the current values to
      // your callback.
      myGame.variable('currentPrice', 'The current negotiated price for the rug', 200)

      // This defines a function in myGame that you can later call to trigger an
      // action in the game. In this example, this creates the function
      // myGame.sendMessage, which you can call in your code like this:
      //
      // myGame.sendMessage('I will offer $150 for this rug.')
      myGame.createUserAction({
        name: 'sendMessage',
        parameters: ['A message from the user to the merchant'],
        howBotShouldHandle: "Respond to the user's message."
      })

      myGame.botAction('respond', 'Respond to the user', { response: 'sample response' }, data => {

      })
    </script>
  </body>
</html>
```

## Documentation

WizardOrpheus has 4 functions:

- `var game = new WizardOrpheus(apiKey, gameEnginePrompt`)
  - The Wizard Orpheus function will intitialize your game. You're able to input a prompt that will be fed to the bot and set the rules for the game. 

```js
var game = new WizardOrpheus("OPENAI_KEY", `
You're a merchant and you have a customer who is trying to get you to sell your rug for only $100. You need to sell it for $200
`)
```

- `game.variable(variableName, variablePrompt, startingValue)`
  - Create a game variable. Wizard Orpheus will automatically update this variable's value as the game is played, and include its current value in `botAction` functions

```js
game.variable('playerHealth', 'Current health of the player, from 0 to 100. Every time something happens where they get hurt (which happens often), this should decrease. They die at 0.', 100)
game.variable('merchantAngerLevel', 'How angry the merchant is, on a scale from 0 to 50. He is very tempermental.', 0)
```

- `game.createUserAction({ name: 'functionName', parameters: ['sentence descriptions of each variable you will pass'], howBotShouldHandle: "description of what the bot should do" })`
  - This generates a function you can call later in your code to trigger actions that happen in the game. Example: "sendMessage", "attack", "explore".

```js
game.createUserAction({
  name: 'message',
  parameters: ['The user's message to the merchant'],
  howBotShouldHandle: 'Reply to the user with your own message'
})

game.message('Hello merchant! I will offer 150 for this rug.')

game.createUserAction({
  name: 'attackMerchant',
  parameters: ['The amount of damage the player inflicts on the merchant', 'What the user did to attack'],
  howBotShouldHandle: 'Reply to the user and update variables as needed.'
})

game.attackMerchant(10, 'knife')
```

- `game.botAction(actionName, descriptionOfAction, actionParameters, functionToCall)`
  - This defines something that the bot can do. After each user action, the bot will decide to use one or more of these actions to respond. The `data` object includes all of the variables defined in actionParameters, and also has `data.currentVariables`, which has all of the previously declared `game.variable` vars in it. The way to access them is `data.currentVariables.playerHealth.value` (you need `.value`, you can't do just `data.currentVariables.playerHealth`)

```js
game.botAction('reply', 'Send a message to the user', { message: 'The message to display on the screen' }, data => {
  document.body.innerHTML += '<p>' + data.message + '</p>'
})

game.botAction('merchantWifeReply', "The merchant's wife joins the conversation, replies to the user, and calls the merchant an idiot.", { wifeReply: "The wife's reply to the user" }, data => {
  document.body.innerHTML += "<p><i>Merchant's Wife:</i> " + data.wifeReply + "</p>"
})

game.botAction('merchantAttack', "The merchant attacks the user, inflicting damage", {
  attackMethod: "A two sentence description of how the merchant attacks the user.",
  attackWeapon: "A single noun of what the merchant used to attack. Ex. 'candlestick'",
  damage: "A number of how much damage the merchant inflicted on the user"
}, data => {
  document.body.innerHTML += '<p><i>Merchant attacks using <strong>' + data.attackWeapon + '</strong> inflicting <strong>' + data.damage + '</strong></i> - ' + data.attackMethod + '</p>'
})
```