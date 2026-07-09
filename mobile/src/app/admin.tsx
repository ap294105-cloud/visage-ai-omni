import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, ActivityIndicator, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Make sure to replace with your actual machine IP if testing on a physical device
const API_URL = 'http://localhost:8000/api/v2/admin/records';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputId, setInputId] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch admin records');
      const json = await res.json();
      setRecords(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const stored = localStorage.getItem('adminLoggedIn');
      if (stored === 'true') {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = () => {
    if (inputId === '260100204916' && inputPass === 'Ad@080908') {
      setIsLoggedIn(true);
      if (Platform.OS === 'web') {
        localStorage.setItem('adminLoggedIn', 'true');
      }
      setLoginError('');
      fetchRecords();
    } else {
      setLoginError('INVALID CREDENTIALS');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (Platform.OS === 'web') {
      localStorage.removeItem('adminLoggedIn');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchRecords();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginWrapper}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>RESTRICTED ACCESS</Text>
            <Text style={styles.loginSubtitle}>Admin Authentication Required</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Admin ID"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={inputId}
              onChangeText={setInputId}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              value={inputPass}
              onChangeText={setInputPass}
            />
            
            {loginError ? <Text style={styles.loginError}>{loginError}</Text> : null}
            
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>AUTHENTICATE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleCardPress = (r: any) => {
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
        gender: r.gender,
        fromAdmin: 'true'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Welcome ADITYA PANDEY</Text>
          <Text style={styles.headerSubtitle}>Subject Intelligence Database</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.refreshBtn, { marginRight: 12 }]} onPress={fetchRecords}>
            <Text style={styles.refreshText}>REFRESH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>ACCESSING SECURE MAINFRAME...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>[ERROR] {error}</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>NO SUBJECT RECORDS FOUND</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {records.map((r, i) => (
            <TouchableOpacity key={r.id || i} style={styles.card} onPress={() => handleCardPress(r)} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.recordId}>{r.user_id}</Text>
                  <Text style={styles.recordName}>{r.full_name || 'UNKNOWN'} | AGE: {r.age || 'N/A'} | SEX: {r.gender?.toUpperCase() || 'N/A'}</Text>
                </View>
                <Text style={styles.recordTime}>
                  {new Date(r.timestamp).toLocaleTimeString()} | {new Date(r.timestamp).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.imageWrapper}>
                  {r.image_base64 ? (
                    <Image 
                      source={{ uri: `data:image/jpeg;base64,${r.image_base64}` }} 
                      style={styles.image} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImage}><Text style={styles.noImageText}>NO REF</Text></View>
                  )}
                  <View style={styles.imageOverlay} />
                </View>

                <View style={styles.metricsCol}>
                  {/* Vitals AI */}
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>STRESS INDEX</Text>
                    <Text style={[styles.metricValue, { color: r.vitals_ai.stress_index > 65 ? '#ef4444' : '#10b981' }]}>
                      {r.vitals_ai.stress_index}/100
                    </Text>
                  </View>

                  {/* Empathic AI */}
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>DOMINANT STATE</Text>
                    <Text style={styles.metricValue}>{r.empathic_ai.dominant_emotion.toUpperCase()}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>TRUST INDEX</Text>
                    <Text style={[styles.metricValue, { color: r.empathic_ai.trust_index < 50 ? '#ef4444' : '#3b82f6' }]}>
                      {r.empathic_ai.trust_index}/100
                    </Text>
                  </View>

                  {/* Dermal AI */}
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>FITZPATRICK</Text>
                    <Text style={styles.metricValue}>TYPE {r.dermal_health.fitzpatrick_type}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>SKIN HEX</Text>
                    <View style={styles.hexBadge}>
                      <View style={[styles.hexColor, { backgroundColor: r.dermal_health.true_skin_hex }]} />
                      <Text style={styles.hexText}>{r.dermal_health.true_skin_hex}</Text>
                    </View>
                  </View>

                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0a0a0a'
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1, marginTop: 4 },
  refreshBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  refreshText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  logoutText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 12, letterSpacing: 2 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: 2 },
  scrollContent: { padding: 16 },
  
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  recordId: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  recordName: { color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },
  recordTime: { color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1 },
  cardBody: {
    flexDirection: 'row',
    padding: 16,
  },
  imageWrapper: {
    width: 100,
    height: 120,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative'
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Slight green medical tint
  },
  noImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 1 },
  metricsCol: { flex: 1, justifyContent: 'space-between' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  metricValue: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  hexBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  hexColor: { width: 8, height: 8, borderRadius: 4, marginRight: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  hexText: { color: '#fff', fontSize: 10, fontFamily: 'monospace' },
  
  loginWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginCard: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 30 },
  loginTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  loginSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, textAlign: 'center', marginTop: 8, marginBottom: 32 },
  input: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', padding: 16, marginBottom: 16, fontSize: 16, letterSpacing: 1 },
  loginError: { color: '#ef4444', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center', marginBottom: 16 },
  loginBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 }
});
