import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('G-List ErrorBoundary:', error, info);
    this.setState({ error: error?.message || String(error) });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.page}>
          <h1>Une erreur est survenue</h1>
          <p>Le chargement de cette page a échoué. Veuillez réessayer ou revenir à l&apos;accueil.</p>
          {this.state.error && (
            <pre style={{ fontSize: '11px', color: '#888', whiteSpace: 'pre-wrap', maxWidth: '600px', margin: '8px auto', textAlign: 'left' }}>
              {this.state.error}
            </pre>
          )}
          <div className={styles.actions}>
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Recharger
            </button>
            <a href="/" className={styles.link}>Retour à l&apos;accueil</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
