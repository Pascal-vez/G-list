import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Phone, CreditCard, RefreshCw, Save, Clock } from 'lucide-react';
import {
  fetchPendingDemandes,
  activerDemande,
  refuserDemande,
  desactiverAbonnement,
  fetchConfigPaiement,
  updateConfigPaiement,
  triggerSubscriptionCron,
} from '../api/abonnement';
import { getAllProAccountsList } from '../utils/storage';
import { planLabel, isAbonnementActif } from '../utils/plans';
import styles from './AdminDashboardExtras.module.css';

function formatGNF(n) {
  return new Intl.NumberFormat('fr-GN').format(n);
}

function useToast() {
  const [message, setMessage] = useState('');
  const show = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2800);
  };
  const Toast = message ? (
    <div className={styles.toast} role="status">{message}</div>
  ) : null;
  return { show, Toast };
}

export default function AdminAbonnements() {
  const { show, Toast } = useToast();
  const [demandes, setDemandes] = useState([]);
  const [config, setConfig] = useState(null);
  const [refuseId, setRefuseId] = useState(null);
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [configForm, setConfigForm] = useState({ numero_depot: '', nom_titulaire: '', operateur: '', email_admin: '' });

  const refresh = useCallback(async () => {
    const [pending, cfg] = await Promise.all([
      fetchPendingDemandes(),
      fetchConfigPaiement(),
    ]);
    setDemandes(pending);
    setConfig(cfg);
    setConfigForm({
      numero_depot: cfg?.numero_depot || '+224626419331',
      nom_titulaire: cfg?.nom_titulaire || '',
      operateur: cfg?.operateur || 'Orange Money',
      email_admin: cfg?.email_admin || '',
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleActiver = async (id) => {
    setLoading(true);
    const result = await activerDemande(id);
    setLoading(false);
    if (result.ok) {
      show('Abonnement activé');
      refresh();
    } else {
      show(result.error || 'Erreur activation');
    }
  };

  const handleRefuser = async () => {
    if (!refuseId) return;
    setLoading(true);
    const result = await refuserDemande(refuseId, motif);
    setLoading(false);
    if (result.ok) {
      show('Demande refusée');
      setRefuseId(null);
      setMotif('');
      refresh();
    }
  };

  const handleDesactiver = async (proId, nom) => {
    if (!window.confirm(`Désactiver l'abonnement de ${nom} ? Il repassera en plan gratuit.`)) return;
    const result = await desactiverAbonnement(proId);
    if (result.ok) {
      show('Abonnement désactivé');
      refresh();
    }
  };

  const handleSaveConfig = async () => {
    await updateConfigPaiement(configForm);
    show('Configuration enregistrée');
    refresh();
  };

  const handleCron = async () => {
    const result = await triggerSubscriptionCron();
    show(`Cron exécuté — alertes: ${result?.alertes_j10 ?? 0}, expirations: ${result?.expirations ?? 0}`);
    refresh();
  };

  const actifs = getAllProAccountsList().filter((p) => isAbonnementActif(p));

  return (
    <div className={styles.section}>
      {Toast}

      <AdminCard title="Numéro de dépôt Orange Money" subtitle="Affiché aux professionnels lors du paiement">
        <div className={styles.planAdminGrid}>
          <label className={styles.planAdminField}>
            Numéro de dépôt
            <input
              value={configForm.numero_depot}
              onChange={(e) => setConfigForm({ ...configForm, numero_depot: e.target.value })}
            />
          </label>
          <label className={styles.planAdminField}>
            Nom du titulaire
            <input
              value={configForm.nom_titulaire}
              onChange={(e) => setConfigForm({ ...configForm, nom_titulaire: e.target.value })}
            />
          </label>
          <label className={styles.planAdminField}>
            Opérateur
            <input
              value={configForm.operateur}
              onChange={(e) => setConfigForm({ ...configForm, operateur: e.target.value })}
            />
          </label>
          <label className={styles.planAdminField}>
            Email admin (notifications)
            <input
              type="email"
              value={configForm.email_admin}
              onChange={(e) => setConfigForm({ ...configForm, email_admin: e.target.value })}
              placeholder="contactglist224@gmail.com"
            />
          </label>
        </div>
        <button type="button" className={styles.planAdminSave} onClick={handleSaveConfig}>
          <Save size={16} /> Enregistrer la config
        </button>
      </AdminCard>

      <AdminCard title={`Demandes en attente (${demandes.length})`} subtitle="Validez ou refusez après vérification du dépôt">
        {demandes.length === 0 ? (
          <p className={styles.empty}>Aucune demande en attente.</p>
        ) : (
          <div className={styles.oppList}>
            {demandes.map((d) => (
              <article key={d.id} className={styles.oppCard}>
                <div className={styles.oppCardHead}>
                  <div>
                    <strong>{d.pro_nom || 'Professionnel'}</strong>
                    <span>{d.pro_email}</span>
                  </div>
                  <span className={styles.priorityBadge}>En attente</span>
                </div>
                <div className={styles.oppMetrics}>
                  <span>Plan : {planLabel(d.plan_demande)}</span>
                  <span>{formatGNF(d.montant)} GNF</span>
                  <span><Phone size={12} aria-hidden /> {d.numero_emetteur}</span>
                  {d.heure_transaction && (
                    <span><Clock size={12} aria-hidden /> {new Date(d.heure_transaction).toLocaleString('fr-FR')}</span>
                  )}
                  {d.id_transaction && <span><CreditCard size={12} aria-hidden /> {d.id_transaction}</span>}
                </div>
                <small style={{ color: '#999' }}>
                  Demandé le {new Date(d.created_at).toLocaleString('fr-FR')}
                </small>
                <div className={styles.modActions} style={{ flexDirection: 'row', marginTop: 12 }}>
                  <button type="button" disabled={loading} onClick={() => handleActiver(d.id)}>
                    <CheckCircle size={14} /> Activer
                  </button>
                  <button type="button" className={styles.btnMuted} disabled={loading} onClick={() => setRefuseId(d.id)}>
                    <XCircle size={14} /> Refuser
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminCard>

      {refuseId && (
        <AdminCard title="Motif de refus" subtitle="Sera communiqué au professionnel">
          <textarea
            rows={3}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex. : montant incorrect, numéro émetteur non reconnu…"
            className={styles.planAdminField}
          />
          <div className={styles.modActions} style={{ flexDirection: 'row' }}>
            <button type="button" onClick={handleRefuser} disabled={loading}>Confirmer le refus</button>
            <button type="button" className={styles.btnMuted} onClick={() => { setRefuseId(null); setMotif(''); }}>Annuler</button>
          </div>
        </AdminCard>
      )}

      <AdminCard title={`Abonnements actifs (${actifs.length})`} subtitle="Désactivation manuelle possible à tout moment">
        {actifs.length === 0 ? (
          <p className={styles.empty}>Aucun abonnement actif.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Pro</th><th>Plan</th><th>Expire</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {actifs.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nom}</td>
                    <td>{planLabel(p.planAbonnement || p.plan)}</td>
                    <td>{p.planFin || p.premiumExpires ? new Date(p.planFin || p.premiumExpires).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                      <button type="button" className={styles.btnSecondary} onClick={() => handleDesactiver(p.id, p.nom)}>
                        Désactiver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <div className={styles.footerActions}>
        <button type="button" className={styles.exportBtn} onClick={handleCron}>
          <RefreshCw size={16} /> Exécuter vérification expirations
        </button>
      </div>
    </div>
  );
}

function AdminCard({ title, subtitle, children }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          {title && <h3>{title}</h3>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}
