import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

// Conditionally import Three.js components only on web
let Canvas: any = null;
let ParticleBackground: any = null;
let AbstractNode: any = null;
if (Platform.OS === 'web') {
  try {
    Canvas = require('@react-three/fiber').Canvas;
    ParticleBackground = require('../components/ParticleBackground').default;
    AbstractNode = require('../components/AbstractNode').default;
  } catch (e) {
    // Three.js not available, will render without 3D
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

// ─── SECTION DATA ──────────────────────────────────────────────────────────────
const STREAMS = [
  {
    icon: '💓',
    title: 'rPPG Hemodynamics',
    subtitle: 'Cardiovascular State',
    description: 'Reads your heart rate and blood volume pulse through microscopic skin color changes invisible to the naked eye.',
    color: '#ef4444',
  },
  {
    icon: '🧠',
    title: 'FACS 3D Mesh',
    subtitle: 'Muscular State',
    description: 'Maps 468 facial landmarks to detect micro-expressions, jaw tension, and subconscious emotional leakage in real-time.',
    color: '#8b5cf6',
  },
  {
    icon: '👁️',
    title: 'Oculomotor Tracking',
    subtitle: 'Cognitive State',
    description: 'Measures gaze fixation, blink rate (EAR), and saccadic eye movements to quantify cognitive load and focus.',
    color: '#3b82f6',
  },
  {
    icon: '🌡️',
    title: 'Algorithmic Colorimetry',
    subtitle: 'Vascular State',
    description: 'Detects involuntary flush and blanching via LAB color space shifts — a thermal proxy for fight-or-flight responses.',
    color: '#f59e0b',
  },
  {
    icon: '🔬',
    title: 'Pupillometry',
    subtitle: 'Autonomic State',
    description: 'Tracks micro-fluctuations in pupil diameter to measure Central Nervous System arousal and autonomic response.',
    color: '#10b981',
  },
];

const SECURITY_FEATURES = [
  {
    icon: '🔒',
    title: 'Zero Data Retention',
    description: 'Your facial data is processed in real-time and never stored on any server. Once your scan is complete, all biometric data is permanently purged.',
  },
  {
    icon: '🛡️',
    title: 'On-Device Processing',
    description: 'All AI inference runs locally on your device\'s hardware. Your face never leaves your phone — no cloud uploads, no third-party access.',
  },
  {
    icon: '🔐',
    title: 'End-to-End Encryption',
    description: 'All communication between your device and our analysis engine is secured with military-grade TLS 1.3 encryption.',
  },
  {
    icon: '📋',
    title: 'HIPAA & GDPR Compliant',
    description: 'Built from the ground up to meet international healthcare privacy standards. Your biometric data is treated with clinical-grade security protocols.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [showDemo, setShowDemo] = useState(false);

  const scrollToSection = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <View style={styles.root}>
      {/* ══════════ HERO SECTION ══════════ */}
      <View style={styles.heroContainer}>
        {/* 3D Canvas Background (Web only) */}
        {Platform.OS === 'web' && Canvas && (
          <View style={styles.canvasWrapper}>
            <Canvas
              camera={{ position: [0, 0, 6], fov: 60 }}
              style={{ background: '#050510' }}
              gl={{ antialias: true, alpha: false }}
            >
              <color attach="background" args={['#050510']} />
              <fog attach="fog" args={['#050510', 5, 25]} />
              <ambientLight intensity={0.15} />
              <pointLight position={[5, 5, 5]} intensity={0.5} color="#7c3aed" />
              <pointLight position={[-5, -5, 5]} intensity={0.3} color="#3b82f6" />
              {ParticleBackground && <ParticleBackground />}
              {AbstractNode && <AbstractNode />}
            </Canvas>
          </View>
        )}

        {/* Fallback gradient for native */}
        {Platform.OS !== 'web' && <View style={styles.fallbackBg} />}

        {/* Hero Content Overlay */}
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            {/* Tagline */}
            <View style={styles.taglinePill}>
              <Text style={styles.taglineText}>{'< Welcome to the Future />'}</Text>
            </View>

            {/* Main Title */}
            <Text style={styles.heroTitle}>VISAGE AI</Text>
            <Text style={styles.heroSubtitle}>
              Next-Generation Contactless{'\n'}Biometric Intelligence
            </Text>

            {/* CTA Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/scan')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>⬡  SCAN FACE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={scrollToSection}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>EXPLORE VISAGE</Text>
              </TouchableOpacity>
            </View>

            {/* Attribution */}
            <Text style={styles.heroAttribution}>A PRODUCT BY ADITYA PANDEY</Text>
          </View>

          {/* Scroll indicator */}
          <View style={styles.scrollIndicator}>
            <Text style={styles.scrollText}>SCROLL TO EXPLORE</Text>
            <Text style={styles.scrollArrow}>↓</Text>
          </View>
        </View>
      </View>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <View style={styles.section}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>THE SCIENCE</Text>
          </View>
          <Text style={styles.sectionTitle}>5-Stream Bayesian{'\n'}Fusion Engine</Text>
          <Text style={styles.sectionSubtitle}>
            Visage AI simultaneously extracts and mathematically fuses five independent
            biometric streams using Bayes' Theorem to achieve certainty levels impossible
            with any single measurement.
          </Text>

          {/* Bayesian Formula */}
          <View style={styles.formulaCard}>
            <Text style={styles.formulaText}>
              P(State|Evidence) = [P(Evidence|State) × P(State)] / P(Evidence)
            </Text>
            <Text style={styles.formulaCaption}>
              Five independent signals → One absolute certainty score (0–100%)
            </Text>
          </View>

          {/* Stream Cards */}
          <View style={styles.streamGrid}>
            {STREAMS.map((stream, i) => (
              <View key={i} style={styles.streamCard}>
                <View style={[styles.streamIconWrap, { backgroundColor: stream.color + '18' }]}>
                  <Text style={styles.streamIcon}>{stream.icon}</Text>
                </View>
                <View style={styles.streamTextWrap}>
                  <Text style={styles.streamTitle}>{stream.title}</Text>
                  <Text style={[styles.streamSubtitle, { color: stream.color }]}>{stream.subtitle}</Text>
                  <Text style={styles.streamDesc}>{stream.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ══════════ HOW THE SCAN WORKS ══════════ */}
      <View style={[styles.section, { backgroundColor: '#08081a' }]}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>HOW IT WORKS</Text>
          </View>
          <Text style={styles.sectionTitle}>Three Simple Steps</Text>
          <Text style={styles.sectionSubtitle}>
            No wearables. No sensors. Just your camera.
          </Text>

          <View style={styles.stepsRow}>
            {[
              { num: '01', title: 'Enter Details', desc: 'Provide your name, age, and sex for calibration. Your data stays on-device.' },
              { num: '02', title: 'Face the Camera', desc: 'Our AI guides you into the optimal position. Hold still for 30 seconds.' },
              { num: '03', title: 'Get Your Report', desc: 'Receive a comprehensive clinical-grade biometric report with exportable PDF.' },
            ].map((step, i) => (
              <View key={i} style={styles.stepCard}>
                <Text style={styles.stepNum}>{step.num}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ══════════ SECURITY & TRUST ══════════ */}
      <View style={styles.section}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>TRUST & PRIVACY</Text>
          </View>
          <Text style={styles.sectionTitle}>Your Data.{'\n'}Your Privacy.{'\n'}Our Promise.</Text>
          <Text style={styles.sectionSubtitle}>
            Visage AI was engineered with a privacy-first architecture.
            We believe your biometric data belongs to you and only you.
          </Text>

          <View style={styles.securityGrid}>
            {SECURITY_FEATURES.map((feature, i) => (
              <View key={i} style={styles.securityCard}>
                <Text style={styles.securityIcon}>{feature.icon}</Text>
                <Text style={styles.securityTitle}>{feature.title}</Text>
                <Text style={styles.securityDesc}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ══════════ FINAL CTA ══════════ */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaInner}>
          <Text style={styles.ctaTitle}>Ready to See{'\n'}What Your Face Reveals?</Text>
          <Text style={styles.ctaSubtitle}>
            Experience the world's most advanced contactless biometric scan.
            It takes 30 seconds and requires nothing but your camera.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/scan')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>⬡  BEGIN SCAN</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ══════════ FOOTER ══════════ */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>VISAGE AI</Text>
        <Text style={styles.footerText}>Next-Generation Contactless Biometric Intelligence</Text>
        <View style={styles.footerDivider} />
        <Text style={styles.footerAttribution}>A PRODUCT BY ADITYA PANDEY</Text>
        <Text style={styles.footerCopyright}>© 2026 Visage AI. All rights reserved.</Text>
      </View>

      {/* ══════════ REQUEST DEMO MODAL ══════════ */}
      {showDemo && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request a Demo</Text>
            <Text style={styles.modalText}>
              Interested in integrating Visage AI into your clinical workflow?
              {'\n\n'}Contact us at: demo@visage-ai.com
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowDemo(false)}
            >
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050510',
  },

  // ── Hero ────────────────────────────────
  heroContainer: {
    height: Platform.OS === 'web' ? '100vh' as any : Dimensions.get('window').height,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  fallbackBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050510',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 700,
  },
  taglinePill: {
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  taglineText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 52 : 80,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 16,
    // Glow effect via text shadow on web
    ...(Platform.OS === 'web' ? {
      textShadowColor: 'rgba(124, 58, 237, 0.6)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 40,
    } : {}),
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: isMobile ? 16 : 20,
    textAlign: 'center',
    lineHeight: isMobile ? 24 : 32,
    letterSpacing: 1,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  primaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 50,
    backgroundColor: '#7c3aed',
    // Gradient illusion via shadow
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
      boxShadow: '0 0 30px rgba(124, 58, 237, 0.4), 0 4px 20px rgba(0,0,0,0.3)',
    } as any : {}),
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(12px)',
      boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)',
    } as any : {}),
  },
  secondaryBtnText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroAttribution: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  scrollText: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 8,
  },
  scrollArrow: {
    color: 'rgba(124, 58, 237, 0.6)',
    fontSize: 20,
  },

  // ── Sections ────────────────────────────
  section: {
    backgroundColor: '#050510',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  sectionInner: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  sectionBadge: {
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
  },
  sectionBadgeText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 32 : 44,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: isMobile ? 40 : 56,
    marginBottom: 16,
    letterSpacing: 1,
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
    marginBottom: 48,
  },

  // ── Formula Card ────────────────────────
  formulaCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 48,
    alignItems: 'center',
    width: '100%',
    maxWidth: 700,
  },
  formulaText: {
    color: '#a78bfa',
    fontSize: isMobile ? 12 : 16,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
    textAlign: 'center',
    marginBottom: 12,
  },
  formulaCaption: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    letterSpacing: 1,
  },

  // ── Stream Cards ────────────────────────
  streamGrid: {
    width: '100%',
    gap: 16,
  },
  streamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 24,
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: 20,
  },
  streamIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamIcon: {
    fontSize: 28,
  },
  streamTextWrap: {
    flex: 1,
  },
  streamTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  streamSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  streamDesc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Steps ───────────────────────────────
  stepsRow: {
    width: '100%',
    flexDirection: isMobile ? 'column' : 'row',
    gap: 20,
  },
  stepCard: {
    flex: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  stepNum: {
    color: '#7c3aed',
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: 2,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDesc: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  // ── Security ────────────────────────────
  securityGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  securityCard: {
    width: isMobile ? '100%' : '47%' as any,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 28,
  },
  securityIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  securityTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  securityDesc: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    lineHeight: 20,
  },

  // ── CTA Section ─────────────────────────
  ctaSection: {
    backgroundColor: '#08081a',
    paddingVertical: 100,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(124, 58, 237, 0.1)',
  },
  ctaInner: {
    alignItems: 'center',
    maxWidth: 600,
  },
  ctaTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 32 : 44,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: isMobile ? 40 : 56,
    marginBottom: 20,
    ...(Platform.OS === 'web' ? {
      textShadowColor: 'rgba(124, 58, 237, 0.4)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 30,
    } : {}),
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  ctaButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    backgroundColor: '#7c3aed',
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
      boxShadow: '0 0 40px rgba(124, 58, 237, 0.5), 0 4px 20px rgba(0,0,0,0.4)',
    } as any : {}),
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // ── Footer ──────────────────────────────
  footer: {
    backgroundColor: '#050510',
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerBrand: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 24,
    textAlign: 'center',
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    marginBottom: 24,
  },
  footerAttribution: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 8,
  },
  footerCopyright: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 11,
  },

  // ── Modal ───────────────────────────────
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#0f0f1a',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 20,
    padding: 40,
    maxWidth: 440,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  modalClose: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  modalCloseText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
