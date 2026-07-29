import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

import greenSpiky from '../assets/metups-characters/Green spiky.png';
import blob from '../assets/metups-characters/blob.png';
import flow from '../assets/metups-characters/flow.png';
import ghoast from '../assets/metups-characters/ghoast.png';
import hot from '../assets/metups-characters/hot.png';
import pokoe from '../assets/metups-characters/pokoe.png';
import purppler from '../assets/metups-characters/purppler.png';
import sloopy from '../assets/metups-characters/sloopy.png';
import star from '../assets/metups-characters/star.png';

const CHARACTERS = [
  { id: 'green-spiky', name: 'Spiky', img: greenSpiky },
  { id: 'blob', name: 'Blob', img: blob },
  { id: 'flow', name: 'Flow', img: flow },
  { id: 'ghoast', name: 'Lurker', img: ghoast },
  { id: 'hot', name: 'Burner', img: hot },
  { id: 'pokoe', name: 'Poko', img: pokoe },
  { id: 'purppler', name: 'Purppler', img: purppler },
  { id: 'sloopy', name: 'Sloopy', img: sloopy },
  { id: 'star', name: 'Star', img: star }
];

export default function AuthPage({ onBackToEvents, onNavigateHome }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [charIndex, setCharIndex] = useState(8); // 'star' is index 8

  const handlePrevChar = () => {
    setCharIndex((prev) => (prev === 0 ? CHARACTERS.length - 1 : prev - 1));
  };
  const handleNextChar = () => {
    setCharIndex((prev) => (prev === CHARACTERS.length - 1 ? 0 : prev + 1));
  };
  
  // UI states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState(null);

  const handleToggleMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setAuthSuccess(false);
    setSuccessUser(null);
    if (newMode === 'login') {
      setEmail('');
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errors.non_field_errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.non_field_errors;
        return next;
      });
    }

    if (field === 'username') setUsername(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setAuthSuccess(false);

    // Client-side validation
    const clientErrors = {};
    if (!username.trim()) {
      clientErrors.username = 'Username is required';
    }
    if (mode === 'register' && !email.trim()) {
      clientErrors.email = 'Email is required';
    } else if (mode === 'register' && !/\S+@\S+\.\S+/.test(email)) {
      clientErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      clientErrors.password = 'Password is required';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await login(username, password);
        setSuccessUser(username);
      } else {
        await register(username, email, password, CHARACTERS[charIndex].id);
        setSuccessUser(username);
      }
      setAuthSuccess(true);
      setTimeout(() => {
        if (onBackToEvents) onBackToEvents();
      }, 1000);
    } catch (apiErrors) {
      if (typeof apiErrors === 'object') {
        setErrors(apiErrors);
      } else {
        setErrors({ non_field_errors: 'Authentication failed. Please verify your credentials.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-paper)]">
      {/* 
        Borderless, boxless full-screen layout. 
        The form container blends completely into the page background.
      */}
      <div className="w-full max-w-[400px] flex flex-col py-8 box-border">
        <div className="flex justify-between items-center mb-8">
          {onBackToEvents && (
            <button
              type="button"
              onClick={onBackToEvents}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors duration-150 flex items-center gap-1.5 cursor-pointer font-sans select-none"
            >
              ← Back to events
            </button>
          )}
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors duration-150 flex items-center gap-1.5 cursor-pointer font-sans select-none"
            >
              Home ↗
            </button>
          )}
        </div>
        
        {/* Logo and Intro */}
        <div className="mb-10 text-center select-none">
          <h1 className="font-display text-5xl text-[var(--color-ink)] font-semibold tracking-tight m-0">
            MetUps
          </h1>
          <p className="font-sans text-sm text-[var(--color-ink-muted)] mt-2.5 leading-relaxed">
            Connect and discover local meetups
          </p>
        </div>

        {/* Tab toggles */}
        <div className="flex border-b border-[var(--color-hairline)] mb-8 select-none">
          <button
            type="button"
            onClick={() => handleToggleMode('login')}
            className={`flex-1 pb-3 text-center font-sans font-medium text-sm transition-all duration-200 cursor-pointer ${
              mode === 'login'
                ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-presence)] font-semibold'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('register')}
            className={`flex-1 pb-3 text-center font-sans font-medium text-sm transition-all duration-200 cursor-pointer ${
              mode === 'register'
                ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-presence)] font-semibold'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {authSuccess && (
            <div className="mb-5 p-3.5 bg-[var(--color-presence)]/10 border border-[var(--color-presence)]/30 text-[var(--color-presence)] font-sans text-sm rounded-[4px] text-center select-none">
              Success! Authenticated as <strong className="font-semibold">{successUser}</strong>.
            </div>
          )}

          {errors.non_field_errors && (
            <div className="mb-5 p-3.5 bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] font-sans text-sm rounded-[4px] text-center">
              {errors.non_field_errors}
            </div>
          )}

          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-xs font-mono text-[var(--color-ink-muted)] uppercase tracking-wider mb-2.5 select-none">
                Select Your Persona
              </label>
              
              {/* Modern Editorial Character Swipe/Slider */}
              <div className="border-2 border-[var(--color-ink)] bg-[var(--color-paper-alt)] p-4 flex flex-col items-center relative overflow-hidden select-none">
                
                {/* Slider Controls */}
                <div className="flex justify-between items-center w-full mb-3 z-10">
                  <button
                    type="button"
                    onClick={handlePrevChar}
                    disabled={isLoading || authSuccess}
                    className="w-8 h-8 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] flex items-center justify-center font-mono font-bold hover:bg-[var(--color-signal-dim)] transition-all cursor-pointer select-none active:translate-y-[1px]"
                  >
                    ←
                  </button>
                  
                  <span className="font-mono text-2xs uppercase tracking-widest text-[var(--color-ink-muted)]">
                    [ {String(charIndex + 1).padStart(2, '0')} / 09 ]
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleNextChar}
                    disabled={isLoading || authSuccess}
                    className="w-8 h-8 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] flex items-center justify-center font-mono font-bold hover:bg-[var(--color-signal-dim)] transition-all cursor-pointer select-none active:translate-y-[1px]"
                  >
                    →
                  </button>
                </div>
                
                {/* Carousel Active Content Card */}
                <div 
                  key={charIndex} 
                  className="flex flex-col items-center text-center animate-charSlide py-4"
                >
                  <div className="w-24 h-24 flex items-center justify-center p-2 bg-[var(--color-paper)] border-2 border-[var(--color-ink)] rotate-[-1deg] mb-3 filter drop-shadow-[2px_2px_0px_var(--color-ink)]">
                    <img 
                      src={CHARACTERS[charIndex].img} 
                      alt={CHARACTERS[charIndex].name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h4 className="font-display text-xl font-bold tracking-tight">{CHARACTERS[charIndex].name}</h4>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-ink-muted)] mt-0.5">
                    {CHARACTERS[charIndex].name === 'Star' ? 'The Chief Host' : CHARACTERS[charIndex].name === 'Spiky' ? 'The Tech Debater' : CHARACTERS[charIndex].name === 'Blob' ? 'The Quiet Committer' : CHARACTERS[charIndex].name === 'Flow' ? 'The Cardio Runner' : CHARACTERS[charIndex].name === 'Lurker' ? 'The Silent Observer' : CHARACTERS[charIndex].name === 'Burner' ? 'The Idea Catalyst' : CHARACTERS[charIndex].name === 'Poko' ? 'The UI Connoisseur' : CHARACTERS[charIndex].name === 'Purppler' ? 'The Social Bridge' : 'The Gourmet Coder'}
                  </span>
                </div>
                
              </div>
            </div>
          )}

          <Input
            label="Username"
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={errors.username}
            placeholder="johndoe"
            disabled={isLoading || authSuccess}
            autoComplete="username"
          />

          {mode === 'register' && (
            <Input
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="john@example.com"
              disabled={isLoading || authSuccess}
              autoComplete="email"
            />
          )}

          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            disabled={isLoading || authSuccess}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          <div className="mt-8">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={authSuccess}
            >
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </div>
        </form>

        <div className="border-t border-[var(--color-hairline)] mt-12 pt-5 flex justify-between items-center select-none">
          <span className="font-sans text-[11px] text-[var(--color-ink-muted)]">
            © 2026 MetUps. All rights reserved.
          </span>
          <span className="font-sans text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors duration-150">
            Terms & Privacy
          </span>
        </div>

      </div>
    </div>
  );
}
