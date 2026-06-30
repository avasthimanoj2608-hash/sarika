/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile } from "../types";
import { X, Lock, Mail, User, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (isSignUp && !fullName) {
      setError("Please provide your name.");
      return;
    }

    // Simulate database credentials verification
    const profile: UserProfile = {
      isLoggedIn: true,
      email,
      name: isSignUp ? fullName : email.split("@")[0],
    };

    onLoginSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal">
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-3">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-stone-800 dark:text-stone-100">
            {isSignUp ? "Create Sarika Studio Account" : "Sign In to Sarika"}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {isSignUp ? "Register to save favorited layouts" : "Log in to synchronise designer assets"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Aria Dev"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                placeholder="aria@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-red-500 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {isSignUp ? "Register Account" : "Access Studio Workspace"}
          </button>
        </form>

        <div className="border-t border-stone-100 dark:border-stone-800/60 pt-4 mt-5 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[11px] text-amber-600 dark:text-amber-500 hover:underline font-semibold"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Register Free"}
          </button>
        </div>
      </div>
    </div>
  );
}
