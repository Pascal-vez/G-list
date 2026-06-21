import { useEffect, useState } from 'react';
import { Crown, Clock, AlertCircle, CheckCircle, ArrowUpCircle } from 'lucide-react';
import { fetchSubscriptionStatus } from '../../api/abonnement';
import {
  planLabel, joursRestants, toPlanDemande, getPlanSuperieur, fromPlanDemande,
} from '../../utils/plans';
import styles from './AbonnementStatus.module.css';

export default function AbonnementStatus({ account, onRenew, onUpgrade }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!account) return;
    fetchSubscriptionStatus(account).then(setStatus).catch(() => {
      setStatus({
        plan: toPlanDemande(account.plan || 'free'),
        plan_actif: account.planActif !== false,
        plan_debut: account.planDebut || account.premiumSince,
        plan_fin: account.planFin || account.premiumExpires,
        demandes_en_attente: 0,
      });
    });
  }, [account]);

  if (!status) return null;

  const planNom = planLabel(status.plan);
  const actif = status.plan_actif && status.plan !== 'gratuit';
  const jours = joursRestants(status.plan_fin);
  const planSup = getPlanSuperieur(status.plan);

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <Crown size={20} aria-hidden />
        <div>
          <strong>Votre abonnement</strong>
          <p>Gestion de votre plan G-List</p>
        </div>
        <span className={`${styles.badge} ${styles[`badge_${status.plan}`] || styles.badge_gratuit}`}>
          {planNom}
        </span>
      </header>

      {status.demandes_en_attente > 0 && (
        <div className={styles.pending}>
          <Clock size={16} aria-hidden />
          Votre demande d&apos;abonnement est en cours de traitement par notre équipe.
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.item}>
          <span>Statut</span>
          <strong>{actif ? 'Actif' : 'Gratuit'}</strong>
        </div>
        {status.plan_debut && actif && (
          <div className={styles.item}>
            <span>Actif depuis</span>
            <strong>{new Date(status.plan_debut).toLocaleDateString('fr-FR')}</strong>
          </div>
        )}
        {status.plan_fin && actif && (
          <>
            <div className={styles.item}>
              <span>Expire le</span>
              <strong>{new Date(status.plan_fin).toLocaleDateString('fr-FR')}</strong>
            </div>
            <div className={styles.item}>
              <span>Jours restants</span>
              <strong>{jours ?? '—'} jour{(jours ?? 0) > 1 ? 's' : ''}</strong>
            </div>
          </>
        )}
      </div>

      {jours !== null && jours <= 10 && jours > 0 && actif && (
        <div className={styles.alert}>
          <AlertCircle size={16} aria-hidden />
          <div>
            <strong>Votre plan expire dans {jours} jours</strong>
            <p>Renouvelez ou passez à un plan supérieur.</p>
            <div className={styles.alertActions}>
              <button type="button" onClick={() => onRenew?.(fromPlanDemande(status.plan))}>
                <CheckCircle size={14} aria-hidden /> Renouveler mon plan
              </button>
              {planSup && (
                <button type="button" onClick={() => onUpgrade?.(fromPlanDemande(planSup))}>
                  <ArrowUpCircle size={14} aria-hidden /> Passer au plan supérieur
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
