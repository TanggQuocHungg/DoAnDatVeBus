import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripRes, seatRes] = await Promise.all([
          api.get(`/trips/${id}`),
          api.get(`/seats?trip=${id}`)
        ]);
        setTrip(tripRes.data.data);
        setSeats(seatRes.data.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeat(selectedSeat?._id === seat._id ? null : seat);
  };

  const handleBooking = async () => {
    if (!selectedSeat) return alert('Vui lòng chọn 1 ghế');
    if (!localStorage.getItem('token')) {
      alert('Vui lòng đăng nhập để đặt vé');
      return navigate('/login');
    }

    try {
      // Gọi API Đặt vé (BookTicket)
      const ticketRes = await api.post('/tickets/book', {
        trip: id,
        seats: [selectedSeat._id], // Backend yêu cầu Array []
        totalAmount: trip.price    // Backend yêu cầu Number
      });

      const ticketId = ticketRes.data.data._id;
      
      // GỌi API Thanh toán tự động luôn cho xịn
      const paymentRes = await api.post('/payments', {
        ticket: ticketId,
        amount: trip.price,
        method: 'MOMO'
      });

      // Update thanh toán thành công -> Kích hoạt mảng Ticket tự đổi Confirmed
      await api.put(`/payments/${paymentRes.data.data._id}`, { status: 'SUCCESS' });

      alert('🎉 Đặt vé và thanh toán thành công!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi đặt vé');
    }
  };

  if (loading) return <div style={{textAlign: 'center', margin: '100px'}}>Đang xếp ghế...</div>;
  if (!trip) return <div>Không tìm thấy chuyến đi</div>;

  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      
      {/* Sơ đồ ghế */}
      <div className="glass-panel" style={{ flex: '2', padding: '30px', minWidth: '400px' }}>
        <h2 className="text-gradient" style={{ marginBottom: '20px' }}>Sơ đồ ghế ngồi</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--seat-available)', borderRadius: '4px' }}></div> Còn trống
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--seat-selected)', borderRadius: '4px' }}></div> Đang chọn
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--seat-booked)', borderRadius: '4px' }}></div> Đã đặt
          </div>
        </div>

        <div className="seat-grid">
          {seats.map(seat => {
            let seatClass = 'seat-available';
            if (seat.status !== 'AVAILABLE') seatClass = 'seat-booked';
            if (selectedSeat?._id === seat._id) seatClass = 'seat-selected';

            return (
              <button 
                key={seat._id} 
                className={`seat-button ${seatClass}`}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.seatNumber}
              </button>
            )
          })}
        </div>
      </div>

      {/* Thông tin hóa đơn */}
      <div className="glass-panel" style={{ flex: '1', padding: '30px', minWidth: '300px', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h3 style={{ marginBottom: '20px' }}>Hóa đơn thanh toán</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Ghế đang chọn:</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{selectedSeat ? selectedSeat.seatNumber : 'Chưa chọn'}</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Giá vé:</span>
          <strong>{trip.price.toLocaleString()} đ</strong>
        </div>
        
        <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <span style={{ fontSize: '1.2rem' }}>Tổng cộng:</span>
          <strong style={{ fontSize: '1.5rem', color: '#f59e0b' }}>
            {selectedSeat ? trip.price.toLocaleString() : 0} đ
          </strong>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleBooking}
          disabled={!selectedSeat}
          style={{ opacity: selectedSeat ? 1 : 0.5 }}
        >
          Xác nhận Đặt Vé
        </button>
      </div>

    </div>
  );
}

export default Booking;
