export default function HomePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Welcome to DesignOS Studio</h2>
      <p className="text-neutral-400 mt-4">
        Design Intelligence Operating System. Create a project to get started.
      </p>
      <div className="mt-4">
        <a href="/projects" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-800">View Projects →</a>
      </div>
    </div>
  );
}
