import { RemoteLogger } from "."

describe("ElkLogger", () => {
	it("should correctly log data", async () => {
		const handler = jest.fn()
		const logger = new RemoteLogger(handler, {
			dropBatchInterval: 100,
		})

		logger.info("test", {
			name: "Ivan",
			isCreator: true,
		})

		logger.error(new Error("My new error"), {
			name: "Ivan",
			isCreator: true,
		})

		const [calls, result] = await new Promise((resolve) => {
			setTimeout(() => {
				resolve([handler.mock.calls.length, handler.mock.calls[0][0]])
			}, 200)
		})

		expect(calls).toEqual(1)
		expect(result).toStrictEqual([{
			level: "INFO",
			message: " \"test\", {\"name\":\"Ivan\",\"isCreator\":true}",
		}, {
			level: "ERROR",
			message: " Error: My new error, {\"name\":\"Ivan\",\"isCreator\":true}",
		}])
	})

	it("should correctly resolve contexts", async () => {
		const handler = jest.fn()
		const logger = new RemoteLogger(handler, {
			dropBatchInterval: 100,
			context: {
				version: "1",
			},
			initialContext: new Promise((resolve) => {
				setTimeout(() => resolve({
					date: "today",
				}), 100)
			}),
		})

		logger.info("test", {
			name: "Ivan",
			isCreator: true,
		})

		const [calls, result] = await new Promise((resolve) => {
			setTimeout(() => {
				resolve([handler.mock.calls.length, handler.mock.calls[0][0]])
			}, 200)
		})

		expect(calls).toEqual(1)
		expect(result).toStrictEqual([{
			level: "INFO",
			message: " \"test\", {\"name\":\"Ivan\",\"isCreator\":true}",
			date: "today",
			version: "1",
		}])
	})
})