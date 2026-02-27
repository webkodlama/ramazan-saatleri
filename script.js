const toggle = document.getElementById("calmToggle");
const soundToggle = document.getElementById("soundToggle");
const ambience = document.getElementById("ambience");
const timesList = document.getElementById("timesList");

const ISTANBUL_TIMES = [
  { date: "2026-02-22", sahur: "06:18", iftar: "18:54" },
  { date: "2026-02-23", sahur: "06:16", iftar: "18:55" },
  { date: "2026-02-24", sahur: "06:15", iftar: "18:56" },
  { date: "2026-02-25", sahur: "06:13", iftar: "18:57" },
  { date: "2026-02-26", sahur: "06:12", iftar: "18:58" },
  { date: "2026-02-27", sahur: "06:10", iftar: "19:00" },
  { date: "2026-02-28", sahur: "06:09", iftar: "19:01" },
  { date: "2026-03-01", sahur: "06:07", iftar: "19:02" },
  { date: "2026-03-02", sahur: "06:06", iftar: "19:03" },
  { date: "2026-03-03", sahur: "06:04", iftar: "19:04" },
  { date: "2026-03-04", sahur: "06:03", iftar: "19:05" },
  { date: "2026-03-05", sahur: "06:01", iftar: "19:07" },
  { date: "2026-03-06", sahur: "06:00", iftar: "19:08" },
  { date: "2026-03-07", sahur: "05:58", iftar: "19:09" },
  { date: "2026-03-08", sahur: "05:56", iftar: "19:10" },
  { date: "2026-03-09", sahur: "05:55", iftar: "19:11" },
  { date: "2026-03-10", sahur: "05:53", iftar: "19:12" },
  { date: "2026-03-11", sahur: "05:51", iftar: "19:13" },
  { date: "2026-03-12", sahur: "05:50", iftar: "19:14" },
  { date: "2026-03-13", sahur: "05:48", iftar: "19:15" },
  { date: "2026-03-14", sahur: "05:46", iftar: "19:17" },
  { date: "2026-03-15", sahur: "05:45", iftar: "19:18" },
  { date: "2026-03-16", sahur: "05:43", iftar: "19:19" },
  { date: "2026-03-17", sahur: "05:41", iftar: "19:20" },
  { date: "2026-03-18", sahur: "05:39", iftar: "19:21" },
  { date: "2026-03-19", sahur: "05:38", iftar: "19:22" },
];

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${day} ${MONTHS_TR[month - 1]} ${year}`;
}

function renderTimes() {
  if (!timesList) return;

  const header = document.createElement("div");
  header.className = "time-row header";
  header.innerHTML = "<span>Tarih</span><span>Sahur</span><span>İftar</span>";
  timesList.appendChild(header);

  ISTANBUL_TIMES.forEach((item) => {
    const row = document.createElement("div");
    row.className = "time-row";
    row.innerHTML = `
      <span>${formatDate(item.date)}</span>
      <span class="value">${item.sahur}</span>
      <span class="value">${item.iftar}</span>
    `;
    timesList.appendChild(row);
  });

  const afterRow = document.createElement("div");
  afterRow.className = "time-row";
  afterRow.innerHTML = `
    <span class="muted">20-22 Mart 2026</span>
    <span class="muted">Ramazan sonrası</span>
    <span class="muted">Sahur/iftar yok</span>
  `;
  timesList.appendChild(afterRow);
}

renderTimes();

let audioContext = null;
let ambientNodes = null;

function buildAmbientAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const noise = audioContext.createBufferSource();
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.18;
  }
  noise.buffer = buffer;
  noise.loop = true;

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 650;

  const pad = audioContext.createOscillator();
  pad.type = "sine";
  pad.frequency.value = 174;

  const padGain = audioContext.createGain();
  padGain.gain.value = 0.08;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.value = 0.035;

  const master = audioContext.createGain();
  master.gain.value = 0.35;

  noise.connect(filter).connect(noiseGain).connect(master).connect(audioContext.destination);
  pad.connect(padGain).connect(master);

  noise.start();
  pad.start();

  ambientNodes = { noise, pad, master };
}

function stopAmbientAudio() {
  if (!audioContext || !ambientNodes) return;
  ambientNodes.noise.stop();
  ambientNodes.pad.stop();
  audioContext.close();
  audioContext = null;
  ambientNodes = null;
}

async function toggleAudio() {
  if (!soundToggle) return;

  if (ambience && ambience.src) {
    if (ambience.paused) {
      try {
        await ambience.play();
        soundToggle.textContent = "Sesi Kapat";
        return;
      } catch (err) {
        // Fallback to WebAudio
      }
    } else {
      ambience.pause();
      soundToggle.textContent = "Ambiyansı Dinle";
      return;
    }
  }

  if (!audioContext) {
    buildAmbientAudio();
    soundToggle.textContent = "Sesi Kapat";
  } else {
    stopAmbientAudio();
    soundToggle.textContent = "Ambiyansı Dinle";
  }
}

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("calm");
    toggle.textContent = document.body.classList.contains("calm")
      ? "Ambiyansı Geri Getir"
      : "Ambiyansı Sadeleştir";
  });
}

if (soundToggle) {
  soundToggle.addEventListener("click", toggleAudio);
}
