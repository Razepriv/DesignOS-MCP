export default function ProjectsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Projects</h2>
      <p className="text-neutral-400 mt-4">Your DesignOS projects.</p>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="p-4 rounded border-r border-neutral-800">
          <p className="text-sm text-neutral-400">No projects yet. Create one via MCP or CLI.</p>
        </div>
      </div>
    </div>
  );
}
