import { Elysia, ws } from "elysia";

const app = new Elysia()
	.use(ws())
	.ws("/ws", {
		message(ws, message) {
			ws.send(message);
		},
		open(ws) {
			console.log("open for id", ws.data.id);
		},
		close(ws) {
			console.log("close for id", ws.data.id);
		},
	})
	.listen(3000, (server) => {
		console.log(`http://${server.hostname}:${server.port}`);
	});
