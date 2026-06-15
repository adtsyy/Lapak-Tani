import React from 'react';

interface SellerChartsProps {
  revenue: number;
  totalOrders: number;
  completedOrdersCount: number;
  shippedOrdersCount: number;
}

export const SellerCharts: React.FC<SellerChartsProps> = ({
  revenue,
  totalOrders,
  completedOrdersCount,
  shippedOrdersCount
}) => {
  // Mock data for weekly sales
  const salesData = [120000, 250000, 180000, 420000, 310000, 520000, revenue > 0 ? revenue : 350000];
  const maxVal = Math.max(...salesData);
  const minVal = Math.min(...salesData);
  const height = 120;
  const width = 340;
  const padding = 15;

  // Convert points to coordinates for SVG
  const points = salesData.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (salesData.length - 1);
    const y = height - padding - ((val - minVal * 0.5) / (maxVal - minVal * 0.5)) * (height - padding * 2);
    return { x, y, val };
  });

  // Build SVG path string (curved using simple bezier controls)
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  // Path string for closing the area under the curve
  const areaD = `${d} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  // Order distribution calculations (Donut Chart)
  const pendingCount = Math.max(0, totalOrders - completedOrdersCount - shippedOrdersCount);
  const activeCount = shippedOrdersCount;
  const doneCount = completedOrdersCount;
  
  const total = totalOrders || 1;
  const pendPercent = (pendingCount / total) * 100;
  const activePercent = (activeCount / total) * 100;
  const donePercent = (doneCount / total) * 100;

  // Donut values (stroke-dasharray mapping)
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.9
  
  const strokePending = (pendPercent / 100) * circumference;
  const strokeActive = (activePercent / 100) * circumference;
  const strokeDone = (donePercent / 100) * circumference;

  return (
    <div style={styles.container}>
      {/* Revenue Line Chart Card */}
      <div className="glass-card" style={styles.chartCard}>
        <div style={styles.cardHeader}>
          <div>
            <span style={styles.cardSub}>Pendapatan Toko</span>
            <h3 style={styles.cardVal}>Rp {(revenue || 350000).toLocaleString('id-ID')}</h3>
          </div>
          <span className="badge badge-primary">+12.5%</span>
        </div>

        {/* SVG Curve Chart */}
        <div style={styles.chartWrapper}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Shaded Area Under Line */}
            <path d={areaD} fill="url(#chartGrad)" />

            {/* Main Curved Line */}
            <path d={d} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />

            {/* Tooltip Dot on Current Day */}
            <circle cx={points[6].x} cy={points[6].y} r="5" fill="var(--primary)" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        <div style={styles.xAxis}>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
          <span>Min</span>
        </div>
      </div>

      {/* Donut Chart and Stats Panel */}
      <div className="glass-card" style={{ ...styles.chartCard, display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={styles.donutWrapper}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="10" />

            {/* Pending segment (Amber) */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke="var(--warning)" 
              strokeWidth="10" 
              strokeDasharray={`${strokePending} ${circumference}`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />

            {/* Active/Shipped segment (Blue/Primary) */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke="var(--primary-light)" 
              strokeWidth="10" 
              strokeDasharray={`${strokeActive} ${circumference}`}
              strokeDashoffset={-strokePending}
              transform="rotate(-90 50 50)"
            />

            {/* Completed segment (Green/Success) */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke="var(--success)" 
              strokeWidth="10" 
              strokeDasharray={`${strokeDone} ${circumference}`}
              strokeDashoffset={-(strokePending + strokeActive)}
              transform="rotate(-90 50 50)"
            />

            {/* Center label */}
            <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" style={styles.donutCenterVal}>
              {totalOrders}
            </text>
            <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" style={styles.donutCenterLbl}>
              Pesanan
            </text>
          </svg>
        </div>

        <div style={styles.donutLabels}>
          <div style={styles.donutLegendRow}>
            <span style={{ ...styles.donutDot, backgroundColor: 'var(--warning)' }}></span>
            <div style={styles.donutTextCol}>
              <span style={styles.donutLabelName}>Baru / Pending</span>
              <span style={styles.donutLabelVal}>{pendingCount} Pesanan</span>
            </div>
          </div>

          <div style={styles.donutLegendRow}>
            <span style={{ ...styles.donutDot, backgroundColor: 'var(--primary-light)' }}></span>
            <div style={styles.donutTextCol}>
              <span style={styles.donutLabelName}>Dikirim</span>
              <span style={styles.donutLabelVal}>{activeCount} Pesanan</span>
            </div>
          </div>

          <div style={styles.donutLegendRow}>
            <span style={{ ...styles.donutDot, backgroundColor: 'var(--success)' }}></span>
            <div style={styles.donutTextCol}>
              <span style={styles.donutLabelName}>Selesai</span>
              <span style={styles.donutLabelVal}>{doneCount} Pesanan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '20px',
  },
  chartCard: {
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cardSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  cardVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    marginTop: '2px',
  },
  chartWrapper: {
    height: 120,
    margin: '10px 0',
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 8px',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  donutWrapper: {
    width: 100,
    height: 100,
    flexShrink: 0,
  },
  donutCenterVal: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: '1.2rem',
    fill: 'var(--text-main)',
  },
  donutCenterLbl: {
    fontSize: '0.6rem',
    fontWeight: 600,
    fill: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
  },
  donutLabels: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    flex: 1,
  },
  donutLegendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  donutDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  donutTextCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    lineHeight: '1.1',
  },
  donutLabelName: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  donutLabelVal: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  }
};
