
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

import adminService from '../api/adminService'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from

  const redirectTo = from
    ? `${from.pathname}${from.search || ''}${from.hash || ''}`
    : '/'

  const [credentials, setCredentials] = useState({
    phone: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!credentials.phone.trim() || !credentials.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    setLoading(true)

    try {
      const data = await adminService.login({
        phone: credentials.phone.trim(),
        password: credentials.password,
      })

      // Vérification du rôle retourné
      // Vérification du rôle retourné
      const user = data.user || data.admin

      if (user?.role && user.role === 'ADMIN') {
        adminService.logout()
        setError("Vous n'avez pas les droits d'accès à cette console.")
        return
      }

    navigate(redirectTo, { replace: true })

    } catch (err) {
      setError(err.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Décoration d'arrière-plan */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-teal-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <ShieldCheck size={34} className="text-teal-400" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Vendix <span className="text-teal-400">Admin</span>
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Console de supervision et d'administration
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 shadow-2xl">

          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">
              Bienvenue
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Connectez-vous pour accéder à votre espace sécurisé.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Numéro de téléphone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Numéro de téléphone
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={credentials.phone}
                  onChange={handleChange}
                  placeholder="+22901XXXXXXXX"
                  autoComplete="tel"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Format international : +22901XXXXXXXX
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Mot de passe
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-slate-600 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition"
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl transition duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Connexion à la console d'administration
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-teal-500" />
              Accès réservé aux administrateurs autorisés
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-7">
          © {new Date().getFullYear()} Vendix. Tous droits réservés.
        </p>
      </div>
    </main>
  )
}
