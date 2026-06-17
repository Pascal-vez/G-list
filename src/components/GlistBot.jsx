import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Bot, X, Send, Sparkles, ExternalLink, Shield, Zap } from 'lucide-react';
import { askGlistBot, getBotWelcomeMessage, BOT_QUICK_PROMPTS } from '../utils/glistBotEngine';
import { askAdminGlistBot, getAdminBotWelcomeMessage, ADMIN_BOT_QUICK_PROMPTS } from '../utils/glistAdminBotEngine';
import styles from './GlistBot.module.css';

function BotLink({ link, onNavigate, onAdminTab }) {
  if (link.adminTab && onAdminTab) {
    return (
      <button
        type="button"
        className={styles.linkChip}
        onClick={() => {
          onAdminTab(link.adminTab);
          onNavigate?.();
        }}
      >
        {link.label}
        <Zap size={12} aria-hidden="true" />
      </button>
    );
  }

  if (link.path) {
    if (link.external) {
      return (
        <a href={link.path} target="_blank" rel="noopener noreferrer" className={styles.linkChip}>
          {link.label}
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      );
    }
    return (
      <Link to={link.path} className={styles.linkChip} onClick={() => onNavigate?.()}>
        {link.label}
        <ExternalLink size={12} aria-hidden="true" />
      </Link>
    );
  }

  return null;
}

function BotMessage({ message, onNavigate, onAdminTab }) {
  const isBot = message.role === 'bot';

  return (
    <div className={`${styles.message} ${isBot ? styles.messageBot : styles.messageUser}`}>
      {isBot && (
        <div className={styles.messageAvatar} aria-hidden="true">
          <Bot size={16} />
        </div>
      )}
      <div className={styles.messageBubble}>
        <p>{message.text}</p>
        {message.links?.length > 0 && (
          <div className={styles.messageLinks}>
            {message.links.map((link) => (
              <BotLink
                key={`${link.adminTab || link.path}-${link.label}`}
                link={link}
                onNavigate={onNavigate}
                onAdminTab={onAdminTab}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BotPanel({
  isAdmin, open, onClose, messages, typing, suggestions, bodyRef, inputRef,
  input, setInput, handleSubmit, sendQuery, onAdminTab,
}) {
  if (!open) return null;

  return (
    <div
      className={`${styles.panel} ${isAdmin ? styles.panelAdminDock : ''}`}
      role="dialog"
      aria-label={isAdmin ? 'Assistant G-List Admin' : 'Assistant G-List'}
    >
      <header className={`${styles.header} ${isAdmin ? styles.headerAdmin : ''}`}>
        <div className={styles.headerBrand}>
          <span className={styles.headerIcon} aria-hidden="true">
            {isAdmin ? <Shield size={20} /> : <Bot size={20} />}
          </span>
          <div>
            <strong>{isAdmin ? 'G-Bot Admin' : 'G-Bot'}</strong>
            <span>
              {isAdmin ? 'Copilote · Données live · 15 onglets' : 'Assistant G-List · Guinée'}
            </span>
          </div>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fermer l'assistant">
          <X size={18} />
        </button>
      </header>

      {isAdmin && (
        <div className={styles.adminBadge}>
          <Zap size={12} aria-hidden="true" />
          Posez une question ou cliquez un raccourci — navigation instantanée vers les onglets admin
        </div>
      )}

      <div className={styles.body} ref={bodyRef}>
        {messages.map((msg) => (
          <BotMessage
            key={msg.id}
            message={msg}
            onNavigate={onClose}
            onAdminTab={onAdminTab}
          />
        ))}
        {typing && (
          <div className={`${styles.message} ${styles.messageBot}`}>
            <div className={styles.messageAvatar} aria-hidden="true">
              <Bot size={16} />
            </div>
            <div className={`${styles.messageBubble} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && !typing && (
        <div className={styles.suggestions}>
          {suggestions.slice(0, isAdmin ? 5 : 4).map((s) => (
            <button key={s} type="button" onClick={() => sendQuery(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isAdmin
              ? 'Stats live, MRR, ouvrir modération, doublons…'
              : 'Ex. plombier à Conakry, tarifs Premium…'
          }
          aria-label="Votre question"
          autoComplete="off"
        />
        <button type="submit" disabled={!input.trim() || typing} aria-label="Envoyer">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default function GlistBot({
  mode = 'public',
  onAdminTab,
  adminContext,
  open: controlledOpen,
  onOpenChange,
  hideFab = false,
}) {
  const isAdmin = mode === 'admin';
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = useCallback((value) => {
    const next = typeof value === 'function' ? value(open) : value;
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  }, [onOpenChange, open]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(
    (isAdmin ? ADMIN_BOT_QUICK_PROMPTS : BOT_QUICK_PROMPTS).map((p) => p.query),
  );
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const ctx = useMemo(() => adminContext || {}, [adminContext]);

  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const welcome = isAdmin ? getAdminBotWelcomeMessage(ctx) : getBotWelcomeMessage();
      setMessages([{ id: 'welcome', role: 'bot', ...welcome }]);
      setSuggestions(welcome.suggestions || []);
    }
  }, [open, messages.length, isAdmin, ctx]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (!isAdmin || !open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdmin, open]);

  const closePanel = () => setOpen(false);

  const sendQuery = (query) => {
    const trimmed = query?.trim();
    if (!trimmed || typing) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    setSuggestions([]);

    window.setTimeout(() => {
      const reply = isAdmin
        ? askAdminGlistBot(trimmed, ctx)
        : askGlistBot(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: reply.text.replace(/\*\*(.+?)\*\*/g, '$1'),
          links: reply.links,
        },
      ]);
      const fallbackSuggestions = (isAdmin ? ADMIN_BOT_QUICK_PROMPTS : BOT_QUICK_PROMPTS)
        .slice(0, 4)
        .map((p) => p.query);
      setSuggestions(reply.suggestions || fallbackSuggestions);
      setTyping(false);
    }, isAdmin ? 200 + Math.min(trimmed.length * 5, 300) : 350 + Math.min(trimmed.length * 8, 400));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  const panelProps = {
    isAdmin,
    open,
    onClose: closePanel,
    messages,
    typing,
    suggestions,
    bodyRef,
    inputRef,
    input,
    setInput,
    handleSubmit,
    sendQuery,
    onAdminTab,
  };

  if (isAdmin) {
    return createPortal(
      <>
        {open && (
          <button
            type="button"
            className={styles.adminBackdrop}
            onClick={closePanel}
            aria-label="Fermer le copilote"
          />
        )}
        <BotPanel {...panelProps} />
        {!hideFab && (
          <button
            type="button"
            className={`${styles.fabAdminFixed} ${open ? styles.fabOpen : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Fermer G-Bot Admin' : 'Ouvrir G-Bot Admin'}
          >
            {open ? <X size={22} /> : <Shield size={22} />}
          </button>
        )}
      </>,
      document.body,
    );
  }

  return (
    <div className={styles.container}>
      <BotPanel {...panelProps} />
      {!hideFab && (
        <button
          type="button"
          className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Fermer G-Bot' : 'Ouvrir l\'assistant G-List'}
        >
          {open ? <X size={22} /> : <Sparkles size={22} />}
        </button>
      )}
    </div>
  );
}

/** Bouton compact pour la barre admin */
export function GlistBotAdminTrigger({ onClick, active }) {
  return (
    <button
      type="button"
      className={`${styles.adminTopBtn} ${active ? styles.adminTopBtnActive : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <Shield size={16} aria-hidden="true" />
      G-Bot Admin
    </button>
  );
}
