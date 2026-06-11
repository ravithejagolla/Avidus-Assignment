import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  Award, 
  Zap,
  Activity,
  Calendar,
  Users
} from 'lucide-react';

const TaskAnalytics = ({ tasks = [], isAdmin = false, totalUsers = undefined }) => {
  // 1. Basic Counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Average Completion Time Calculation
  const completedWithDuration = tasks.filter(t => t.status === 'Completed' && t.createdAt && t.updatedAt);
  let avgCompletionTimeStr = 'N/A';
  let avgHoursVal = 0;
  
  if (completedWithDuration.length > 0) {
    const totalMs = completedWithDuration.reduce((acc, t) => {
      const duration = new Date(t.updatedAt) - new Date(t.createdAt);
      return acc + (duration > 0 ? duration : 0);
    }, 0);
    const avgMs = totalMs / completedWithDuration.length;
    avgHoursVal = avgMs / (1000 * 60 * 60);
    
    if (avgHoursVal < 1) {
      const avgMins = Math.round(avgMs / (1000 * 60));
      avgCompletionTimeStr = `${avgMins} min${avgMins !== 1 ? 's' : ''}`;
    } else if (avgHoursVal < 24) {
      avgCompletionTimeStr = `${avgHoursVal.toFixed(1)} hr${avgHoursVal.toFixed(1) !== '1.0' ? 's' : ''}`;
    } else {
      const avgDays = avgHoursVal / 24;
      avgCompletionTimeStr = `${avgDays.toFixed(1)} day${avgDays.toFixed(1) !== '1.0' ? 's' : ''}`;
    }
  }

  // 3. Productivity Level & Dynamic Summary Feedback
  let productivityStatus = 'Getting Started';
  let productivityDetails = 'Create and complete tasks to start tracking your performance.';
  let productivityColor = 'var(--text-muted)';

  if (totalTasks > 0) {
    if (completionRate >= 80) {
      productivityStatus = 'Elite Productivity';
      productivityDetails = isAdmin 
        ? 'Outstanding completion rate. System tasks are being resolved exceptionally fast!'
        : 'Amazing work! You are executing tasks with extreme efficiency.';
      productivityColor = 'var(--color-completed)';
    } else if (completionRate >= 50) {
      productivityStatus = 'Steady Progress';
      productivityDetails = isAdmin
        ? 'Tasks are moving at a stable pace. Keep motivating users to check off items!'
        : 'Good steady progress. You are on track to hitting your goals.';
      productivityColor = 'var(--color-secondary)';
    } else if (completionRate > 0) {
      productivityStatus = 'Building Momentum';
      productivityDetails = 'A few tasks are finished. Let\'s clear the pending backlog!';
      productivityColor = 'var(--color-pending)';
    } else {
      productivityStatus = 'Action Required';
      productivityDetails = 'All current tasks are pending. Pick one and make a start!';
      productivityColor = 'var(--color-inactive)';
    }
  }

  // 4. Calculate Task Creations Over Last 7 Days
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyCounts = last7Days.map(day => {
    const dayStr = day.toLocaleDateString([], { weekday: 'short' });
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = tasks.filter(t => {
      const cDate = new Date(t.createdAt || t.timestamp); // fallback for logs/custom types
      return cDate >= day && cDate < nextDay;
    }).length;

    return { label: dayStr, count };
  });

  // 5. SVG Line & Area Chart Mapping Math
  const maxVal = Math.max(...dailyCounts.map(d => d.count), 3); // Minimum scale limit of 3
  
  // Chart dimensions
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const points = dailyCounts.map((d, i) => {
    const x = paddingLeft + i * (chartW / 6);
    const y = (svgHeight - paddingBottom) - (d.count / maxVal) * chartH;
    return { x, y, count: d.count, label: d.label };
  });

  // Draw lines
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = totalTasks > 0 
    ? `${linePath} L ${points[6].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : '';

  // Circular Donut Progress Arc Settings
  const donutRadius = 45;
  const circumference = 2 * Math.PI * donutRadius;
  const strokeOffset = circumference - (completionRate / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Registered Users (Admin Only) */}
        {isAdmin && totalUsers !== undefined && (
          <div className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-secondary)' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Users</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{totalUsers}</div>
            </div>
          </div>
        )}

        {/* Total Tasks */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isAdmin ? 'System Tasks' : 'My Total Tasks'}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{totalTasks}</div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-completed)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Items</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px', color: 'var(--color-completed)' }}>{completedTasks}</div>
          </div>
        </div>

        {/* Pending Items */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-pending)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Backlog</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px', color: 'var(--color-pending)' }}>{pendingTasks}</div>
          </div>
        </div>

        {/* Completion Speed */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-secondary)' }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Completion Speed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px', color: 'var(--color-secondary)' }}>
              {avgCompletionTimeStr}
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Dashboard */}
      <div className="analytics-grid">
        
        {/* Left Card: Donut Circular Progress & Dynamic Insights */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--color-primary)' }} />
            Resolution Rate
          </h3>

          <div style={{ position: 'relative', width: '130px', height: '130px', margin: '8px 0' }}>
            <svg width="100%" height="100%" viewBox="0 0 110 110">
              {/* Glow filter definition */}
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Background circular track */}
              <circle
                cx="55"
                cy="55"
                r={donutRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="8"
              />

              {/* Animated value arc */}
              {totalTasks > 0 && (
                <circle
                  cx="55"
                  cy="55"
                  r={donutRadius}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  filter="url(#glow)"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              )}
            </svg>
            {/* Overlay statistics */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)', lineHeight: 1 }}>{completionRate}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</div>
            </div>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: productivityColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <TrendingUp size={16} />
              {productivityStatus}
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              {productivityDetails}
            </p>
          </div>
        </div>

        {/* Right Card: SVG Area Line Chart */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: 'var(--color-secondary)' }} />
              Activity Trend (Last 7 Days)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} />
              New Tasks
            </span>
          </div>

          {totalTasks === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '180px', color: 'var(--text-muted)' }}>
              No creation activity logged.
            </div>
          ) : (
            <div style={{ width: '100%', position: 'relative' }}>
              <svg width="100%" height="200" viewBox="0 0 500 200" style={{ overflow: 'visible' }}>
                <defs>
                  {/* Area gradient */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Line stroke gradient */}
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>

                {/* Horizontal guide lines */}
                <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                <line x1={paddingLeft} y1={(svgHeight - paddingBottom + paddingTop)/2} x2={svgWidth - paddingRight} y2={(svgHeight - paddingBottom + paddingTop)/2} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                <line x1={paddingLeft} y1={svgHeight - paddingBottom} x2={svgWidth - paddingRight} y2={svgHeight - paddingBottom} stroke="rgba(255,255,255,0.08)" />

                {/* Y-Axis scale tags */}
                <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" fill="var(--text-dark)" fontSize="10">{Math.round(maxVal)}</text>
                <text x={paddingLeft - 10} y={(svgHeight - paddingBottom + paddingTop)/2 + 4} textAnchor="end" fill="var(--text-dark)" fontSize="10">{Math.round(maxVal/2)}</text>
                <text x={paddingLeft - 10} y={svgHeight - paddingBottom + 4} textAnchor="end" fill="var(--text-dark)" fontSize="10">0</text>

                {/* Filled Area */}
                <path
                  d={areaPath}
                  fill="url(#areaGradient)"
                  style={{ transition: 'd 0.8s ease-in-out' }}
                />

                {/* Line Path */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'd 0.8s ease-in-out' }}
                />

                {/* Interactive points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    {/* Glowing highlight */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={7}
                      fill="var(--color-primary)"
                      fillOpacity="0.15"
                    />
                    {/* Primary circle point */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={4}
                      fill="var(--color-primary)"
                      stroke="var(--bg-main)"
                      strokeWidth={2}
                    />
                    
                    {/* Value indicator tooltip */}
                    {p.count > 0 && (
                      <text
                        x={p.x}
                        y={p.y - 8}
                        textAnchor="middle"
                        fill="var(--text-main)"
                        fontSize="10"
                        fontWeight="700"
                        style={{ fontFamily: 'var(--font-primary)' }}
                      >
                        {p.count}
                      </text>
                    )}

                    {/* X-Axis labels */}
                    <text
                      x={p.x}
                      y={svgHeight - paddingBottom + 18}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default TaskAnalytics;
