'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import styles from './page.module.css'

type StatsResponse = {
  total: number
  max: number
  restants: number
  ouvert: boolean
}

const initialForm = {
  prenom: '',
  nom: '',
  whatsapp: '',
}

export default function HomePage() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadStats = async () => {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' })
        const data: StatsResponse = await res.json()
        if (active) setStats(data)
      } catch {
        if (active) {
          setStats({
            total: 0,
            max: 200,
            restants: 200,
            ouvert: false,
          })
        }
      } finally {
        if (active) setStatsLoading(false)
      }
    }

    loadStats()
    return () => {
      active = false
    }
  }, [])

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Inscription impossible pour le moment.')
        return
      }

      toast.success(data.message || 'Inscription enregistree.')
      const prenom = form.prenom.trim()
      const nom = form.nom.trim()
      setForm(initialForm)
      router.push(`/confirmation?prenom=${encodeURIComponent(prenom)}&nom=${encodeURIComponent(nom)}`)
    } catch {
      toast.error('Erreur reseau. Reessayez dans quelques instants.')
    } finally {
      setSubmitting(false)
    }
  }

  const closed = statsLoading ? false : !stats?.ouvert

  return (
    <main className={styles.pageWrapper}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Nowrinkles Love</p>
        <h1 className={styles.title}>La Grande Projection</h1>
        <p className={styles.copy}>
          Inscrivez-vous à l&apos;événement et réservez votre place avant la clôture des inscriptions.
        </p>

        <div className={styles.metrics}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Places restantes</span>
            <strong className={styles.metricValue}>{statsLoading ? '...' : stats?.restants ?? 0}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Capacité</span>
            <strong className={styles.metricValue}>
              {statsLoading ? '...' : `${stats?.total ?? 0}/${stats?.max ?? 200}`}
            </strong>
          </div>
        </div>

        <p className={styles.deadline}>Fin des inscriptions : 31 Mai 2026</p>
      </section>

      <section className={styles.formShell}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <p className={styles.formKicker}>Formulaire d&apos;inscription</p>
            <h2 className={styles.formTitle}>Réservez votre accès</h2>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <label className={styles.fieldLabel} htmlFor="prenom">
              Prénom
            </label>
            <div className={styles.fieldWrap}>
              <input
                id="prenom"
                type="text"
                name="prenom"
                placeholder="Votre prénom"
                className="input-field"
                value={form.prenom}
                onChange={(event) => updateField('prenom', event.target.value)}
                disabled={submitting || closed}
                required
              />
              <i className="bx bxs-user-detail" />
            </div>

            <label className={styles.fieldLabel} htmlFor="nom">
              Nom
            </label>
            <div className={styles.fieldWrap}>
              <input
                id="nom"
                type="text"
                name="nom"
                placeholder="Votre nom"
                className="input-field"
                value={form.nom}
                onChange={(event) => updateField('nom', event.target.value)}
                disabled={submitting || closed}
                required
              />
              <i className="bx bxs-user" />
            </div>

            <label className={styles.fieldLabel} htmlFor="whatsapp">
              Numéro WhatsApp
            </label>
            <div className={styles.fieldWrap}>
              <input
                id="whatsapp"
                type="tel"
                name="whatsapp"
                placeholder="+229 00 00 00 00"
                className="input-field"
                value={form.whatsapp}
                onChange={(event) => updateField('whatsapp', event.target.value)}
                disabled={submitting || closed}
                required
              />
              <i className="bx bxl-whatsapp" />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting || closed}>
              {closed ? (
                <span>Inscriptions closes</span>
              ) : submitting ? (
                <>
                  <span className={styles.spinner} />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>S&apos;inscrire</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <p className={styles.formNote}>
            Les informations saisies sont envoyées à l&apos;API d&apos;inscription et stockées en base de données.
          </p>
        </div>
      </section>
    </main>
  )
}


