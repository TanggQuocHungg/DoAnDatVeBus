import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';

function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/trips');
        setTrips(res.data.data);
      } catch (err) {
        console.error('Lỗi tải danh sách chuyến:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div style={{textAlign: 'center', margin: '100px'}}>Đang tải dữ liệu chuyến xe...</div>;

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Khám phá các chuyến đi</h2>
        <p style={{ color: 'var(--text-muted)' }}>Đặt vé dễ dàng - Di chuyển nhanh chóng cùng dàn xe Premium hạng sang.</p>
      </div>

      <div className="trip-grid">
        {trips.map(trip => (
          <div key={trip._id} className="glass-panel trip-card">
            <h3>{trip.route?.startStation?.city || 'Hà Nội'} ➔ {trip.route?.endStation?.city || 'Sài Gòn'}</h3>
            
            <p><MapPin size={16} color="var(--primary)"/> Tuyến: {trip.route?.startStation?.name} - {trip.route?.endStation?.name}</p>
            <p><Calendar size={16} color="var(--primary)"/> Ngày đi: {new Date(trip.departureTime).toLocaleDateString('vi-VN')}</p>
            <p><Clock size={16} color="var(--primary)"/> Giờ khởi hành: {new Date(trip.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
            <p><CreditCard size={16} color="var(--primary)"/> Giá vé: <strong style={{color: '#f59e0b', fontSize: '1.2rem', marginLeft: '5px'}}>{trip.price.toLocaleString()} đ</strong></p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
               Xe: {trip.bus?.licensePlate} ({trip.bus?.type})
            </div>

            <button 
              className="btn-primary" 
              style={{ marginTop: '15px' }}
              onClick={() => navigate(`/trips/${trip._id}`)}
              disabled={trip.status !== 'PENDING'}
            >
              {trip.status === 'PENDING' ? 'Chọn Vị Trí Ghế' : 'Đã Khởi Hành'}
            </button>
          </div>
        ))}
        {trips.length === 0 && <p>Hiện không có chuyến xe nào đang mở bán.</p>}
      </div>
    </div>
  );
}

export default Home;
