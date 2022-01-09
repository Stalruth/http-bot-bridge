# HTTP Bot Bridge

Takes Interaction events from the Gateway and sends them to HTTP based bots.

Good for testing HTTP based bots as there is no way to get specific details on errors in Interaction Responses.

## Usage

Environment variables:

- `BOT_TOKEN`: The bot's token, required for Gateway access.
- `PORT`: The port on `localhost` to send Interactions to. Defaults to 8080.
- `PATH`: The path on `localhost` to send Interactions to. Defaults to the empty string.

Command line parameters:

- `KEYFILE`: Location to read/write the keys to.

