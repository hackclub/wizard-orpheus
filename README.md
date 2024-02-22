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