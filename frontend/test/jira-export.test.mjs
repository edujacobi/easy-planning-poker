import assert from "node:assert/strict";
import { test } from "node:test";
import { jiraExport } from "../src/lib/jira-export.ts";

test("exports Jira tasks with descriptions, zero points and unvoted tasks", () => {
	const result = JSON.parse(
		jiraExport(" ABC ", [
			{
				id: "1",
				title: 'Quote "title"',
				description: "First\nsecond",
				points: 0,
				priority: "High",
			},
			{
				id: "2",
				title: "Skipped",
				description: "",
				points: null,
				priority: "Low",
			},
		]),
	);
	assert.deepEqual(result, {
		project: "ABC",
		tasks: [
			{
				title: 'Quote "title"',
				description: "First\nsecond",
				type: "Tarefa",
				priority: "High",
				points: "0",
			},
			{
				title: "Skipped",
				description: "",
				type: "Tarefa",
				priority: "Low",
				points: "",
			},
		],
	});
});
