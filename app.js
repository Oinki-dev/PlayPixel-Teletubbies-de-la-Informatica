// Catálogo base por defecto
const defaultGames = [
    { 
        id: 1, 
        title: "Blue Archive", 
        category: "RPG", 
        mechanic: "Mundo Abierto", 
        price: 20.00, 
        verified: true, 
        isAI: false, 
        image: "https://server.wallpaperalchemy.com/storage/wallpapers/519/blue-archive-4k-wallpaper-shiroko-sunaookami-takanashi-hoshino-izayoi-nonomi-kuromi-serika-okusora-ayane.jpg", 
        approved: true, 
        history: new Array(110, 99, 89) 
    },
    { 
        id: 2, 
        title: "Skullgirls", 
        category: "Estrategia", 
        mechanic: "Combate por Turnos", 
        price: 20.00, 
        verified: true, 
        isAI: false, 
        image: "https://static.wikia.nocookie.net/skullgirls-es/images/3/35/Skullgirls_Fanime_Control_Dise%C3%B1o.jpg/revision/latest/scale-to-width-down/1200?cb=20141211235144&path-prefix=es", 
        approved: true, 
        history: new Array(45, 50, 45) 
    },   
    { 
        id: 3, 
        title: "Left 4 dead 3", 
        category: "Indie", 
        mechanic: "Roguelike", 
        price: 2.50, 
        verified: true, 
        isAI: false, 
        image: "https://images.steamusercontent.com/ugc/2273816816208351873/494F9570D4164576C052409C8B374964757D23E9/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true", 
        approved: true, 
        history: new Array(35, 35, 29) 
    },
    { 
        id: 4, 
        title: "Grand Theft Auto VII", 
        category: "Acción", 
        mechanic: "Multijugador Cooperativo", 
        price: 777.00, 
        verified: true, 
        isAI: true, 
        image: "https://areajugones.sport.es/wp-content/uploads/2026/01/gta-7-estados-unidos-1560x880.jpg.webp", 
        approved: true, 
        history: new Array(75, 65, 65) 
    },
    { 
        id: 5, 
        title: "Genshin Impact", 
        category: "RPG", 
        mechanic: "Roguelike", 
        price: 1.00, 
        verified: true, 
        isAI: false, 
        image: "https://webstatic.hoyoverse.com/upload/uploadstatic/contentweb/20210210/2021021012301131386.jpg", 
        approved: true, 
        history: new Array(25, 20, 19) 
    },
    { 
        id: 6, 
        title: "Cuphead", 
        category: "Acción", 
        mechanic: "Mundo Abierto", 
        price: 60.00, 
        verified: true, 
        isAI: false, 
        image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/capsule_616x353.jpg?t=1709068852  ", 
        approved: true, 
        history: new Array(120, 105, 95) 
    }
];


// Cargar datos persistentes desde localStorage para compartir entre index.html, dev.html y admin.html
let games = JSON.parse(localStorage.getItem('playpixel_games')) || defaultGames;
let totalSales = parseFloat(localStorage.getItem('playpixel_sales')) || 0;
let purchaseHistory = JSON.parse(localStorage.getItem('playpixel_history')) || [];
let currentUser = null;
let cart = [];
let wishlist = [];

function saveState() {
    localStorage.setItem('playpixel_games', JSON.stringify(games));
    localStorage.setItem('playpixel_sales', totalSales.toString());
    localStorage.setItem('playpixel_history', JSON.stringify(purchaseHistory));
}

function resetDemoData() {
    localStorage.removeItem('playpixel_games');
    localStorage.removeItem('playpixel_sales');
    localStorage.removeItem('playpixel_history');
    location.reload();
}

// --- LÓGICA DE LA TIENDA (index.html) ---
function renderGames(list) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return; // Si no estamos en index.html, salir

    grid.innerHTML = '';
    const approvedList = list.filter(g => g.approved);
    document.getElementById('resultsCount').textContent = `${approvedList.length} juegos encontrados`;

    approvedList.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-banner">
                <div class="badges">
                    ${game.verified ? '<span class="badge badge-safe">🛡️ Antivirus OK</span>' : ''}
                    ${game.isAI ? '<span class="badge badge-ai">⚠️ Hecho con IA</span>' : '<span class="badge badge-human">✨ 100% Artesanal</span>'}
                </div>
                <img src="${game.image || 'https://picsum.photos'}" alt="${game.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="game-body">
                <div class="game-title">${game.title}</div>
                <div class="game-meta">${game.category} • ${game.mechanic}</div>
                <button class="btn-outline btn-small mb-medium" style="width: fit-content;" onclick="showPriceHistory(${game.id})">📈 Ver histórico de precios</button>
                <div class="game-footer">
                    <span class="price">S/ ${game.price.toFixed(2)}</span>
                    <div class="card-actions">
                        <button class="btn-outline" title="Añadir a deseados" onclick="toggleWishlist(${game.id})">❤️</button>
                        <button class="btn-primary" onclick="addToCart(${game.id})">+ Carrito</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterGames() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const text = searchInput.value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;
    const mech = document.getElementById('mechanicFilter').value;
    const onlyVerified = document.getElementById('verifiedFilter').checked;
    const noAI = document.getElementById('noAiFilter').checked;

    const filtered = games.filter(g => {
        return g.title.toLowerCase().includes(text) &&
               (cat === 'all' || g.category === cat) &&
               (mech === 'all' || g.mechanic === mech) &&
               (!onlyVerified || g.verified) &&
               (!noAI || !g.isAI);
    });

    renderGames(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('mechanicFilter').value = 'all';
    document.getElementById('verifiedFilter').checked = true;
    document.getElementById('noAiFilter').checked = false;
    filterGames();
}

function registerUser() {
    const name = document.getElementById('userNameInput').value.trim();
    const age = parseInt(document.getElementById('userAgeInput').value);
    const msgBox = document.getElementById('authMessage');

    if (!name || isNaN(age)) {
        msgBox.innerHTML = '<div class="alert alert-error">Por favor completa tu nombre y edad.</div>';
        return;
    }
    if (age < 13) {
        msgBox.innerHTML = '<div class="alert alert-error">Restricción de edad: Debes tener al menos 13 años para crear una cuenta.</div>';
        return;
    }

    currentUser = { name, age };
    document.getElementById('authBtn').textContent = `👤 ${name} (${age} años)`;
    msgBox.innerHTML = '';
    closeModal('authModal');
}

function addToCart(id) {
    const game = games.find(g => g.id === id);
    if (!cart.some(item => item.id === id)) {
        cart.push(game);
        updateCartUI();
    }
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    if (!countEl) return;

    countEl.textContent = cart.length;
    const container = document.getElementById('cartItems');
    container.innerHTML = cart.length === 0 ? '<p class="subtitle">Tu carrito está vacío.</p>' : '';
    
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="cart-item-row">
                <span>${item.icon} ${item.title}</span>
                <div>
                    <strong>S/ ${item.price.toFixed(2)}</strong>
                    <button class="btn-outline btn-small" style="margin-left: 8px;" onclick="removeFromCart(${index})">✖</button>
                </div>
            </div>
        `;
    });
    document.getElementById('cartTotal').textContent = `S/ ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) return alert("Agrega al menos un juego al carrito.");
    if (!currentUser) {
        closeModal('cartModal');
        openModal('authModal');
        document.getElementById('authMessage').innerHTML = '<div class="alert alert-info">🔒 Por seguridad, inicia sesión o regístrate antes de completar tu compra.</div>';
        return;
    }

    const method = document.getElementById('paymentMethod').value;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    purchaseHistory.push({ date: new Date().toLocaleString(), items: [...cart], total, method });
    totalSales += total;
    cart = [];
    saveState();
    updateCartUI();
    updateHistoryUI();
    closeModal('cartModal');
    alert(`✅ ¡Compra exitosa con ${method}!\nTu descarga segura ha iniciado en menos de 5 segundos.`);
}

function toggleWishlist(id) {
    const game = games.find(g => g.id === id);
    const exists = wishlist.findIndex(w => w.id === id);
    exists > -1 ? wishlist.splice(exists, 1) : wishlist.push(game);
    
    document.getElementById('wishCount').textContent = wishlist.length;
    const container = document.getElementById('wishlistItems');
    container.innerHTML = wishlist.length === 0 ? '<p class="subtitle">No tienes juegos guardados.</p>' : '';
    wishlist.forEach(w => {
        container.innerHTML += `<div class="cart-item-row"><span>${w.icon} <strong>${w.title}</strong></span><span>S/ ${w.price.toFixed(2)}</span></div>`;
    });
}

function updateHistoryUI() {
    const container = document.getElementById('historyItems');
    if (!container) return;

    container.innerHTML = purchaseHistory.length === 0 ? '<p class="subtitle">Aún no has realizado compras.</p>' : '';
    purchaseHistory.forEach(h => {
        const names = h.items.map(i => i.title).join(', ');
        container.innerHTML += `
            <div class="alert alert-success">
                <strong>Fecha:</strong> ${h.date}<br>
                <strong>Juegos:</strong> ${names}<br>
                <strong>Total:</strong> S/ ${h.total.toFixed(2)} (${h.method})
            </div>
        `;
    });
}

function showPriceHistory(id) {
    const game = games.find(g => g.id === id);
    document.getElementById('priceModalTitle').textContent = `📈 Histórico: ${game.title}`;
    const chart = document.getElementById('priceChartContainer');
    chart.innerHTML = '';
    const months = ['Hace 2 meses', 'Mes pasado', 'Hoy'];
    const max = Math.max(...game.history);

    game.history.forEach((val, i) => {
        const heightPct = (val / max) * 100;
        chart.innerHTML += `
            <div class="chart-bar-col">
                <span style="font-size: 0.8rem; font-weight: bold; margin-bottom: 4px;">S/ ${val}</span>
                <div class="chart-bar" style="height: ${heightPct}%;"></div>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">${months[i]}</span>
            </div>
        `;
    });
    openModal('priceHistoryModal');
}

// --- LÓGICA DEL DESARROLLADOR (dev.html) ---
function uploadGame() {
    const title = document.getElementById('devTitle').value.trim();
    const category = document.getElementById('devCategory').value;
    const mechanic = document.getElementById('devMechanic').value;
    const price = parseFloat(document.getElementById('devPrice').value);
    const isAI = document.getElementById('devAi').checked;

    if (!title || isNaN(price) || price < 0) {
        alert("Completa correctamente los datos del juego.");
        return;
    }

    games.push({
        id: Date.now(),
        title,
        category,
        mechanic,
        price,
        verified: true,
        isAI,
        icon: "🕹️",
        approved: false, // Queda pendiente hasta que el Admin lo apruebe en admin.html
        history: new Array(price, price, price)
    });

    saveState();
    document.getElementById('devTitle').value = '';
    updateDevTable();
    alert("🛡️ Escaneo antivirus completado. Tu juego fue enviado a la bandeja de revisión del Administrador.");
}

function updateDevTable() {
    const tbody = document.getElementById('devTableBody');
    if (!tbody) return; // Si no estamos en dev.html, salir

    tbody.innerHTML = '';
    document.getElementById('statGames').textContent = games.length;
    document.getElementById('statSales').textContent = `S/ ${totalSales.toFixed(2)}`;

    games.forEach(g => {
        tbody.innerHTML += `
            <tr>
                <td>${g.icon} ${g.title}</td>
                <td>${g.category}</td>
                <td>
                    ${g.approved
                        ? '<span style="color: var(--accent);">✅ Aprobado y Publicado</span>'
                        : '<span style="color: var(--warning);">⏳ En revisión por Admin</span>'}
                </td>
                <td>S/ ${g.price.toFixed(2)}</td>
                <td>
                    <button class="btn-outline btn-small" onclick="editPrice(${g.id})">Editar Precio</button>
                </td>
            </tr>
        `;
    });
}

function editPrice(id) {
    const game = games.find(g => g.id === id);
    const newPrice = prompt(`Nuevo precio para ${game.title} (S/):`, game.price);

    if (newPrice && !isNaN(parseFloat(newPrice))) {
        game.price = parseFloat(newPrice);
        game.history[2] = game.price;
        saveState();
        updateDevTable();
    }
}

// --- LÓGICA DEL ADMINISTRADOR (admin.html) ---
function updateAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return; // Si no estamos en admin.html, salir

    tbody.innerHTML = '';
    const approvedCount = games.filter(g => g.approved).length;
    const pendingCount = games.filter(g => !g.approved).length;

    document.getElementById('adminApprovedCount').textContent = approvedCount;
    document.getElementById('adminPendingCount').textContent = pendingCount;
    document.getElementById('statSales').textContent = `S/ ${totalSales.toFixed(2)}`;

    games.forEach(g => {
        tbody.innerHTML += `
            <tr>
                <td>${g.icon} <strong>${g.title}</strong></td>
                <td>${g.category} (${g.mechanic})</td>
                <td>
                    🛡️ Antivirus OK • 
                    ${g.isAI
                        ? '<span style="color: var(--warning);">⚠️ Con IA</span>'
                        : '<span style="color: #38bdf8;">✨ Artesanal</span>'}
                </td>
                <td>S/ ${g.price.toFixed(2)}</td>
                <td>
                    ${g.approved
                        ? '<span style="color: var(--accent);">✅ Publicado</span>'
                        : '<span style="color: var(--warning);">⏳ Pendiente</span>'}
                </td>
                <td>
                    ${!g.approved
                        ? `<button class="btn-accent btn-small" onclick="approveGame(${g.id})">✔ Aprobar</button>`
                        : ''}
                    <button class="btn-outline btn-small" style="border-color: var(--danger); color: #fca5a5;" onclick="rejectGame(${g.id})">✖ Desaprobar</button>
                </td>
            </tr>
        `;
    });
}

function approveGame(id) {
    const game = games.find(g => g.id === id);
    game.approved = true;
    saveState();
    updateAdminTable();
    alert(`✅ "${game.title}" ha sido aprobado y ya es visible en la tienda.`);
}

function rejectGame(id) {
    const game = games.find(g => g.id === id);
    if (confirm(`¿Estás seguro de desaprobar y retirar "${game.title}" del catálogo?`)) {
        games = games.filter(g => g.id !== id);
        saveState();
        updateAdminTable();
    }
}

// Modales
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Inicialización automática según la página abierta
filterGames();
updateCartUI();
updateHistoryUI();
updateDevTable();
updateAdminTable();