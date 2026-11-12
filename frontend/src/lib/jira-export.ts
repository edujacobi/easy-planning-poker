import type { SessionResults } from "../stores/room";

export function jiraExport(project: string, tasks: SessionResults["tasks"]) {
	return JSON.stringify(
		{
			project: project.trim(),
			tasks: tasks.map((task) => ({
				title: task.title,
				description: task.description,
				type: "Tarefa",
				priority: task.priority,
				points: task.points === null ? "" : String(task.points),
			})),
		},
		null,
		2,
	);
}
