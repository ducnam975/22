// Chart
let chart = null;

function renderChart() {
  const rows = loadReqs();
  const counts = { open: 0, in_progress: 0, done: 0 };
  
  rows.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
  
  const ctx = el('chartStatus').getContext('2d');
  if (chart) chart.destroy();
  
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Mới', 'Đang xử lý', 'Hoàn tất'],
      datasets: [{
        data: [counts.open, counts.in_progress, counts.done],
        backgroundColor: ['#ffc107', '#0d6efd', '#198754']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}