class WizardOrpheus {
  constructor(openAiApiKey, prompt) {
    this.apiKey = openAiApiKey
    this.prompt = prompt
    this.model = "gpt-4-turbo-preview"
    this.variables = {}
    this.messages = [
      {
        role: 'system',
        content: `${this.prompt}

You MUST call a function. Do not reply with a message under any circumstance.`
      }
    ]
    this.tools = []

    this.inputFunctions = {}
    this.outputFunctions = {}
  }

  variable(name, description, defaultValue) {
    this.variables[name] = {
      value: defaultValue,
      description
    }
  }

  createUserAction({ name, parameters, howBotShouldHandle }) {
    this[name] = (...args) => {
      let inputObj = {}

      args.forEach((arg, i) => {
        inputObj[parameters[i]] = arg
      })

      this.messages.push({
        role: 'user',
        content: `The user used the '${name}' action with the following user-provided input: ${JSON.stringify(inputObj)}"

Determine your next action and pick the most appropriate tool to call. You MUST call a tool, and not reply a message.

Update the values of currentVariables with your latest state and include them in your call to the tool. These are the current values of currentVariables: ${JSON.stringify(this.variables)}
`
      })

      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey} `,
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.messages,
          tools: this.tools,
          tool_choice: 'auto'
        })
      })
        .then(resp => resp.json())
        .then(body => {
          let botReply = body.choices[0].message
          this.messages.push({
            "role": "assistant",
            "tool_calls": botReply.tool_calls
          })

          botReply.tool_calls.forEach(botAction => {
            this.messages.push({
              "role": "tool",
              "tool_call_id": botAction.id,
              "content": 'ok'
            })

            this.outputFunctions[botAction.function.name](JSON.parse(botAction.function.arguments))
          })
        })
    }
  }

  botAction(type, prompt, args, callback) {
    args['currentVariables'] = `A JSON list of all currentVariables, with their current values, modified as needed based on the action taken by ChatGPT. In this format: ${JSON.stringify(this.variables)}`

    let props = {}

    for (let key in args) {
      props[key] = {
        response: {
          type: 'string',
          description: args[key]
        }
      }
    }

    this.tools.push({
      type: 'function',
      function: {
        name: type,
        description: prompt,
        parameters: {
          type: 'object',
          properties: props,
          required: Object.keys(args)
        }
      }
    })

    this.outputFunctions[type] = callback
  }
}
