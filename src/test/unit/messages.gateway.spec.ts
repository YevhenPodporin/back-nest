import { createServer } from 'node:http';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import { Server, type Socket as ServerSocket } from 'socket.io';

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
	return new Promise(resolve => {
		socket.once(event, resolve);
	});
}

describe('my awesome project', () => {
	let io, serverSocket;
	let clientSocket: ClientSocket;

	beforeAll(done => {
		const httpServer = createServer();
		io = new Server(httpServer);
		httpServer.listen(() => {
			clientSocket = ioc(`http://localhost:4000`);
			io.on('connection', socket => {
				serverSocket = socket;
			});
			clientSocket.on('connect', done);
		});
	});

	afterAll(() => {
		io.close();
		clientSocket.disconnect();
	});

	it('should work', () => {
		clientSocket.emit('joinRoom', { id: 1 });
	});

	it('should work with an acknowledgement', done => {
		serverSocket.on('hi', cb => {
			cb('hola');
		});
		clientSocket.emit('hi', arg => {
			expect(arg).toBe('hola');
			done();
		});
	});

	it('should work with emitWithAck()', async () => {
		serverSocket.on('foo', cb => {
			cb('bar');
		});
		const result = await clientSocket.emitWithAck('foo');
		expect(result).toBe('bar');
	});

	it('should work with waitFor()', () => {
		clientSocket.emit('baz');

		return waitFor(serverSocket, 'baz');
	});
});
