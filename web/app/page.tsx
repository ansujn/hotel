export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="max-w-xl text-center">
        <div className="text-[#E8C872] tracking-[0.25em] text-xs mb-4">
          VIK THEATRE
        </div>
        <h1 className="text-5xl font-serif font-black leading-tight">
          Where every voice finds its <em className="text-[#E8C872]">stage</em>.
        </h1>
        <p className="mt-6 text-neutral-400">
          Web scaffold alive. API expected at{" "}
          <code>{process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}</code>
        </p>
      </div>
    </main>
  );
}
