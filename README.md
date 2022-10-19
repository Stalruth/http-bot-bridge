# HTTP Bot Bridge

Takes Interaction events from the Gateway and sends them to HTTP based bots.

Good for testing HTTP based bots as there is no way to get specific details on
errors in Interaction Responses.

## Usage

Required environment variables:

- `BOT_TOKEN`: The bot's token, required for Gateway access.
- `PORT`: The port on `localhost` to send Interactions to. Defaults to 8080.
- `URL`: The path on `localhost` to send Interactions to. Defaults to the
    empty string.

Optional environment variables:

- `PUBLIC_KEY`: The Public Key to be used on the Bot.
- `PRIVATE_KEY`: The Private Key used for signing Interaction payloads.

If these are not provided they will be generated and printed to standard
output.

