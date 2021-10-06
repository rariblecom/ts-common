import { Action } from "./index"

describe("Action", () => {

	test("action saves promise for stage if not rejected", async () => {
		const simple = generateSimpleAction<number>()
		const action = simple.action.build()

		const promise1 = action.run(0)
		expect(promise1).toBe(action.run(0))

		simple.promise.resolve(10)
		expect(await promise1).toEqual(10)

		expect(promise1).toBe(action.run(0))
	})

	test("action builders can be appended to other action builders", async () => {
		const simple = Action
			.create({ id: "first" as const, run: (value: string) => Promise.resolve(parseInt(value)) })
			.thenStage({ id: "second" as const, run: value => Promise.resolve(value - 3) })

		const append = Action
			.create({ id: "next" as const, run: (value: number) => Promise.resolve(value * 2) })
			.thenStage({ id: "one-more" as const, run: value => Promise.resolve(value + 2) })

		const ab = simple.thenAction(append)
		const action = ab.build("10")
		expect(await action()).toBe(16)
		expect(await ab("100")).toBe(196)
	})

	test("action doesn't save promise for stage if rejected", async () => {
		const simple = generateSimpleAction<number>()
		const action = simple.action.build()

		const promise1 = action.run(0)
		expect(promise1).toBe(action.run(0))

		simple.promise.reject(new Error("rejected"))
		await expect(async () => await promise1).rejects.toThrow(new Error("rejected"))

		expect(action.run(0)).not.toBe(promise1)
	})

	test("action returns result", async () => {
		const simple = generateSimpleAction<number>()
		const action = simple.action.build()

		action.run(0).then()
		simple.promise.resolve(10)

		expect(await action.result).toEqual(10)
		expect(action.ids).toStrictEqual(["one"])
	})

	test("action works for some stages", async () => {
		const promise1 = generatePromise<number>()

		const action = Action
			.create({ id: "s1", run: () => promise1.promise() })
			.thenStage({ id: "s2", run: async value => `str-${value}` })
			.build()

		expect(() => action.run(1)).toThrowError(new Error("Stage 0 hasn't been run yet"))
		const s1 = action.run(0)
		expect(() => action.run(1)).toThrowError(new Error("Stage 0 status is: pending"))
		promise1.resolve(10)
		expect(await s1).toBe(10)

		const s2 = action.run(1)
		expect(await s2).toBe("str-10")
		expect(await action.result).toBe("str-10")
		expect(s2).toBe(action.result)

		expect(action.ids).toStrictEqual(["s1", "s2"])
	})
})

function generateSimpleAction<T>() {
	const promise = generatePromise<T>()
	return {
		promise,
		action: Action.create({ id: "one" as const, run: () => promise.promise() }),
	}
}

function generatePromise<T>() {
	const result: {
		resolve: (value: T) => void
		reject: (err: any) => void
		promise: () => Promise<T>
	} = {
		resolve: () => null,
		reject: () => null,
		promise: () =>
			new Promise<T>((resolve, reject) => {
				result.resolve = resolve
				result.reject = reject
			}),
	}
	return result
}
