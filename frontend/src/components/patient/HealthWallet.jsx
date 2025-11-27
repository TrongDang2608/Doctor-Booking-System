import { useState } from 'react';
import { walletData, vouchers, loyaltyTiers, pointHistory } from '../../mockData/patient/healthWallet';
import './HealthWallet.css';

const HealthWallet = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | vouchers | points | transactions

  const currentTier = loyaltyTiers.find(tier => 
    walletData.points >= tier.minPoints && 
    (tier.maxPoints === Infinity || walletData.points <= tier.maxPoints)
  ) || loyaltyTiers[0];

  const availableVouchers = vouchers.filter(v => !v.isRedeemed);
  const redeemedVouchers = vouchers.filter(v => v.isRedeemed);

  return (
    <div className="health-wallet">
      <div className="wallet-header">
        <h2>Ví Sức khỏe & Tích điểm</h2>
      </div>

      {/* Overview Cards */}
      <div className="wallet-overview">
        <div className="wallet-card balance">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Số dư</h3>
            <p className="card-value">{walletData.balance.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        </div>

        <div className="wallet-card points">
          <div className="card-icon">⭐</div>
          <div className="card-content">
            <h3>Điểm tích lũy</h3>
            <p className="card-value">{walletData.points.toLocaleString('vi-VN')} điểm</p>
            <p className="card-subtitle">{currentTier.icon} Hạng {currentTier.name}</p>
          </div>
        </div>

        <div className="wallet-card tier">
          <div className="card-icon">{currentTier.icon}</div>
          <div className="card-content">
            <h3>Hạng thành viên</h3>
            <p className="card-value">{currentTier.name}</p>
            <p className="card-subtitle">
              {walletData.points < currentTier.maxPoints 
                ? `Còn ${(currentTier.maxPoints - walletData.points).toLocaleString('vi-VN')} điểm để lên hạng tiếp theo`
                : 'Đã đạt hạng cao nhất'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="wallet-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </button>
        <button
          className={`tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
          onClick={() => setActiveTab('vouchers')}
        >
          Voucher ({availableVouchers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          Điểm tích lũy
        </button>
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Lịch sử giao dịch
        </button>
      </div>

      {/* Tab Content */}
      <div className="wallet-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="loyalty-benefits">
              <h3>Quyền lợi hạng {currentTier.name}</h3>
              <ul>
                {currentTier.benefits.map((benefit, idx) => (
                  <li key={idx}>✓ {benefit}</li>
                ))}
              </ul>
            </div>

            <div className="quick-actions">
              <h3>Thao tác nhanh</h3>
              <div className="action-buttons">
                <button className="action-btn">Nạp tiền</button>
                <button className="action-btn">Đổi điểm</button>
                <button className="action-btn">Xem voucher</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="vouchers-content">
            <div className="vouchers-section">
              <h3>Voucher có sẵn</h3>
              <div className="vouchers-grid">
                {availableVouchers.map((voucher) => (
                  <div key={voucher.id} className="voucher-card">
                    <div className="voucher-header">
                      <h4>{voucher.title}</h4>
                      {voucher.discountType === 'percentage' ? (
                        <span className="voucher-discount">-{voucher.discountValue}%</span>
                      ) : (
                        <span className="voucher-discount">-{voucher.discountValue.toLocaleString('vi-VN')} VNĐ</span>
                      )}
                    </div>
                    <p className="voucher-description">{voucher.description}</p>
                    <div className="voucher-code">
                      <span>Mã: <strong>{voucher.code}</strong></span>
                    </div>
                    {voucher.pointsRequired > 0 && (
                      <div className="voucher-points">
                        Đổi {voucher.pointsRequired} điểm
                      </div>
                    )}
                    <button className="voucher-btn">Sử dụng ngay</button>
                  </div>
                ))}
              </div>
            </div>

            {redeemedVouchers.length > 0 && (
              <div className="vouchers-section">
                <h3>Voucher đã sử dụng</h3>
                <div className="vouchers-grid">
                  {redeemedVouchers.map((voucher) => (
                    <div key={voucher.id} className="voucher-card redeemed">
                      <div className="voucher-header">
                        <h4>{voucher.title}</h4>
                        <span className="redeemed-badge">Đã dùng</span>
                      </div>
                      <p className="voucher-description">{voucher.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'points' && (
          <div className="points-content">
            <div className="points-summary">
              <div className="points-card">
                <h3>Tổng điểm hiện tại</h3>
                <p className="points-value">{walletData.points.toLocaleString('vi-VN')}</p>
              </div>
              <div className="points-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(walletData.points / currentTier.maxPoints) * 100}%`,
                      maxWidth: '100%'
                    }}
                  ></div>
                </div>
                <p>
                  {walletData.points < currentTier.maxPoints 
                    ? `Còn ${(currentTier.maxPoints - walletData.points).toLocaleString('vi-VN')} điểm để lên hạng ${loyaltyTiers[loyaltyTiers.indexOf(currentTier) + 1]?.name || ''}`
                    : 'Đã đạt hạng cao nhất'}
                </p>
              </div>
            </div>

            <div className="points-history">
              <h3>Lịch sử tích điểm</h3>
              <div className="points-list">
                {pointHistory.map((point) => (
                  <div key={point.id} className="point-item">
                    <div className="point-info">
                      <span className="point-type">{point.type === 'earned' ? 'Tích điểm' : 'Sử dụng điểm'}</span>
                      <span className="point-description">{point.description}</span>
                    </div>
                    <div className={`point-amount ${point.type}`}>
                      {point.type === 'earned' ? '+' : ''}{point.points.toLocaleString('vi-VN')} điểm
                    </div>
                    <div className="point-date">
                      {new Date(point.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-content">
            <div className="transactions-list">
              {walletData.transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.type === 'payment' && '💳'}
                    {transaction.type === 'reward' && '🎁'}
                    {transaction.type === 'refund' && '↩️'}
                  </div>
                  <div className="transaction-details">
                    <h4>{transaction.description}</h4>
                    <span className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {transaction.pointsEarned && (
                      <span className="transaction-points">
                        +{transaction.pointsEarned} điểm
                      </span>
                    )}
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'refund' ? '+' : ''}
                    {Math.abs(transaction.amount).toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthWallet;

