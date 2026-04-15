import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <aside className="relative hidden md:flex grad-login p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff2 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff1 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          <div className="serif text-2xl font-black">
            Vik<span className="text-[#E8C872]">.</span> Theatre
          </div>
          <div>
            <h1 className="serif text-5xl font-black leading-[1.05]">
              Where every<br />voice finds its<br />
              <em className="text-[#E8C872] not-italic">stage</em>.
            </h1>
            <p className="mt-6 text-[#DCDCE4] max-w-sm">
              Your monologues, your progress, your moments — all in one place.
            </p>
          </div>
          <blockquote className="border-l-2 border-[#E8C872] pl-4 text-sm text-[#C9C9D1] italic max-w-md">
            &ldquo;All the world&rsquo;s a stage, and all the men and women merely players.&rdquo;
            <div className="mt-2 not-italic text-xs tracking-widest text-[#8A8A96]">— WILLIAM SHAKESPEARE</div>
          </blockquote>
        </div>
      </aside>

      <section className="flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
