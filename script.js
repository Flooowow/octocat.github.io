const canvas = document.getElementById('timeline');
const ctx = canvas.getContext('2d');

let startYear = parseInt(document.getElementById('startYear').value);
let endYear = parseInt(document.getElementById('endYear').value);
let scale = parseInt(document.getElementById('scale').value); // années par graduation

let events = [];
let periods = [];

function generateFrise() {
  startYear = parseInt(document.getElementById('startYear').value);
  endYear = parseInt(document.getElementById('endYear').value);
  scale = parseInt(document.getElementById('scale').value);
  drawFrise();
}

function drawFrise() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner la frise
  const totalYears = endYear - startYear;
  const totalGraduations = Math.ceil(totalYears / scale);
  const barHeight = 20;
  const marginTop = 50;

  // Dessiner graduations
  ctx.fillStyle = '#000';
  ctx.font = '10px Arial';

  for (let i = 0; i <= totalGraduations; i++) {
    const year = startYear + i * scale;
    const x = i * (canvas.width - 100) / totalGraduations + 50;

    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(x, marginTop);
    ctx.lineTo(x, marginTop + 300);
    ctx.stroke();

    ctx.fillText(year, x - 15, marginTop - 10);
  }

  // Dessiner périodes
  periods.forEach(p => {
    const startX = (p.start - startYear) / scale * (canvas.width - 100) + 50;
    const endX = (p.end - startYear) / scale * (canvas.width - 100) + 50;
    ctx.fillStyle = p.color;
    ctx.fillRect(startX, marginTop + 30, endX - startX, barHeight);
  });

  // Dessiner événements
  events.forEach(e => {
    const x = (e.year - startYear) / scale * (canvas.width - 100) + 50;
    ctx.fillStyle = '#007bff';
    ctx.beginPath();
    ctx.arc(x, marginTop + 100, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.fillText(e.name, x + 12, marginTop + 105);
  });
}

// Ajouter événement
function addEvent() {
  const name = document.getElementById('eventName').value;
  const year = parseInt(document.getElementById('eventYear').value);
  const imageFile = document.getElementById('eventImage').files[0];

  if (name && year && imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      events.push({ name: name, year: year, image: e.target.result });
      drawFrise();
    };
    reader.readAsDataURL(imageFile);
  } else {
    alert('Veuillez remplir tous les champs pour l\'événement.');
  }
}

// Ajouter période
function addPeriod() {
  const start = parseInt(document.getElementById('periodStart').value);
  const end = parseInt(document.getElementById('periodEnd').value);
  const color = document.getElementById('periodColor').value;

  if (start && end && color) {
    periods.push({ start: start, end: end, color: color });
    drawFrise();
  } else {
    alert('Veuillez remplir tous les champs pour la période.');
  }
}

// Événements de mise à jour du graphique
document.getElementById('startYear').addEventListener('change', generateFrise);
document.getElementById('endYear').addEventListener('change', generateFrise);
document.getElementById('scale').addEventListener('change', generateFrise);

// Initialiser
generateFrise();
