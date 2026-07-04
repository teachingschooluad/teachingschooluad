import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';

export default function InstrumentFillPage() {
  const { instrumentId, studentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({}); // item_id -> score

  useEffect(() => {
    fetchStudentScore();
  }, [instrumentId, studentId]);

  const fetchStudentScore = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/instruments/${instrumentId}/score/${studentId}`);
      if (data.success) {
        setData(data.data);
        
        // Populate initial scores state
        const initialScores = {};
        data.data.aspects.forEach(aspect => {
          aspect.items.forEach(item => {
            if (item.score !== null) {
              initialScores[item.id] = item.score;
            }
          });
        });
        setScores(initialScores);
      }
    } catch (e) {
      toast.error('Gagal memuat kriteria penilaian mahasiswa.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (itemId, scoreValue) => {
    setScores(prev => ({
      ...prev,
      [itemId]: scoreValue
    }));
  };

  // Live calculations
  const calculateLiveSummary = () => {
    if (!data) return { totalScore: 0, maxScore: 0, convertedScore: 0, filledItems: 0, totalItems: 0 };
    
    let totalItems = 0;
    let filledItems = 0;
    let totalScore = 0;

    data.aspects.forEach(aspect => {
      aspect.items.forEach(item => {
        totalItems++;
        const score = scores[item.id];
        if (score !== undefined && score !== null) {
          filledItems++;
          totalScore += score;
        }
      });
    });

    const maxScore = totalItems * 5;
    const convertedScore = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(2) : 0;

    return { totalScore, maxScore, convertedScore, filledItems, totalItems };
  };

  const { totalScore, maxScore, convertedScore, filledItems, totalItems } = calculateLiveSummary();

  const handleSave = async () => {
    if (filledItems < totalItems) {
      if (!window.confirm('Beberapa kriteria penilaian belum diisi. Simpan penilaian sebagian?')) {
        return;
      }
    }

    try {
      // Map scores state to API format
      const scoresPayload = Object.keys(scores).map(itemId => ({
        item_id: parseInt(itemId),
        score: scores[itemId]
      }));

      await api.post(`/instruments/${instrumentId}/score/${studentId}`, {
        scores: scoresPayload
      });

      toast.success('Penilaian instrumen akhir berhasil disimpan.');
      
      // Go back to grades or dashboard depending on where they came from
      navigate(-1);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan penilaian instrumen.');
    }
  };

  const likertLabels = [
    { value: 1, label: '1 (Sangat Kurang)' },
    { value: 2, label: '2 (Kurang)' },
    { value: 3, label: '3 (Cukup)' },
    { value: 4, label: '4 (Baik)' },
    { value: 5, label: '5 (Sangat Baik)' },
  ];

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', padding: '100px' }}>Memuat kriteria instrumen...</div>;
  }

  if (!data) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '50px' }}>
          <h3>Data tidak ditemukan</h3>
          <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
      
      {/* Question Form */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '20px', fontWeight: '700' }}>
              Isi Penilaian: {data.student.name}
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              NIM: {data.student.nim_nidn} | {data.instrument.title}
            </span>
          </div>
        </div>

        {data.aspects.map((aspect) => (
          <div className="card" key={aspect.id} style={{ marginBottom: '20px' }}>
            <div className="card-body" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>
                {aspect.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {aspect.description || 'Kriteria kualitatif penilaian aspek.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {aspect.items.map((item, idx) => (
                  <div key={item.id} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px' }}>
                      {idx + 1}. {item.question}
                    </div>
                    
                    {/* Radio Button Options */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      {likertLabels.map((opt) => (
                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`item_${item.id}`}
                            value={opt.value}
                            checked={scores[item.id] === opt.value}
                            onChange={() => handleScoreChange(item.id, opt.value)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Summary Card */}
      <div style={{ position: 'sticky', top: '80px' }}>
        <div className="card shadow-sm" style={{ border: '1px solid var(--primary-fixed-dim)' }}>
          <div className="card-body" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' }}>
              Ringkasan Nilai
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kriteria Terisi:</span>
                <span style={{ fontWeight: '600' }}>{filledItems} / {totalItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Skor:</span>
                <span style={{ fontWeight: '600' }}>{totalScore} / {maxScore}</span>
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '4px 0' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nilai Konversi (0-100)</span>
                <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>
                  {convertedScore}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={handleSave}
            >
              <HiOutlineCheck /> Simpan Penilaian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
