export default function ProjectPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Project Dashboard</h2>
      <p className="text-neutral-400 mt-4">Manage your project stages.</p>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <a href="./interview" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Interview</a>
        <a href="./research" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Research</a>
        <a href="./library" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Library</a>
        <a href="./moodboard" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Moodboard</a>
        <a href="./storyboard" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Storyboard</a>
        <a href="./brand" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Brand</a>
        <a href="./implementation" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Implementation</a>
        <a href="./qa" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">QA</a>
        <a href="./critique" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Critique</a>
        <a href="./production" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Production</a>
        <a href="./metrics" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800 block w-64">Metrics</a>
      </div>
    </div>
  );
}
