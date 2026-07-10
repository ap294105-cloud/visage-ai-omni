import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../components/GlassCard';

export default function App() {
  const router = useRouter();
  const [showQrPrompt, setShowQrPrompt] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [showIntake, setShowIntake] = useState(true);

  // Now using public live Localtunnel URLs
  const backendHost = 'https://visage-backend-ap.loca.lt';
  const frontendHost = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://visage-frontend-ap.loca.lt';
  
  const scanUrl = `${frontendHost}/capture?subjectId=${encodeURIComponent(subjectId)}&fullName=${encodeURIComponent(fullName)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(scanUrl)}`;

  useEffect(() => {
    if (!showQrPrompt || !subjectId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendHost}/api/v2/admin/record/${subjectId}`, {
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            clearInterval(interval);
            const r = json.data;
            const metricsPayload = {
              vitals_ai: r.vitals_ai,
              empathic_ai: r.empathic_ai,
              dermal_health: r.dermal_health
            };
            router.push({
              pathname: '/result',
              params: {
                metrics: JSON.stringify(metricsPayload),
                subjectId: r.user_id,
                fullName: r.full_name,
                age: r.age,
                gender: r.gender
              }
            });
          }
        }
      } catch (e) {
        // fail silently and try again
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showQrPrompt, subjectId, backendHost, router]);

  if (showIntake) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          <GlassCard style={styles.glassCard}>
            <Text style={styles.title}>SUBJECT INTAKE</Text>
            <Text style={styles.subtitle}>Identity Verification</Text>
            
            <View style={{ width: '100%', marginTop: 20 }}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
              <TextInput
                style={styles.input}
                placeholder="Biological Sex (M/F)"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={gender}
                onChangeText={setGender}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { opacity: fullName && age && gender ? 1 : 0.5, marginTop: 10 }]}
              disabled={!fullName || !age || !gender}
              onPress={() => {
                const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'XX';
                const random = Math.floor(1000 + Math.random() * 9000);
                const newSubjectId = `UPV-${initials}-${age}-${random}`;
                setSubjectId(newSubjectId);
                setShowIntake(false);
                
                if (Platform.OS !== 'web') {
                  router.push({ pathname: '/capture', params: { subjectId: newSubjectId, fullName, age, gender } });
                } else {
                  setShowQrPrompt(true);
                }
              }}
            >
              <Text style={styles.buttonText}>VERIFY & PROCEED</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

  if (showQrPrompt) {
    return (
      <SafeAreaView style={styles.container}>
        {/* VISAGE Navigation Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>VISAGE</Text>
          <View style={styles.profileRow}>
            <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 10, marginRight: 16, textTransform: 'uppercase', letterSpacing: 1}}>A PRODUCT BY ADITYA PANDEY</Text>
            <Text style={styles.profileText}>Demo Client</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>DC</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <GlassCard style={styles.qrCard}>
            
            {/* Recommended Pill */}
            <View style={styles.recommendPill}>
              <Text style={styles.recommendText}>Recommended</Text>
            </View>

            <Text style={styles.qrTitle}>Continue on your phone</Text>
            <Text style={styles.qrSubtitle}>
              This 30-second scan works best on a phone. Mobile cameras handle lighting better, helping it run uninterrupted.
            </Text>

            {/* Crispy REAL Scannable QR Code */}
            <View style={styles.qrWrapper}>
              <Image 
                source={{ uri: qrUrl }} 
                style={styles.qrImage} 
                resizeMode="contain"
              />
            </View>

            {/* OR Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.webcamLabel}>
              Press <Text style={{ fontWeight: 'bold', color: '#fff' }}>Start Scan</Text> below to use this device's camera.
            </Text>
            <Text style={styles.webcamSublabel}>
              Webcam scans may take longer depending on lighting and camera quality.
            </Text>

          </GlassCard>
        </ScrollView>

        {/* Desktop Footer Control Bar */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => setShowQrPrompt(false)}
          >
            <Text style={styles.cancelText}>✕   CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.startBtn}
            onPress={() => router.push({ pathname: '/capture', params: { subjectId, fullName, age, gender } })}
          >
            <Text style={styles.startBtnText}>START SCAN   →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return null;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  
  // Header
  header: { 
    height: 56, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#000000'
  },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 },
  profileBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#5b53ff', justifyContent: 'center', alignItems: 'center' },
  profileBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Scroll content
  scrollContainer: { padding: 24, paddingTop: 60, paddingBottom: 120, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  
  // QR Card
  qrCard: { 
    width: '100%', 
    maxWidth: 440, 
    padding: 32, 
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16
  },
  recommendPill: { 
    backgroundColor: 'rgba(91, 83, 255, 0.15)', 
    borderWidth: 1, 
    borderColor: 'rgba(91, 83, 255, 0.3)',
    borderRadius: 20, 
    paddingVertical: 4, 
    paddingHorizontal: 12,
    marginBottom: 20,
    alignSelf: 'center'
  },
  recommendText: { color: '#a5b4fc', fontSize: 11, fontWeight: 'bold' },
  qrTitle: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12, fontFamily: 'System' },
  qrSubtitle: { color: '#a1a1aa', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  
  // QR Code Vector Wrapper (FORCED SQUARE)
  qrWrapper: { 
    width: 212,
    height: 212,
    padding: 16, 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    marginBottom: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  qrImage: { width: 180, height: 180 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  dividerText: { color: 'rgba(255, 255, 255, 0.25)', marginHorizontal: 16, fontSize: 12 },

  // Webcam section
  webcamLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, textAlign: 'center', marginBottom: 8, lineHeight: 18 },
  webcamSublabel: { color: 'rgba(255, 255, 255, 0.35)', fontSize: 11, textAlign: 'center', fontStyle: 'italic' },

  // Footer Action Bar
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 72, 
    backgroundColor: '#09090b', 
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 24
  },
  cancelBtn: { 
    backgroundColor: 'rgba(239, 68, 68, 0.06)', 
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  cancelText: { color: '#ef4444', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  startBtn: { 
    backgroundColor: '#5b53ff', 
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  startBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },

  // Home Screen
  overlay: { width: '100%', padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  glassCard: { width: '100%', maxWidth: 400, alignItems: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  subtitle: { color: '#5b53ff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20, textAlign: 'center' },
  description: { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', marginBottom: 30, lineHeight: 22, fontSize: 14 },
  button: { backgroundColor: '#5b53ff', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  input: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: 16, marginBottom: 16, fontSize: 16, letterSpacing: 1 }
});
