/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, DesignReport } from "./types";
import AIRoomDesigner from "./components/AIRoomDesigner";
import VastuConsultant from "./components/VastuConsultant";
import StyleBoard from "./components/StyleBoard";
import ColorStudio from "./components/ColorStudio";
import BudgetPlanner from "./components/BudgetPlanner";
import AIChatAssistant from "./components/AIChatAssistant";
import SavedDesigns from "./components/SavedDesigns";
import AuthModal from "./components/AuthModal";
import { Sparkles, Compass, Sofa, Palette, DollarSign, MessageSquare, Heart, ShieldCheck, Sun, Moon, LogOut, User, Menu, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"designer" | "styles" | "colors" | "vastu" | "budget" | "chat" | "saved">("designer");
  const [darkMode, setDarkMode] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isLoggedIn: false,
    email: "",
    name: ""
  });

  // Saved Favorites lists
  const [favorites, setFavorites] = useState<DesignReport[]>([]);

  // Load state from local storage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("sarika_user");
    if (cachedUser) {
      try {
        setUserProfile(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const cachedFavs = localStorage.getItem("sarika_favorites");
    if (cachedFavs) {
      try {
        setFavorites(JSON.parse(cachedFavs));
      } catch (e) {
        console.error(e);
      }
    }

    // Default theme check
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  // Update theme setting on change
  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Auth logins
  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("sarika_user", JSON.stringify(profile));
  };

  const handleLogout = () => {
    const reset = { isLoggedIn: false, email: "", name: "" };
    setUserProfile(reset);
    localStorage.removeItem("sarika_user");
  };

  // Favorites handlers
  const handleSaveFavorite = (report: DesignReport) => {
    if (favorites.some((f) => f.id === report.id)) return;
    const updated = [report, ...favorites];
    setFavorites(updated);
    localStorage.setItem("sarika_favorites", JSON.stringify(updated));
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("sarika_favorites", JSON.stringify(updated));
  };

  const handleSelectFavorite = (report: DesignReport) => {
    // Injecting into active workspace is handled by resetting the layout parameters
    setActiveTab("designer");
  };

  const navItems = [
    { id: "designer" as const, label: "AI Room Designer", icon: Sofa },
    { id: "vastu" as const, label: "Vastu Consult", icon: Compass },
    { id: "styles" as const, label: "Style Catalog", icon: Sparkles },
    { id: "colors" as const, label: "Color Studio", icon: Palette },
    { id: "budget" as const, label: "Project Estimator", icon: DollarSign },
    { id: "chat" as const, label: "Elite AI Chat", icon: MessageSquare },
    { id: "saved" as const, label: "Saved Layouts", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#FAF9F6] flex flex-col font-sans transition-colors duration-200" id="sarika-app">
      {/* Upper Navigation Header */}
      <header className="h-20 md:h-24 border-b border-black/10 dark:border-white/10 px-6 md:px-10 flex items-center justify-between bg-white dark:bg-stone-900 sticky top-0 z-40">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5E1DA] dark:bg-[#2C2C2B] border border-black/5 flex items-center justify-center font-serif italic text-base text-[#1A1A1A] dark:text-[#FAF9F6]">
                S
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-serif tracking-widest uppercase italic text-[#1A1A1A] dark:text-white leading-none">
                  Sarika
                </h1>
                <span className="text-[8px] uppercase tracking-[0.3em] opacity-50 mt-1">
                  AI Interior Studio
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 md:gap-8 text-[11px] uppercase tracking-[0.2em] font-medium">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`hover:opacity-100 transition-opacity cursor-pointer pb-1 ${
                      isActive
                        ? "border-b border-black dark:border-white text-[#1A1A1A] dark:text-white opacity-100 font-bold"
                        : "text-[#1A1A1A]/60 dark:text-[#FAF9F6]/60 border-b border-transparent hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    {item.label}
                    {item.id === "saved" && favorites.length > 0 && (
                      <span className="ml-1 bg-black dark:bg-white text-white dark:text-black text-[8px] font-bold px-1 py-0.2 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings / User actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:opacity-80 text-[#1A1A1A] dark:text-[#FAF9F6] cursor-pointer transition-opacity"
              title="Toggle color theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {userProfile.isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#FAF9F6]">{userProfile.name}</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-50">Premium Member</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 border border-black/10 dark:border-white/10 hover:bg-red-500 hover:text-white transition-colors cursor-pointer text-red-500"
                  title="Logout Workspace"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-[11px] uppercase tracking-widest border border-black/20 dark:border-white/20 px-5 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none font-bold bg-transparent cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 border border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#FAF9F6] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-stone-900 border-b border-black/10 dark:border-white/10 p-4 space-y-1.5 z-35 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-none text-[11px] uppercase tracking-[0.2em] font-medium transition-all ${
                  isActive 
                    ? "bg-black text-white dark:bg-white dark:text-black" 
                    : "text-[#1A1A1A]/70 dark:text-[#FAF9F6]/70 border border-black/5 hover:bg-black/5"
                }`}
              >
                <span>{item.label}</span>
                {item.id === "saved" && favorites.length > 0 && (
                  <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 overflow-hidden">
        {activeTab === "designer" && (
          <AIRoomDesigner
            onSaveToFavorites={handleSaveFavorite}
            favoritedIds={favorites.map((f) => f.id)}
            userProfile={userProfile}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}
        {activeTab === "vastu" && <VastuConsultant />}
        {activeTab === "styles" && <StyleBoard />}
        {activeTab === "colors" && <ColorStudio />}
        {activeTab === "budget" && <BudgetPlanner />}
        {activeTab === "chat" && <AIChatAssistant />}
        {activeTab === "saved" && (
          <SavedDesigns
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
            onSelectFavorite={handleSelectFavorite}
          />
        )}
      </main>

      {/* Persistent subtle footer */}
      <footer className="h-16 bg-black text-white px-6 md:px-10 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-medium opacity-90 border-t border-white/5">
        <span>Sarika Powered Design Engine &copy; 2026</span>
        <div className="flex gap-6">
          <span className="hidden sm:inline">Terms of Curation</span>
          <span className="hidden sm:inline">Privacy</span>
          <span>Studio Membership</span>
        </div>
      </footer>

      {/* Auth System popup */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
