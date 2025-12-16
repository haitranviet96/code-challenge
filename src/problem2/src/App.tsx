import { SwapForm } from "./components/SwapForm";

function App() {
  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <div className="w-full max-w-2xl space-y-3 text-center">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Simple Swap
          </h1>
          <p className="text-base text-white/70">
            A minimal demo for swapping between two assets.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <SwapForm />
        </div>
      </div>
    </div>
  );
}

export default App;
