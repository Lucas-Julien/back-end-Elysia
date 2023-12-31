import { Elysia, ws } from "elysia";
import { v4 as uuidv4 } from "uuid";

export interface Player {
	id: typeof uuidv4;
	color: string;
	position: { x: number; y: number };
}

const players: { [key: string]: Player } = {};

const numPlayers = () => {
	return Object.keys(players).length;
};

const createPlayer = (id: typeof uuidv4, color: string) => ({
	id,
	color,
	position: { x: 250, y: 250 }, // all players begin in the center of the board
});

const handlePositionUpdate = (ws, data: { x: number; y: number }) => {
	const id = ws.data.id;
	const { x, y } = data;
	const player = players[id];
	player.position = { x, y };
	const message = JSON.stringify({ type: "stateUpdate", data: { players } });
	ws.send(message);
};

const handlePlayerCreate = (ws, data: { color: string }) => {
	const { color } = data;
	console.log("Create");
	console.log(color);
	const { id } = ws.data;
	players[id] = createPlayer(id, color);
	console.log(players);
	const message = JSON.stringify({ type: "stateUpdate", data: { players } });
	ws.send(message);
};

const app = new Elysia()
	.use(ws())
	.ws("/ws", {
		message(ws, message) {
			const { type, data } = message as { type: string; data: any };
			console.log("type", type);
			console.log("data", data);
			if (type === "positionUpdate") {
				handlePositionUpdate(ws, data);
			} else if (type === "playerCreate") {
				handlePlayerCreate(ws, data);
			}
		},
		open(ws) {
			console.log("id", ws.id);
			ws.data.id = uuidv4();
			console.log("open for id", ws.data.id);
		},
		close(ws) {
			console.log("close for id", ws.data.id);
			delete players[ws.data.id];
		},
	})
	.listen(3001, (server) => {
		console.log(`http://${server.hostname}:${server.port}`);
	});
