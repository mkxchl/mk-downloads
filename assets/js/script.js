function showAlert (message, type = 'error', onConfirm = null) {
  const modal = document.getElementById('customAlert')
  const box = document.getElementById('alertBox')
  const icon = document.getElementById('alertIcon')
  const title = document.getElementById('alertTitle')
  const msg = document.getElementById('alertMessage')
  const actions = document.getElementById('alertActions')

  icon.className =
    'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'
  actions.innerHTML = ''

  if (type === 'confirm') {
    icon.classList.add('bg-amber-500/20', 'text-amber-500')
    title.innerText = 'Konfirmasi'
    icon.innerHTML = '<i class="fas fa-question-circle text-2xl"></i>'
    actions.innerHTML = `
                    <button id="confirmBtn" class="w-full py-4 rounded-xl font-bold text-sm bg-[#EE1D52] text-white active:scale-95 transition">Ya, Hapus Semua</button>
                    <button onclick="closeAlert()" class="w-full py-2 text-slate-500 text-xs font-bold hover:text-white transition">Batalkan</button>
                `
    document.getElementById('confirmBtn').onclick = () => {
      onConfirm()
      closeAlert()
    }
  } else if (type === 'error') {
    icon.classList.add('bg-[#EE1D52]/20', 'text-[#EE1D52]')
    title.innerText = 'Oops!'
    icon.innerHTML = '<i class="fas fa-times-circle text-2xl"></i>'
    actions.innerHTML = `<button onclick="closeAlert()" class="w-full py-4 rounded-xl font-bold text-sm tiktok-gradient text-white active:scale-95 transition">Mengerti</button>`
  } else {
    icon.classList.add('bg-[#69C9D0]/20', 'text-[#69C9D0]')
    title.innerText = 'Berhasil'
    icon.innerHTML = '<i class="fas fa-check-circle text-2xl"></i>'
    actions.innerHTML = `<button onclick="closeAlert()" class="w-full py-4 rounded-xl font-bold text-sm tiktok-gradient text-white active:scale-95 transition">Keren!</button>`
  }

  msg.innerText = message
  modal.classList.remove('hidden')
  setTimeout(() => {
    modal.classList.add('opacity-100')
    box.classList.remove('scale-90')
    box.classList.add('scale-100')
  }, 10)
}

function closeAlert () {
  const modal = document.getElementById('customAlert')
  const box = document.getElementById('alertBox')
  modal.classList.remove('opacity-100')
  box.classList.remove('scale-100')
  box.classList.add('scale-90')
  setTimeout(() => modal.classList.add('hidden'), 300)
}

async function forceDownload(url, filename) {
    const container = document.getElementById('downloadProgressContainer');
    const fill = document.getElementById('progressFill');
    const percentText = document.getElementById('progressPercent');
    const sizeText = document.getElementById('progressSize');

    const randomSuffix = Math.floor(Math.random() * 10000);
    const nameParts = filename.split('.');
    const ext = nameParts.pop();
    const finalFilename = `${nameParts.join('.')}_${randomSuffix}.${ext}`;

    container.classList.remove('hidden');
    fill.style.width = '0%';
    percentText.innerText = '0%';
    sizeText.innerText = 'Memulai unduhan...';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengunduh file');
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0; 
        let chunks = []; 
        while(true) {
            const {done, value} = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            if (contentLength) {
                const step = (receivedLength / contentLength) * 100;
                const totalMB = (contentLength / (1024 * 1024)).toFixed(1);
                const currentMB = (receivedLength / (1024 * 1024)).toFixed(1);
                
                fill.style.width = `${step}%`;
                percentText.innerText = `${Math.round(step)}%`;
                sizeText.innerText = `${currentMB} MB / ${totalMB} MB`;
            }
        }
        const blob = new Blob(chunks);
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        container.classList.add('hidden');
        showAlert(`Berhasil diunduh!`, 'success');
    } catch (error) {
        console.error("Download error:", error);
        showAlert('Gagal mengunduh file secara otomatis. Membuka di tab baru.', 'error');
        window.open(url, '_blank');
        container.classList.add('hidden');
    }
}
document.addEventListener('DOMContentLoaded', renderHistory)
function saveToHistory (data) {
  let history = JSON.parse(localStorage.getItem('tikchl_history') || '[]')
  const newItem = {
    id: data.id,
    title: data.title || 'TikTok Content',
    author: data.author.unique_id,
    cover: data.cover,
    date: new Date().toLocaleDateString('id-ID')
  }
  history = history.filter(item => item.id !== data.id)
  history.unshift(newItem)
  localStorage.setItem('tikchl_history', JSON.stringify(history.slice(0, 6)))
  renderHistory()
}

function renderHistory () {
  const list = document.getElementById('historyList')
  const sec = document.getElementById('historySection')
  const history = JSON.parse(localStorage.getItem('tikchl_history') || '[]')
  if (history.length === 0) {
    sec.classList.add('hidden')
    return
  }
  sec.classList.remove('hidden')
  list.innerHTML = history
    .map(
      item => `
                <div class="glass-card p-3 rounded-2xl flex items-center gap-4 hover:border-[#69C9D0]/50 transition group cursor-pointer" onclick="reFetch('${item.id}')">
                    <img src="${item.cover}" class="w-14 h-14 object-cover rounded-lg">
                    <div class="flex-1 text-left overflow-hidden">
                        <p class="text-white font-bold text-xs truncate">@${item.author}</p>
                        <p class="text-slate-500 text-[10px] truncate mb-1">${item.title}</p>
                        <p class="text-[8px] text-[#69C9D0] uppercase font-bold tracking-widest italic">${item.date}</p>
                    </div>
                    <div class="p-2 text-slate-600 group-hover:text-[#69C9D0] transition"><i class="fas fa-chevron-right text-xs"></i></div>
                </div>`
    )
    .join('')
}

function clearHistory () {
  showAlert('Hapus semua riwayat unduhan?', 'confirm', () => {
    localStorage.removeItem('tikchl_history')
    renderHistory()
  })
}

function reFetch (id) {
  document.getElementById(
    'videoUrl'
  ).value = `https://www.tiktok.com/video/${id}`
  fetchContent()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function fetchContent () {
  const url = document.getElementById('videoUrl').value
  const btn = document.getElementById('btnAction')
  const loader = document.getElementById('loader')
  const resultBox = document.getElementById('resultBox')
  const photoGallery = document.getElementById('photoGallery')
  const imageList = document.getElementById('imageList')
  const actionButtons = document.getElementById('actionButtons')

  if (!url) return showAlert('Tempel link TikTok dulu!', 'error')

  btn.disabled = true
  loader.classList.remove('hidden')
  resultBox.classList.add('hidden')
  photoGallery.classList.add('hidden')
  imageList.innerHTML = ''

  try {
    const response = await fetch(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    )
    const res = await response.json()

    if (res.code === 0) {
      const data = res.data
      saveToHistory(data)
      document.getElementById('vCover').src = data.cover
      document.getElementById('vAuthor').innerText = `@${data.author.unique_id}`
      document.getElementById('vTitle').innerText =
        data.title || 'TikTok Content'

      if (data.images && data.images.length > 0) {
        photoGallery.classList.remove('hidden')
        data.images.forEach((img, i) => {
          imageList.innerHTML += `
                                <div onclick="forceDownload('${img}', 'TikChl_Img_${i}.jpg')" class="relative group overflow-hidden rounded-xl aspect-[3/4] glass-card cursor-pointer">
                                    <img src="${img}" class="w-full h-full object-cover">
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <i class="fas fa-download text-white"></i>
                                    </div>
                                </div>`
        })
        actionButtons.innerHTML = `<button onclick="forceDownload('${data.music}', 'TikChl_Audio.mp3')" class="bg-white text-black p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition text-sm"><i class="fas fa-music"></i> Simpan Audio</button>`
      } else {
        actionButtons.innerHTML = `
                            <button onclick="forceDownload('${data.play}', 'TikChl_Video.mp4')" class="bg-[#EE1D52] p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition text-sm shadow-lg shadow-[#EE1D52]/20"><i class="fas fa-video"></i> Video No WM</button>
                            <button onclick="forceDownload('${data.music}', 'TikChl_Audio.mp3')" class="bg-white text-black p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition text-sm"><i class="fas fa-music"></i> Simpan MP3</button>`
      }
      loader.classList.add('hidden')
      resultBox.classList.remove('hidden')
    } else {
      showAlert('Tautan tidak valid atau video privat.', 'error')
      loader.classList.add('hidden')
    }
  } catch (err) {
    showAlert('Gangguan server, coba lagi nanti.', 'error')
    loader.classList.add('hidden')
  } finally {
    btn.disabled = false
  }
}

function MkIg () {
  window.open('https://www.instagram.com/chellgnzxz/', '_blank')
}
function MkTw () {
  window.open('https://x.com/marchel_kvandra', '_blank')
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
