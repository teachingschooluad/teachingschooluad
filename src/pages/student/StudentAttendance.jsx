import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function StudentAttendance() {
  const { user, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [position, setPosition] = useState(null);
  const [companyCoord, setCompanyCoord] = useState(null);
  const [distance, setDistance] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Haversine distance
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch (e) {
      setError('Gagal mengakses kamera: ' + e.message);
    }
  }, []);

  const initLocation = useCallback(async () => {
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 })
      );
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      // Refresh user data for company coords
      await fetchMe();
      const mitra = useAuthStore.getState().user?.mitra;
      if (mitra) {
        const coords = [
          { lat: mitra.latitude, lng: mitra.longitude },
          { lat: mitra.latitude_2, lng: mitra.longitude_2 },
          { lat: mitra.latitude_3, lng: mitra.longitude_3 },
          { lat: mitra.latitude_4, lng: mitra.longitude_4 },
        ].filter(c => c.lat && c.lng).map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));

        let minDist = Infinity, closest = null;
        for (const c of coords) {
          const d = calcDistance(pos.coords.latitude, pos.coords.longitude, c.lat, c.lng);
          if (d < minDist) { minDist = d; closest = c; }
        }
        if (closest) { setCompanyCoord(closest); setDistance(minDist); }
      }
    } catch (e) {
      setError('Gagal mendapatkan lokasi: ' + e.message);
    }
  }, [fetchMe]);

  useEffect(() => {
    initCamera();
    initLocation();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [initCamera, initLocation]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Mirror
    ctx.drawImage(video, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.7));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (distance !== null && distance > 100) {
      toast.error('Anda berada di luar radius presensi (>100 meter)!');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const blob = await takePhoto();
      if (!blob) throw new Error('Gagal mengambil foto');

      const pos = position || await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), reject
        )
      );

      const formData = new FormData();
      formData.append('latitude', pos.lat);
      formData.append('longitude', pos.lng);
      formData.append('photo', blob, 'selfie.webp');

      const res = await api.post('/attendances/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const data = res.data.data;
        toast.success(res.data.message);

        // Share to WA
        const shareText = `Laporan Presensi PPL UAD\nNama: ${user?.name}\nStatus: ${data.type === 'check_in' ? 'Masuk' : 'Pulang'}\nWaktu: ${data.time}\nValidasi Sistem: E-Teaching School UAD`;

        try {
          if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'selfie.webp', { type: 'image/webp' })] })) {
            await navigator.share({
              text: shareText,
              files: [new File([blob], 'presensi.webp', { type: 'image/webp' })]
            });
          } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
          }
        } catch {}

        navigate('/mahasiswa/dashboard');
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Gagal mengirim presensi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-page student-attendance-page">
      {/* Camera */}
      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {!cameraReady && <div className="camera-placeholder">Memuat kamera...</div>}
      </div>

      {/* Controls */}
      <div className="attendance-controls">
        {error && <div className="attendance-error">{error}</div>}
        <p className="attendance-hint">Pastikan wajah terlihat jelas dan Anda berada di lokasi instansi mitra PPL.</p>

        {position && (
          <div className="location-info">
            <div className="location-row">
              <span className="loc-icon">📍</span>
              <span>Anda: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
            </div>
            <div className="location-row">
              <span className="loc-icon">🏢</span>
              <span>{companyCoord ? `Mitra: ${companyCoord.lat.toFixed(6)}, ${companyCoord.lng.toFixed(6)}` : 'Mitra: Koordinat belum diatur admin'}</span>
            </div>
            {distance !== null && (
              <div className={`location-distance ${distance <= 100 ? 'ok' : 'far'}`}>
                {distance <= 100 ? '✅' : '⚠️'} Jarak: {distance.toFixed(1)} meter
              </div>
            )}
          </div>
        )}

        <button className="btn-attendance" onClick={handleSubmit} disabled={submitting || !cameraReady}>
          {submitting ? (
            <span className="spinner-sm" />
          ) : (
            <><span>📸</span> 1-Tap Presensi Sekarang</>
          )}
        </button>

        <button 
          onClick={() => navigate('/mahasiswa/history')} 
          style={{
            marginTop: '12px',
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(0, 61, 122, 0.2)',
            color: 'var(--primary)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📅 Lihat Riwayat Presensi
        </button>
      </div>
    </div>
  );
}
