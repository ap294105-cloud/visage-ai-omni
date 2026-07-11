import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, Platform, Animated, Easing } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { LightSensor } from 'expo-sensors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

type FlowState = 'camera_select' | 'align_face' | 'scanning';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lux, setLux] = useState(Platform.OS === 'web' ? 500 : 0);
  const cameraRef = useRef(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  const subjectId = (params.subjectId as string) || 'UPV-UNKNOWN';
  const fullName = (params.fullName as string) || 'Unknown Patient';
  const age = (params.age as string) || 'Unknown';
  const gender = (params.gender as string) || 'Unknown';

  const [flowState, setFlowState] = useState<FlowState>('camera_select');
  const [scanProgress, setScanProgress] = useState(0);
  const scannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') return; 
    let subscription: any;
    const initSensor = async () => {
      const available = await LightSensor.isAvailableAsync();
      if (available) {
        LightSensor.setUpdateInterval(500);
        subscription = LightSensor.addListener(data => {
          setLux(data.illuminance);
        });
      }
    };
    initSensor();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const isLightingGood = lux > 150 && lux < 10000;
  const [isFaceCentered, setIsFaceCentered] = useState(false);
  const [isForeheadVisible, setIsForeheadVisible] = useState(false);
  const isReady = isFaceCentered && isForeheadVisible && isLightingGood;

  const triggerScan = () => {
    if (!isReady) return;
    setFlowState('scanning');
    setScanProgress(0);
  };

  useEffect(() => {
    if (flowState !== 'align_face') return;
    
    let isMounted = true;
    const interval = setInterval(async () => {
      if (!cameraRef.current) return;
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.1, base64: false });
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
          let blob;
          if (photo.uri.startsWith('data:')) {
            const parts = photo.uri.split(',');
            const byteString = atob(parts[1]);
            const mimeString = parts[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
            blob = new Blob([ab], {type: mimeString});
          } else {
            blob = await new Promise<Blob>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = () => resolve(xhr.response);
              xhr.onerror = () => reject(new Error('fetch failed'));
              xhr.responseType = 'blob';
              xhr.open('GET', photo.uri, true);
              xhr.send(null);
            });
          }
          formData.append('image_payload', blob, 'val.jpg');
        } else {
          const filename = photo.uri.split('/').pop() || 'val.jpg';
          formData.append('image_payload', { uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri, name: filename, type: 'image/jpeg' } as any);
        }
        
        const backendHost = 'https://visage-backend.onrender.com';
        const response = await fetch(`${backendHost}/api/v2/analyze/validate_face`, {
          method: 'POST',
          body: formData,
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        
        if (response.ok && isMounted) {
          const json = await response.json();
          setIsFaceCentered(json.face_centered && json.face_detected);
          setIsForeheadVisible(json.forehead_visible && json.face_detected);
        }
      } catch (e) {
        // fail silently for validation loop
      }
    }, 1500);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [flowState]);

  useEffect(() => {
    if (flowState !== 'scanning') {
      scannerAnim.stopAnimation();
      return;
    }

    // Industrial slow, smooth sweep animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scannerAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ).start();

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      
      if (currentProgress >= 100) {
        setScanProgress(100);
        clearInterval(interval);
        executeAnalysis();
      } else {
        setScanProgress(currentProgress);
      }
    }, 550); // 55 seconds total (550ms * 100)

    return () => clearInterval(interval);
  }, [flowState]);

  const executeAnalysis = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
        
        const formData = new FormData();
        formData.append('user_id', subjectId);
        formData.append('full_name', fullName);
        formData.append('age', age);
        formData.append('gender', gender);
        formData.append('ambient_lux', lux.toString());
        formData.append('calibration_index', '1');
        
        if (Platform.OS === 'web') {
          let blob;
          if (photo.uri.startsWith('data:')) {
            const parts = photo.uri.split(',');
            const byteString = atob(parts[1]);
            const mimeString = parts[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            blob = new Blob([ab], {type: mimeString});
          } else {
            blob = await new Promise<Blob>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = () => resolve(xhr.response);
              xhr.onerror = () => reject(new Error('Failed to fetch blob'));
              xhr.responseType = 'blob';
              xhr.open('GET', photo.uri, true);
              xhr.send(null);
            });
          }
          formData.append('image_payload', blob, 'photo.jpg');
        } else {
          const filename = photo.uri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formData.append('image_payload', { uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri, name: filename, type } as any);
        }

        const backendHost = 'https://visage-backend.onrender.com';
        const response = await fetch(`${backendHost}/api/v2/analyze/facial_feature_set`, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        });

        if (!response.ok) {
          setFlowState('align_face');
          Alert.alert("Analysis Failed", "Engine could not validate biometric markers.");
          return;
        }
        
        const jsonResponse = await response.json();
        router.push({
          pathname: '/result',
          params: { metrics: JSON.stringify(jsonResponse.metrics), subjectId, fullName, age, gender }
        });
      } catch (e) {
        console.error(e);
        setFlowState('align_face');
        Alert.alert("Network Error", "Lost connection to the Clinical Engine.");
      }
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#888', textAlign: 'center', letterSpacing: 1 }}>SYSTEM ACCESS REQUIRED</Text>
        <TouchableOpacity onPress={requestPermission} style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', letterSpacing: 2, fontSize: 12 }}>AUTHORIZE CAMERA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.logoText}>VISAGE // CLINICAL</Text>
          <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 1, marginTop: 2}}>A PRODUCT BY ADITYA PANDEY</Text>
        </View>
        <View style={styles.clientBadge}>
          <Text style={styles.clientText}>AUTHORIZATION: VALID</Text>
          <View style={styles.badgeIndicator} />
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.cameraCard}>
          <CameraView style={styles.camera} facing="front" ref={cameraRef} />
          
          {flowState === 'camera_select' && (
            <View style={styles.overlayBottomHalf}>
              <View style={styles.overlaySolid}>
                <Text style={styles.stateTitle}>INITIALIZE SENSOR</Text>
                <Text style={styles.stateDesc}>Ensure your primary optical sensor is free of debris. Clinical-grade extraction requires optimal visual fidelity.</Text>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => setFlowState('align_face')}>
                  <Text style={styles.btnPrimaryText}>ENGAGE PROTOCOL</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {flowState === 'align_face' && (
            <View style={styles.overlayFull}>
              <View style={styles.topBarDark}>
                <Text style={styles.topBarText}>SUBJECT ALIGNMENT REQUIRED</Text>
              </View>
              
              <View style={styles.framingContainer}>
                <View style={styles.viewfinder}>
                  <View style={[styles.vfCorner, styles.vfTL]} />
                  <View style={[styles.vfCorner, styles.vfTR]} />
                  <View style={[styles.vfCorner, styles.vfBL]} />
                  <View style={[styles.vfCorner, styles.vfBR]} />
                  <View style={styles.vfCrosshairH} />
                  <View style={styles.vfCrosshairV} />
                </View>
              </View>

              <View style={styles.checklistContainer}>
                <View style={styles.checklistItem}>
                  <View style={isFaceCentered ? styles.indicatorActive : styles.indicatorInactive} />
                  <Text style={isFaceCentered ? styles.textCheck : styles.textCross}>SUBJECT CENTERED</Text>
                </View>
                <View style={styles.checklistItem}>
                  <View style={isForeheadVisible ? styles.indicatorActive : styles.indicatorInactive} />
                  <Text style={isForeheadVisible ? styles.textCheck : styles.textCross}>CHROMINANCE ZONE VISIBLE</Text>
                </View>
                <View style={styles.checklistItem}>
                  <View style={isLightingGood ? styles.indicatorActive : styles.indicatorInactive} />
                  <Text style={isLightingGood ? styles.textCheck : styles.textCross}>LUX LEVELS OPTIMAL</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.btnScan, !isReady && styles.btnDisabled]} 
                  onPress={triggerScan}
                  disabled={!isReady}
                >
                  <Text style={styles.btnScanText}>{isReady ? 'COMMENCE EXTRACTION' : 'AWAITING ALIGNMENT'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {flowState === 'scanning' && (
            <View style={styles.scanningOverlayTransparent}>
              <Animated.View 
                style={[
                  styles.scannerBar,
                  {
                    top: scannerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '80%']
                    })
                  }
                ]}
              >
                {Platform.OS === 'web' ? (
                  <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                )}
                <View style={styles.scannerLine} />
              </Animated.View>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>EXTRACTING BIOMETRIC SIGNATURE</Text>
                  <Text style={styles.progressValue}>[{scanProgress.toString().padStart(2, '0')}%]</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${scanProgress}%` }]} />
                </View>
              </View>
            </View>
          )}

        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnCancel} onPress={() => router.replace('/scan')}>
          <Text style={styles.btnCancelText}>ABORT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  
  header: { height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  logoText: { color: '#E5E5E5', fontSize: 11, fontWeight: '600', letterSpacing: 2 },
  clientBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clientText: { color: '#888888', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  badgeIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }, 

  footer: { height: 80, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 24, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  btnCancel: { paddingHorizontal: 20, paddingVertical: 10 },
  btnCancelText: { color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },
  
  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  cameraCard: { width: '100%', maxWidth: 460, height: '100%', maxHeight: 680, backgroundColor: '#000', borderRadius: 4, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#1A1A1A' },
  camera: { ...StyleSheet.absoluteFillObject },

  overlayBottomHalf: { position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'flex-end' },
  overlaySolid: { backgroundColor: 'rgba(10, 10, 10, 0.95)', padding: 24, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#222' },
  stateTitle: { color: '#FFF', fontSize: 12, fontWeight: '600', letterSpacing: 2, marginBottom: 12 },
  stateDesc: { color: '#888', fontSize: 11, lineHeight: 18, marginBottom: 24, letterSpacing: 0.5 },
  btnPrimary: { backgroundColor: '#FFF', paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#000', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  overlayFull: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBarDark: { backgroundColor: 'rgba(5, 5, 5, 0.85)', paddingVertical: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  topBarText: { color: '#AAA', fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  
  framingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewfinder: { width: '65%', height: '50%', position: 'relative' },
  vfCorner: { position: 'absolute', width: 20, height: 20, borderColor: 'rgba(255,255,255,0.8)', borderWidth: 1 },
  vfTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  vfTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  vfBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  vfBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  vfCrosshairH: { position: 'absolute', top: '50%', left: '45%', width: '10%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  vfCrosshairV: { position: 'absolute', top: '45%', left: '50%', width: 1, height: '10%', backgroundColor: 'rgba(255,255,255,0.3)' },

  checklistContainer: { backgroundColor: 'rgba(10, 10, 10, 0.95)', padding: 24, borderTopWidth: 1, borderTopColor: '#222' },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  indicatorActive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 12 },
  indicatorInactive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333', marginRight: 12 },
  textCheck: { color: '#E5E5E5', fontSize: 10, letterSpacing: 1, fontWeight: '600' },
  textCross: { color: '#666', fontSize: 10, letterSpacing: 1, fontWeight: '500' },
  
  btnScan: { backgroundColor: '#FFF', paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  btnScanText: { color: '#000', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  btnDisabled: { backgroundColor: '#222' },

  scanningOverlayTransparent: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  
  scannerBar: { position: 'absolute', left: 0, right: 0, height: '20%', overflow: 'hidden' },
  scannerLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' },

  progressContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10, 10, 10, 0.95)', padding: 24, borderTopWidth: 1, borderTopColor: '#222' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { color: '#888', fontSize: 10, fontWeight: '600', letterSpacing: 1.5 },
  progressValue: { color: '#FFF', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },
  progressBarTrack: { width: '100%', height: 1, backgroundColor: '#222' },
  progressBarFill: { height: '100%', backgroundColor: '#FFF' },
});
