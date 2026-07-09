import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf/dist/jspdf.umd.min.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { GlassCard } from '../components/GlassCard';
import { useLocalSearchParams, useRouter } from 'expo-router';

function ResultMesh() {
  const meshRef = useRef(null);
  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.2, 4]} />
      <meshBasicMaterial color="#5b53ff" wireframe opacity={0.4} transparent />
    </mesh>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subjectId = (params.subjectId as string) || 'UNKNOWN';
  const fullName = (params.fullName as string) || 'Unknown Patient';
  const age = (params.age as string) || 'N/A';
  const gender = (params.gender as string)?.toUpperCase() || 'N/A';
  const fromAdmin = params.fromAdmin === 'true';
  
  const [stressScore, setStressScore] = useState(0);
  
  // Parse passed metrics or use mock defaults if navigated to directly
  let metrics = {
    vitals_ai: { heart_rate: 72.0, hrv: 64.2, breathing_rate: 14.5, blood_pressure: "118/76", stress_index: 24.1 },
    empathic_ai: { dominant_emotion: "Empathetic", vocal_tone_stress: 21.0, sentiment_score: 82.5, trust_index: 89.2 },
    dermal_health: { skin_tone_hex: '#8D5524', fitzpatrick_type: 'IV', melanin_index: 45.2 }
  };
  
  if (params.metrics) {
    try {
      metrics = JSON.parse(params.metrics as string);
    } catch (e) {
      console.error("Failed to parse local search metrics:", e);
    }
  }

  const targetStress = metrics.vitals_ai.stress_index;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += (targetStress / 40); // animate over ~800ms
      if (current >= targetStress) {
        current = targetStress;
        clearInterval(interval);
      }
      setStressScore(Math.floor(current));
    }, 20);
    return () => clearInterval(interval);
  }, [targetStress]);

  const exportPDF = async () => {
    if (Platform.OS !== 'web') return;
    const element = document.getElementById('capture-area');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#000000' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save('Visage_Clinical_Report.pdf');
    } catch (e) {
      console.error(e);
    }
  };

  const shareImage = async () => {
    if (Platform.OS !== 'web') return;
    const element = document.getElementById('capture-area');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#000000' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      try {
        const res = await fetch(imgData);
        const blob = await res.blob();
        const file = new File([blob], 'Visage_Report.jpg', { type: 'image/jpeg' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Visage Biometric Report',
            text: 'Clinical Data Extraction',
            files: [file]
          });
          return;
        }
      } catch (e) {
        console.warn("Native share failed, downloading instead.");
      }

      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'Visage_Clinical_Report.jpg';
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 3D Wireframe background mapping */}
      <View style={styles.canvasContainer}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <ResultMesh />
        </Canvas>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {fromAdmin && (
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/admin')}>
            <Text style={styles.backBtnText}>← RETURN TO ADMIN PORTAL</Text>
          </TouchableOpacity>
        )}
        <View nativeID="capture-area" style={{ backgroundColor: '#000' }}>
          <GlassCard style={styles.glassCard}>
            <Text style={styles.title}>VISAGE HUMAN INSIGHTS</Text>
            <Text style={styles.subtitle}>Contactless Biometric Scan Complete</Text>
            <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1, marginTop: -15, marginBottom: 20, textAlign: 'center'}}>A PRODUCT BY ADITYA PANDEY</Text>
            
            <View style={styles.identityBox}>
              <Text style={styles.identityId}>{subjectId}</Text>
              <Text style={styles.identityText}>{fullName} | AGE: {age} | SEX: {gender}</Text>
            </View>
          
          {/* Main Stress Index Panel */}
          <View style={styles.stressBox}>
            <Text style={styles.label}>STRESS INDEX (Vitals Proxy)</Text>
            <View style={styles.stressRow}>
              <Text style={styles.score}>{stressScore}</Text>
              <Text style={styles.maxScore}>/ 100</Text>
            </View>
            <Text style={[styles.stressState, { color: stressScore < 35 ? '#10b981' : (stressScore < 65 ? '#fbbf24' : '#ef4444') }]}>
              {stressScore < 35 ? "Optimal Resilience" : (stressScore < 65 ? "Moderate Strain" : "High Strain / Fatigue")}
            </Text>
          </View>

          {/* Pillar 1: Vitals AI */}
          <View style={styles.sectionHeader}>
            <View style={styles.dot} />
            <Text style={styles.sectionTitle}>Vitals AI (Contactless Biometrics)</Text>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Heart Rate</Text>
              <Text style={styles.gridValue}>{metrics.vitals_ai.heart_rate} <Text style={styles.unit}>BPM</Text></Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Heart Rate Var (HRV)</Text>
              <Text style={styles.gridValue}>{metrics.vitals_ai.hrv} <Text style={styles.unit}>ms</Text></Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Breathing Rate</Text>
              <Text style={styles.gridValue}>{metrics.vitals_ai.breathing_rate} <Text style={styles.unit}>RPM</Text></Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Blood Pressure</Text>
              <Text style={styles.gridValue}>{metrics.vitals_ai.blood_pressure} <Text style={styles.unit}>mmHg</Text></Text>
            </View>
          </View>

          {/* Pillar 2: Empathic AI */}
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: '#5b53ff' }]} />
            <Text style={styles.sectionTitle}>Empathic AI (Vocal & Dermal Sentiment)</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Dominant Emotion</Text>
              <Text style={styles.gridValue}>{metrics.empathic_ai.dominant_emotion}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Trust Index</Text>
              <Text style={styles.gridValue}>{metrics.empathic_ai.trust_index}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sentiment Score</Text>
              <Text style={styles.gridValue}>{metrics.empathic_ai.sentiment_score}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Vocal Tone Stress</Text>
              <Text style={styles.gridValue}>{metrics.empathic_ai.vocal_tone_stress}%</Text>
            </View>
          </View>

          {/* Pillar 3: Dermal Health */}
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: '#fbbf24' }]} />
            <Text style={styles.sectionTitle}>Dermal Health Profiling</Text>
          </View>

          <View style={styles.dermalContainer}>
            <View style={styles.colorRow}>
              <View style={[styles.colorBlock, { backgroundColor: metrics.dermal_health.skin_tone_hex }]} />
              <View style={styles.dermalMeta}>
                <Text style={styles.dermalHex}>Hex: {metrics.dermal_health.skin_tone_hex}</Text>
                <Text style={styles.dermalFitz}>Fitzpatrick Type: Type {metrics.dermal_health.fitzpatrick_type}</Text>
                <Text style={styles.dermalMelanin}>Melanin Index: {metrics.dermal_health.melanin_index}%</Text>
              </View>
            </View>
          </View>

          {/* Branding Footer */}
          <View style={styles.brandingFooter}>
            <Text style={styles.brandingText}>VISAGE AI: CLINICAL BIOMETRIC EXTRACTION</Text>
            <Text style={styles.brandingSub}>SECURE MEDICAL MAINFRAME // CONFIDENTIAL</Text>
          </View>
        </GlassCard>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={exportPDF}>
            <Text style={styles.actionBtnText}>EXPORT PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={shareImage}>
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>SHARE IMAGE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  canvasContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.7 },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  glassCard: { width: '100%', padding: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1.5, fontFamily: 'System' },
  subtitle: { color: '#5b53ff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, textAlign: 'center' },
  identityBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  identityId: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  identityText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  stressBox: { backgroundColor: 'rgba(91, 83, 255, 0.1)', padding: 20, borderRadius: 12, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(91, 83, 255, 0.3)' },
  label: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8 },
  stressRow: { flexDirection: 'row', alignItems: 'baseline' },
  score: { color: '#fff', fontSize: 56, fontWeight: '900', lineHeight: 56 },
  maxScore: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 18, fontWeight: 'bold', marginLeft: 4 },
  stressState: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 8 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  detailsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    padding: 10
  },
  gridItem: { width: '48%', paddingVertical: 8 },
  gridLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginBottom: 4 },
  gridValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  unit: { fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'normal' },
  dermalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    padding: 14
  },
  colorRow: { flexDirection: 'row', alignItems: 'center' },
  colorBlock: { width: 50, height: 50, borderRadius: 8, marginRight: 16 },
  dermalMeta: { flex: 1, gap: 2 },
  dermalHex: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  dermalFitz: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 },
  dermalMelanin: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 },
  brandingFooter: { marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  brandingText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  brandingSub: { color: 'rgba(255,255,255,0.3)', fontSize: 8, letterSpacing: 1, marginTop: 4 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionBtn: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginRight: 0, marginLeft: 8 },
  actionBtnText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  exportBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  backBtn: { backgroundColor: 'rgba(91, 83, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(91, 83, 255, 0.3)', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  backBtnText: { color: '#5b53ff', fontSize: 12, fontWeight: '900', letterSpacing: 2 }
});
