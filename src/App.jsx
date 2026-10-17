import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
          Vendix Admin
        </h1>
        <p className="text-slate-400 text-base">
          React + TypeScript configuré avec Tailwind CSS <span className="font-semibold text-teal-400">v3</span>
        </p>
        <div>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="px-6 py-2.5 rounded-lg font-medium bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 transition duration-150 shadow-lg shadow-teal-500/20"
          >
            Compteur : {count}
          </button>
        </div>
      </div>
    </div>
  )
}
