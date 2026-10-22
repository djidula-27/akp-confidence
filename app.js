const STORAGE_KEY = "crumb-and-co-bakery-v1";
const CURRENCY_CODE = "XOF";
const currency = new Intl.NumberFormat("fr-BJ", { style: "currency", currency: CURRENCY_CODE, maximumFractionDigits: 0 });
const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const isClientInterface = new URLSearchParams(window.location.search).get("interface") === "client";

const productSeed = [
  { id: "milk-bread", name: "Pain au lait", category: "Pains", price: 1500, stock: 18, unit: "pains", emoji: "🍞", color: "wheat" },
  { id: "cinnamon-roll", name: "Roulé à la cannelle", category: "Viennoiseries", price: 500, stock: 24, unit: "pièces", emoji: "🥐", color: "amber" },
  { id: "brioche", name: "Brioche", category: "Pains", price: 2500, stock: 8, unit: "pains", emoji: "🥖", color: "cream" },
  { id: "chocolate-twist", name: "Torsade au chocolat", category: "Viennoiseries", price: 750, stock: 15, unit: "pièces", emoji: "🥨", color: "rose" },
  { id: "butter-croissant", name: "Croissant au beurre", category: "Viennoiseries", price: 500, stock: 4, unit: "pièces", emoji: "🥐", color: "gold" },
  { id: "sweet-bun", name: "Brioche à la vanille", category: "Viennoiseries", price: 400, stock: 21, unit: "pièces", emoji: "🧁", color: "pink" }
];

const ingredientSeed = [
  { id: "flour", name: "Farine de blé", stock: 12400, unit: "g", reorder: 5000, supplier: "Minoterie du Moulin", emoji: "🌾" },
  { id: "milk", name: "Lait entier", stock: 6800, unit: "ml", reorder: 4000, supplier: "Laiterie des Saules", emoji: "🥛" },
  { id: "butter", name: "Beurre de baratte", stock: 1850, unit: "g", reorder: 2000, supplier: "La Crèmerie", emoji: "🧈" },
  { id: "sugar", name: "Sucre de canne", stock: 4600, unit: "g", reorder: 2500, supplier: "Minoterie du Moulin", emoji: "🫙" },
  { id: "yeast", name: "Levure boulangère sèche", stock: 520, unit: "g", reorder: 300, supplier: "Minoterie du Moulin", emoji: "🧂" },
  { id: "eggs", name: "Œufs plein air", stock: 18, unit: "pièces", reorder: 24, supplier: "Ferme des Saules", emoji: "🥚" },
  { id: "cinnamon", name: "Cannelle moulue", stock: 410, unit: "g", reorder: 200, supplier: "Les Épices du Marché", emoji: "🪵" },
  { id: "chocolate", name: "Chocolat noir", stock: 1450, unit: "g", reorder: 800, supplier: "Chocolaterie Artisanale", emoji: "🍫" }
];

const recipes = {
  "milk-bread": { flour: 250, milk: 100, butter: 20, sugar: 25, yeast: 4, eggs: 1 },
  "cinnamon-roll": { flour: 120, milk: 60, butter: 18, sugar: 18, yeast: 2, cinnamon: 3, eggs: 0.5 },
  brioche: { flour: 150, milk: 40, butter: 35, sugar: 20, yeast: 3, eggs: 1 },
  "chocolate-twist": { flour: 100, milk: 40, butter: 12, sugar: 12, yeast: 2, chocolate: 25 },
  "butter-croissant": { flour: 180, milk: 60, butter: 50, sugar: 10, yeast: 3 },
  "sweet-bun": { flour: 100, milk: 40, butter: 12, sugar: 15, yeast: 2, eggs: 0.5 }
};

const seedState = () => ({
  currency: CURRENCY_CODE,
  products: productSeed.map(item => ({ ...item })),
  ingredients: ingredientSeed.map(item => ({ ...item })),
  batches: [
    { id: "B-1024", productId: "cinnamon-roll", quantity: 12, status: "baking", createdAt: new Date(Date.now() - 35 * 60000).toISOString(), createdBy: "Manon Martin" },
    { id: "B-1025", productId: "milk-bread", quantity: 8, status: "planned", createdAt: new Date(Date.now() - 12 * 60000).toISOString(), createdBy: "Manon Martin" },
    { id: "B-1026", productId: "butter-croissant", quantity: 16, status: "planned", createdAt: new Date().toISOString(), createdBy: "Manon Martin" }
  ],
  receipts: [
    {
      id: "R-2841", createdAt: new Date(Date.now() - 24 * 60000).toISOString(), payment: "Carte", customer: "",
      items: [{ productId: "milk-bread", name: "Pain au lait", emoji: "🍞", price: 7.5, quantity: 1 }, { productId: "cinnamon-roll", name: "Roulé à la cannelle", emoji: "🥐", price: 4.25, quantity: 2 }],
      subtotal: 2500, tax: 200, total: 2700
    },
    {
      id: "R-2840", createdAt: new Date(Date.now() - 83 * 60000).toISOString(), payment: "Espèces", customer: "",
      items: [{ productId: "brioche", name: "Brioche", emoji: "🥖", price: 9, quantity: 1 }, { productId: "chocolate-twist", name: "Torsade au chocolat", emoji: "🥨", price: 5, quantity: 1 }],
      subtotal: 3250, tax: 260, total: 3510
    },
    {
      id: "R-2839", createdAt: new Date(Date.now() - 145 * 60000).toISOString(), payment: "Carte", customer: "Camille",
      items: [{ productId: "cinnamon-roll", name: "Roulé à la cannelle", emoji: "🥐", price: 4.25, quantity: 3 }],
      subtotal: 1500, tax: 120, total: 1620
    }
  ],
  customerOrders: [],
  movements: [],
  nextReceipt: 2842,
  nextBatch: 1027,
  nextCustomerOrder: 1
});

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return seedState();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.receipts) || !Array.isArray(parsed.batches)) {
      throw new Error("Les données de la boulangerie enregistrées ont un format invalide.");
    }
    const initial = seedState();
    const productTranslations = new Map(productSeed.map(item => [item.id, item]));
    const ingredientTranslations = new Map(ingredientSeed.map(item => [item.id, item]));
    parsed.products.forEach(item => {
      const translated = productTranslations.get(item.id);
      if (translated) Object.assign(item, { name: translated.name, category: translated.category, unit: translated.unit, price: translated.price });
    });
    parsed.ingredients.forEach(item => {
      const translated = ingredientTranslations.get(item.id);
      if (translated) Object.assign(item, { name: translated.name, unit: translated.unit, supplier: translated.supplier });
    });
    parsed.batches.forEach(batch => {
      if (batch.createdBy === "Maya Lee") batch.createdBy = "Manon Martin";
    });
    parsed.receipts.forEach(receipt => {
      const isLegacyCurrency = parsed.currency !== CURRENCY_CODE;
      receipt.payment = ({ Card: "Carte", Cash: "Espèces", Other: "Autre" })[receipt.payment] || receipt.payment;
      if (receipt.customer === "Sam") receipt.customer = "Camille";
      receipt.items.forEach(item => {
        const translated = productTranslations.get(item.productId);
        if (translated) {
          item.name = translated.name;
          if (isLegacyCurrency) item.price = translated.price;
        }
      });
      if (isLegacyCurrency) {
        receipt.subtotal = Math.round(receipt.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
        receipt.tax = Math.round(receipt.subtotal * 0.08);
        receipt.total = receipt.subtotal + receipt.tax;
      }
    });
    (parsed.movements || []).forEach(movement => {
      if (typeof movement.reason !== "string") return;
      movement.reason = movement.reason
        .replace(/^Sale /, "Vente ")
        .replace(/^Production /, "Production ")
        .replace(/^Stock received$/, "Réception de stock")
        .replace(/^Waste \/ spoilage$/, "Perte / produit périmé")
        .replace(/^Count correction$/, "Correction d'inventaire")
        .replace(/^Other$/, "Autre");
    });
    return { ...initial, ...parsed, customerOrders: Array.isArray(parsed.customerOrders) ? parsed.customerOrders : [], currency: CURRENCY_CODE };
  } catch (error) {
    console.error("Impossible de charger les données de la boulangerie :", error);
    return seedState();
  }
}

let state = loadState();
let currentView = "dashboard";
let posCategory = "Tous les produits";
let posSearch = "";
let cart = {};
let inventoryFilter = "Tout le stock";
let customerCategory = "Tous les produits";
let customerSearch = "";
let lastCustomerOrder = null;

const pageContent = document.getElementById("page-content");
const actionDialog = document.getElementById("action-dialog");
const toastRegion = document.getElementById("toast-region");
const viewNames = { dashboard: "Vue d'ensemble", pos: "Caisse", production: "Production", "online-orders": "Commandes en ligne", inventory: "Stock", receipts: "Tickets" };

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Impossible d'enregistrer les données de la boulangerie :", error);
    notify("Les modifications n'ont pas pu être enregistrées dans ce navigateur.", true);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function money(value) { return currency.format(value); }
function formatQuantity(value) { return numberFormat.format(value); }
function itemCountLabel(quantity) { return `${quantity} ${quantity === 1 ? "article" : "articles"}`; }
function unitLabel(quantity, unit) {
  if (unit === "pièces") return quantity === 1 ? "pièce" : "pièces";
  if (unit === "pains") return quantity === 1 ? "pain" : "pains";
  return unit;
}
function productById(id) { return state.products.find(product => product.id === id); }
function ingredientById(id) { return state.ingredients.find(ingredient => ingredient.id === id); }
function isLowStock(item) { return item.stock <= (item.reorder ?? 5); }
function dateTime(date) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
function dateShort(date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
function todayKey(date = new Date()) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
function receiptsToday() { return state.receipts.filter(receipt => todayKey(new Date(receipt.createdAt)) === todayKey()); }
function todaySales() { return receiptsToday().reduce((sum, receipt) => sum + receipt.total, 0); }
function navAlertCount() {
  return state.ingredients.filter(isLowStock).length + state.products.filter(product => product.stock <= 5).length;
}

function weeklySales() {
  const today = new Date();
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { date, current: 0, previous: 0 };
  });
  state.receipts.forEach(receipt => {
    const saleDate = new Date(receipt.createdAt);
    const dayIndex = Math.floor((new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate()) - monday) / 86400000);
    if (dayIndex >= 0 && dayIndex < 7) days[dayIndex].current += receipt.total;
    else {
      const previousDate = new Date(monday);
      previousDate.setDate(monday.getDate() - 7);
      const previousIndex = Math.floor((new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate()) - previousDate) / 86400000);
      if (previousIndex >= 0 && previousIndex < 7) days[previousIndex].previous += receipt.total;
    }
  });
  return days;
}

function notify(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function render() {
  if (isClientInterface) {
    renderClient();
    return;
  }
  document.getElementById("page-crumb").textContent = viewNames[currentView];
  document.getElementById("today-label").textContent = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date());
  document.getElementById("nav-alert-count").textContent = navAlertCount() || "";
  document.getElementById("nav-online-count").textContent = (state.customerOrders || []).filter(order => order.status === "pending").length || "";
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.view === currentView));
  if (currentView === "dashboard") renderDashboard();
  if (currentView === "pos") renderPos();
  if (currentView === "production") renderProduction();
  if (currentView === "online-orders") renderOnlineOrders();
  if (currentView === "inventory") renderInventory();
  if (currentView === "receipts") renderReceipts();
}

function pageHeading(eyebrow, title, subtitle, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}

function renderClient() {
  document.body.classList.add("client-mode");
  document.title = "La boutique — AKP Confidence";
  const categories = ["Tous les produits", ...new Set(state.products.map(product => product.category))];
  const products = state.products.filter(product =>
    (customerCategory === "Tous les produits" || product.category === customerCategory) &&
    product.name.toLocaleLowerCase("fr").includes(customerSearch.toLocaleLowerCase("fr"))
  );
  const cartItems = Object.entries(cart).map(([id, quantity]) => ({ product: productById(id), quantity })).filter(item => item.product);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  pageContent.innerHTML = `
    <div class="storefront">
      <header class="storefront-header">
        <a class="brand storefront-brand" href="#" aria-label="Accueil de la boutique">
          <img class="brand-mark" src="logo.svg" alt="">
          <span class="brand-copy"><strong>AKP Confidence</strong><small>BOULANGERIE ARTISANALE</small></span>
        </a>
        <div class="storefront-header-right"><span><span class="store-dot"></span> Ouvert aujourd'hui</span><a href="${window.location.pathname}">Espace boulangerie ↗</a></div>
      </header>
      ${lastCustomerOrder ? `
        <section class="customer-success" role="status">
          <span class="success-icon">✓</span>
          <div><strong>Merci ${escapeHtml(lastCustomerOrder.customer)} !</strong><p>Votre commande <strong>${escapeHtml(lastCustomerOrder.id)}</strong> est bien enregistrée. Nous vous confirmerons sa préparation par téléphone au ${escapeHtml(lastCustomerOrder.phone)}.</p><span>Retrait : ${escapeHtml(lastCustomerOrder.pickupLabel)} · Total : ${money(lastCustomerOrder.total)}</span></div>
          <button class="button button-secondary" data-action="dismiss-order">Continuer mes achats</button>
        </section>` : `
        <section class="storefront-hero">
          <div class="hero-copy"><span class="eyebrow">FAIT MAISON, CHAQUE JOUR</span><h1>Un peu de douceur<br>dans votre journée.</h1><p>Pains au lait, brioches et gourmandises préparés avec amour dans notre fournil à Cotonou.</p><a href="#catalogue" class="button button-primary">Découvrir nos produits ↓</a><span class="hero-note">Cuisson du jour · Retrait en boutique</span></div>
          <div class="hero-art" aria-hidden="true"><span class="hero-sun"></span><span class="hero-bread">🥖</span><span class="hero-croissant">🥐</span><span class="hero-sparkle sparkle-one">✦</span><span class="hero-sparkle sparkle-two">✧</span><span class="hero-caption">PÉTRI AVEC AMOUR</span></div>
        </section>`}
      <section class="storefront-catalogue" id="catalogue">
        <div class="storefront-section-heading"><div><span class="eyebrow">LES GOURMANDISES DU FOURNIL</span><h2>Nos incontournables</h2><p>De bonnes choses, fraîchement sorties du four.</p></div><label class="store-search"><span>⌕</span><input id="customer-search" type="search" placeholder="Rechercher..." value="${escapeHtml(customerSearch)}" aria-label="Rechercher un produit"></label></div>
        <div class="store-categories">${categories.map(category => `<button class="filter-tab${customerCategory === category ? " active" : ""}" data-customer-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div>
        <div class="store-product-grid">${products.length ? products.map(product => `
          <article class="store-product-card">
            <div class="store-product-art"><span>${product.emoji}</span>${product.stock < 1 ? '<small class="sold-out-tag">Épuisé</small>' : ""}</div>
            <div class="store-product-info"><div><h3>${escapeHtml(product.name)}</h3><p>Préparé chaque matin dans notre fournil.</p></div><div class="store-product-bottom"><strong>${money(product.price)}</strong><button class="button button-primary" data-customer-add="${escapeHtml(product.id)}" ${product.stock < 1 ? "disabled" : ""} aria-label="Ajouter ${escapeHtml(product.name)} au panier">＋ Ajouter</button></div></div>
          </article>`).join("") : '<div class="empty-state">Aucun produit trouvé. Essayez une autre recherche.</div>'}</div>
      </section>
      <section class="customer-order-section">
        <div class="customer-order-heading"><div><span class="eyebrow">SIMPLE COMME BONJOUR</span><h2>Votre commande</h2><p>Commandez en quelques instants, récupérez vos douceurs en boutique.</p></div><span class="cart-count">${itemCount} article${itemCount > 1 ? "s" : ""}</span></div>
        <div class="customer-order-layout">
          <div class="customer-cart">
            ${cartItems.length ? cartItems.map(({ product, quantity }) => `<div class="customer-cart-line"><span class="cart-line-art">${product.emoji}</span><span class="customer-cart-name">${escapeHtml(product.name)}<small>${money(product.price)} l'unité</small></span><span class="quantity-control"><button class="qty-button" data-customer-adjust="${escapeHtml(product.id)}" data-delta="-1" aria-label="Retirer un ${escapeHtml(product.name)}">−</button>${quantity}<button class="qty-button" data-customer-adjust="${escapeHtml(product.id)}" data-delta="1" aria-label="Ajouter un ${escapeHtml(product.name)}">＋</button></span><strong>${money(product.price * quantity)}</strong></div>`).join("") : '<div class="customer-empty-cart">🧺 &nbsp; Votre panier vous attend. Ajoutez vos gourmandises préférées !</div>'}
          </div>
          <aside class="customer-summary">
            <div class="total-row"><span>Sous-total</span><strong>${money(subtotal)}</strong></div>
            <div class="total-row"><span>TVA (taux démo. : 8 %)</span><strong>${money(tax)}</strong></div>
            <div class="total-row grand"><span>Total à régler</span><strong>${money(total)}</strong></div>
            <button class="button button-primary customer-checkout" data-action="customer-checkout" ${itemCount ? "" : "disabled"}>Commander · ${money(total)} →</button>
            <p class="helper-note">Paiement au retrait en boutique. Aucun paiement en ligne n'est effectué.</p>
          </aside>
        </div>
      </section>
      <footer class="storefront-footer"><img class="brand-mark" src="logo.svg" alt=""><div><strong>AKP Confidence</strong><p>Fait avec amour à Cotonou · Retrait en boutique</p></div><a href="${window.location.pathname}">Accès équipe boulangerie</a></footer>
    </div>`;
}

function renderOnlineOrders() {
  const orders = [...(state.customerOrders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const activeCount = orders.filter(order => ["pending", "confirmed", "ready"].includes(order.status)).length;
  const statusText = { pending: "À confirmer", confirmed: "Confirmée", ready: "Prête au retrait", completed: "Terminée", cancelled: "Annulée" };
  const actionMarkup = order => {
    if (order.status === "pending") {
      return `<button class="button button-primary" data-online-order-action="confirm" data-order-id="${escapeHtml(order.id)}">Confirmer</button><button class="button button-secondary" data-online-order-action="cancel" data-order-id="${escapeHtml(order.id)}">Annuler</button>`;
    }
    if (order.status === "confirmed") {
      return `<button class="button button-primary" data-online-order-action="ready" data-order-id="${escapeHtml(order.id)}">Prête au retrait</button><button class="button button-secondary" data-online-order-action="cancel" data-order-id="${escapeHtml(order.id)}">Annuler</button>`;
    }
    if (order.status === "ready") return `<button class="button button-secondary" data-online-order-action="complete" data-order-id="${escapeHtml(order.id)}">Remise au client</button>`;
    return "";
  };
  pageContent.innerHTML = `
    ${pageHeading("COMMANDES DE LA BOUTIQUE EN LIGNE", "Commandes clients", "Suivez les commandes à emporter et préparez-les pour le retrait.", '<button class="button button-secondary" data-action="open-storefront">↗ &nbsp;Ouvrir la boutique</button>')}
    <div class="production-summary"><span class="summary-chip"><strong>${activeCount}</strong> à traiter</span><span class="summary-chip"><strong>${orders.filter(order => order.status === "ready").length}</strong> prêtes au retrait</span><span class="summary-chip"><strong>${orders.length}</strong> au total</span></div>
    <div class="online-orders-list">${orders.length ? orders.map(order => `
      <article class="online-order-card">
        <div class="online-order-top"><div><span class="online-order-number">${escapeHtml(order.id)}</span><span class="status-pill ${order.status === "pending" ? "planned" : order.status === "ready" || order.status === "completed" ? "complete" : order.status === "cancelled" ? "cancelled" : "baking"}">${statusText[order.status] || "À confirmer"}</span><p class="batch-details">${dateShort(order.createdAt)} · Retrait : ${escapeHtml(order.pickupLabel || "À convenir")}</p></div><strong class="online-order-total">${money(order.total)}</strong></div>
        <div class="online-customer"><strong>${escapeHtml(order.customer)}</strong><a href="tel:${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a>${order.note ? `<p>${escapeHtml(order.note)}</p>` : ""}</div>
        <div class="online-order-items">${order.items.map(item => `<span>${item.quantity} × ${escapeHtml(item.name)}</span>`).join("")}</div>
        <div class="online-order-actions">${actionMarkup(order)}</div>
      </article>`).join("") : '<div class="panel empty-state"><span class="empty-illustration">🛍️</span><strong>Aucune commande en ligne</strong>Les nouvelles commandes passées dans la boutique apparaîtront ici.</div>'}</div>`;
}

function openCustomerCheckout() {
  const items = Object.entries(cart).map(([id, quantity]) => {
    const product = productById(id);
    return product ? { product, quantity } : null;
  }).filter(Boolean);
  if (!items.length) return;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + Math.round(subtotal * 0.08);
  openDialog(`<form class="modal-content customer-checkout-form" id="customer-checkout-form">
    <div class="modal-heading"><div><h2>Finaliser la commande</h2><p>Nous vous contacterons pour confirmer le retrait.</p></div><button type="button" class="modal-close" data-action="close-dialog" aria-label="Fermer">×</button></div>
    <div class="field"><label for="order-customer">Votre nom</label><input id="order-customer" name="customer" autocomplete="name" maxlength="60" required placeholder="Nom et prénom"></div>
    <div class="field"><label for="order-phone">Téléphone</label><input id="order-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" minlength="6" maxlength="20" required placeholder="+229 01 00 00 00 00"><span class="field-hint">Un numéro pour vous prévenir quand votre commande sera prête.</span></div>
    <div class="field"><label for="order-pickup">Quand souhaitez-vous passer ?</label><select id="order-pickup" name="pickup" required><option value="Dès que possible">Dès que possible</option><option value="Dans 30 minutes">Dans 30 minutes</option><option value="Dans 1 heure">Dans 1 heure</option><option value="Demain">Demain</option></select></div>
    <div class="field"><label for="order-note">Un petit mot <span style="font-weight:400;color:#999">(facultatif)</span></label><input id="order-note" name="note" maxlength="160" placeholder="Précisions pour la boulangerie"></div>
    <div class="receipt-paper"><div class="total-row"><span>${items.reduce((sum, item) => sum + item.quantity, 0)} article(s)</span><strong>${money(total)}</strong></div><p class="field-hint">Paiement en boutique, au moment du retrait.</p></div>
    <div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-dialog">Retour au panier</button><button type="submit" class="button button-primary">Envoyer ma commande</button></div>
  </form>`);
}

function submitCustomerOrder(formData) {
  const items = Object.entries(cart).map(([id, quantity]) => {
    const product = productById(id);
    return product ? { product, quantity } : null;
  }).filter(Boolean);
  if (!items.length || items.some(item => item.quantity > item.product.stock)) {
    notify("Certains produits ne sont plus disponibles en quantité suffisante. Vérifiez votre panier.", true);
    closeDialog();
    cart = {};
    renderClient();
    return;
  }
  const customer = String(formData.get("customer") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!customer || !/^[+0-9 -]{6,20}$/.test(phone)) {
    notify("Veuillez saisir votre nom et un numéro de téléphone valide.", true);
    return;
  }
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08);
  const order = {
    id: `WEB-${String(state.nextCustomerOrder++).padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
    customer,
    phone,
    pickupLabel: String(formData.get("pickup")),
    note: String(formData.get("note") || "").trim(),
    status: "pending",
    subtotal,
    tax,
    total: subtotal + tax,
    items: items.map(({ product, quantity }) => ({ productId: product.id, name: product.name, emoji: product.emoji, price: product.price, quantity }))
  };
  items.forEach(({ product, quantity }) => {
    product.stock -= quantity;
    state.movements.unshift({ id: `M-${Date.now()}-${product.id}`, itemId: product.id, itemType: "product", change: -quantity, reason: `Commande en ligne ${order.id}`, createdAt: order.createdAt });
  });
  state.customerOrders.unshift(order);
  lastCustomerOrder = order;
  cart = {};
  persist();
  closeDialog();
  renderClient();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleCustomerOrderAction(orderId, action) {
  const order = state.customerOrders.find(item => item.id === orderId);
  if (!order) return;
  const transitions = { confirm: ["pending", "confirmed"], ready: ["confirmed", "ready"], complete: ["ready", "completed"] };
  if (action === "cancel" && ["pending", "confirmed"].includes(order.status)) {
    order.items.forEach(item => {
      const product = productById(item.productId);
      if (!product) return;
      product.stock += item.quantity;
      state.movements.unshift({ id: `M-${Date.now()}-${product.id}`, itemId: product.id, itemType: "product", change: item.quantity, reason: `Annulation ${order.id}`, createdAt: new Date().toISOString() });
    });
    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    persist();
    renderOnlineOrders();
    notify(`Commande ${order.id} annulée, stock réintégré.`);
    return;
  }
  const transition = transitions[action];
  if (!transition || order.status !== transition[0]) return;
  order.status = transition[1];
  order.updatedAt = new Date().toISOString();
  persist();
  renderOnlineOrders();
  notify(action === "confirm" ? "Commande confirmée." : action === "ready" ? "Le client peut venir retirer sa commande." : "Commande remise au client.");
}

function renderDashboard() {
  const lowIngredients = state.ingredients.filter(isLowStock);
  const lowProducts = state.products.filter(product => product.stock <= 5);
  const lowStock = [...lowIngredients, ...lowProducts];
  const sales = todaySales();
  const receiptCount = receiptsToday().length;
  const bakeCount = state.batches.filter(batch => batch.status === "baking").length;
  const weekBars = weeklySales();
  const maxWeeklySales = Math.max(1, ...weekBars.flatMap(day => [day.current, day.previous]));
  const weekDayNames = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const schedule = [...state.batches].sort((a, b) => {
    const rank = { baking: 0, planned: 1, complete: 2 };
    return rank[a.status] - rank[b.status] || new Date(a.createdAt) - new Date(b.createdAt);
  }).slice(0, 4);
  pageContent.innerHTML = `
    ${pageHeading(`${new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(new Date()).toUpperCase()}, EN UN CLIN D'ŒIL`, "Bonjour Manon <span aria-hidden=\"true\">✦</span>", "Une belle journée commence avec du bon pain. Voici le programme du jour.", '<button class="button button-primary" data-action="new-order">＋ Nouvelle vente</button>')}
    <div class="stats-grid">
      <article class="stat-card"><span class="stat-icon">CFA</span><div class="stat-title">Ventes du jour</div><div class="stat-value">${money(sales)}</div><div class="stat-note"><span class="stat-change">${receiptCount} ${receiptCount === 1 ? "vente" : "ventes"}</span> aujourd'hui</div></article>
      <article class="stat-card"><span class="stat-icon green">▣</span><div class="stat-title">Commandes du jour</div><div class="stat-value">${receiptCount}</div><div class="stat-note">Tickets créés aujourd'hui</div></article>
      <article class="stat-card"><span class="stat-icon yellow">♨</span><div class="stat-title">Au four</div><div class="stat-value">${bakeCount}</div><div class="stat-note">Fournées en cours</div></article>
      <article class="stat-card"><span class="stat-icon">↗</span><div class="stat-title">Alertes de stock</div><div class="stat-value">${lowStock.length}</div><div class="stat-note">${lowStock.length ? "Certains articles sont à surveiller" : "Les stocks sont au beau fixe"}</div></article>
    </div>
    <div class="dashboard-grid">
      <section class="panel chart-card">
        <div class="panel-heading"><div><h2>Aperçu des ventes</h2><div class="panel-subtitle">Les ventes de la semaine, jour après jour</div></div><select class="select-compact" aria-label="Période du graphique"><option>Cette semaine</option></select></div>
        <div class="sales-chart" aria-label="Ventes enregistrées par jour cette semaine">${weekBars.map(day => `<div class="chart-column${todayKey(day.date) === todayKey() ? " today" : ""}" title="${weekDayNames.format(day.date)} : ${money(day.current)} cette semaine, ${money(day.previous)} la semaine dernière"><div class="chart-bars"><div class="bar secondary" style="height:${Math.max(3, day.previous / maxWeeklySales * 100)}%"></div><div class="bar" style="height:${Math.max(3, day.current / maxWeeklySales * 100)}%"></div></div><span class="chart-label">${weekDayNames.format(day.date)}</span></div>`).join("")}</div>
        <div class="chart-legend"><span class="legend-item"><i class="legend-dot"></i>Cette semaine</span><span class="legend-item"><i class="legend-dot soft"></i>Semaine dernière</span></div>
      </section>
      <section class="panel">
        <div class="panel-heading"><div><h2>Fournées du jour</h2><div class="panel-subtitle">Les bonnes choses qui sortent du four</div></div><button class="text-link" data-view="production">Tout voir →</button></div>
        <div class="schedule-list">${schedule.length ? schedule.map(batch => {
          const product = productById(batch.productId);
          return `<div class="schedule-item"><span class="schedule-time">${dateTime(batch.createdAt)}</span><span class="product-emoji">${product?.emoji || "🥖"}</span><div><div class="schedule-name">${escapeHtml(product?.name || "Produit boulanger")}</div><div class="schedule-meta">${batch.quantity} ${unitLabel(batch.quantity, product?.unit || "pièces")} · Fournée ${escapeHtml(batch.id)}</div></div><span class="status-pill ${batch.status}">${batch.status === "baking" ? "Au four" : batch.status === "planned" ? "En attente" : "Prête"}</span></div>`;
        }).join("") : '<div class="empty-state">Aucune fournée prévue pour le moment.</div>'}</div>
      </section>
    </div>
    <div class="dashboard-lower">
      <section class="panel">
        <div class="panel-heading"><div><h2>Dernières ventes</h2><div class="panel-subtitle">Un aperçu des passages en caisse</div></div><button class="text-link" data-view="receipts">Tous les tickets →</button></div>
        ${state.receipts.slice(0, 3).map(receipt => `<div class="recent-row"><div><div class="receipt-id">${escapeHtml(receipt.id)}</div><div class="receipt-meta">${dateTime(receipt.createdAt)} · ${itemCountLabel(receipt.items.reduce((sum, item) => sum + item.quantity, 0))}</div></div><span class="receipt-meta">${escapeHtml(receipt.payment)}</span><span class="receipt-amount">${money(receipt.total)}</span></div>`).join("") || '<div class="empty-stock">Aucun ticket pour le moment. Votre première vente apparaîtra ici.</div>'}
      </section>
      <section class="panel">
        <div class="panel-heading"><div><h2>À réapprovisionner</h2><div class="panel-subtitle">Un petit rappel avant la rupture de stock</div></div><button class="text-link" data-view="inventory">Voir le stock →</button></div>
        ${lowStock.slice(0, 3).map(item => {
          const unit = unitLabel(item.stock, item.unit);
          return `<div class="low-stock-row"><div><div class="low-stock-name">${item.emoji || "📦"} &nbsp;${escapeHtml(item.name)}</div><div class="low-stock-note">${formatQuantity(item.stock)} ${unit} en stock</div></div><span class="stock-tag">Stock bas</span></div>`;
        }).join("") || '<div class="empty-stock">Tout est en stock. Beau travail !</div>'}
      </section>
    </div>`;
}

function renderPos() {
  const categories = ["Tous les produits", ...new Set(state.products.map(product => product.category))];
  const visibleProducts = state.products.filter(product =>
    (posCategory === "Tous les produits" || product.category === posCategory) &&
    product.name.toLowerCase().includes(posSearch.toLowerCase())
  );
  const cartItems = Object.entries(cart).map(([id, quantity]) => ({ product: productById(id), quantity })).filter(item => item.product);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + tax;
  pageContent.innerHTML = `
    ${pageHeading("EN CAISSE", "Point de vente", "Ajoutez les produits au panier et encaissez vos ventes.", '<button class="button button-secondary" data-view="receipts">≡ &nbsp;Tickets</button>')}
    <div class="pos-layout">
      <section class="pos-products">
        <div class="toolbar">
          <div class="search-box"><span class="search-mark">⌕</span><input id="product-search" type="search" placeholder="Rechercher un produit..." value="${escapeHtml(posSearch)}" aria-label="Rechercher des produits"></div>
          <div class="filter-tabs" aria-label="Catégories de produits">${categories.map(category => `<button class="filter-tab${posCategory === category ? " active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div>
        </div>
        <div class="product-grid">${visibleProducts.length ? visibleProducts.map(product => `
          <button class="product-card" data-add-product="${escapeHtml(product.id)}" ${product.stock < 1 ? "disabled" : ""} aria-label="Ajouter ${escapeHtml(product.name)}, ${money(product.price)}, ${product.stock} en stock">
            <span class="product-art">${product.emoji}</span>
            <span class="product-card-copy"><span class="product-card-name">${escapeHtml(product.name)}</span><span class="product-card-foot"><span class="product-card-price">${money(product.price)}</span><span class="product-card-stock">${product.stock} restant${product.stock > 1 ? "s" : ""}</span></span></span>
          </button>`).join("") : '<div class="empty-state">Aucun produit trouvé. Essayez une autre recherche.</div>'}</div>
      </section>
      <aside class="cart-panel">
        <div class="cart-heading"><h2>Commande en cours</h2><span class="cart-count">${itemCountLabel(cartItems.reduce((sum, item) => sum + item.quantity, 0))}</span></div>
        <div class="cart-items">${cartItems.length ? cartItems.map(({ product, quantity }) => `
          <div class="cart-line"><span class="cart-line-art">${product.emoji}</span><span><span class="cart-line-name">${escapeHtml(product.name)}</span><span class="cart-line-price">${money(product.price)} l'unité</span></span><span class="quantity-control"><button class="qty-button" data-cart-adjust="${escapeHtml(product.id)}" data-delta="-1" aria-label="Retirer un(e) ${escapeHtml(product.name)}">−</button>${quantity}<button class="qty-button" data-cart-adjust="${escapeHtml(product.id)}" data-delta="1" aria-label="Ajouter un(e) ${escapeHtml(product.name)}">＋</button></span></div>`).join("") : '<div class="empty-cart"><div><span>🧺</span>Votre panier attend ses premiers produits.</div></div>'}</div>
        <div class="cart-totals">
          <div class="total-row"><span>Sous-total</span><strong>${money(subtotal)}</strong></div>
          <div class="total-row"><span>TVA (taux démo. : 8 %)</span><strong>${money(tax)}</strong></div>
          <div class="total-row grand"><span>Total</span><strong>${money(total)}</strong></div>
          <button class="button button-primary cart-checkout" data-action="checkout" ${cartItems.length ? "" : "disabled"}>Encaisser ${money(total)} <span>→</span></button>
          <p class="helper-note">Le stock est mis à jour après chaque vente.</p>
        </div>
      </aside>
    </div>`;
}

function renderProduction() {
  const queued = state.batches.filter(batch => batch.status === "planned").length;
  const baking = state.batches.filter(batch => batch.status === "baking").length;
  const completed = state.batches.filter(batch => batch.status === "complete").length;
  const action = '<button class="button button-primary" data-action="new-batch">＋ Planifier une fournée</button>';
  const batches = [...state.batches].sort((a, b) => {
    const rank = { baking: 0, planned: 1, complete: 2 };
    return rank[a.status] - rank[b.status] || new Date(b.createdAt) - new Date(a.createdAt);
  });
  pageContent.innerHTML = `
    ${pageHeading("DU PÉTRIN À LA VITRINE", "Production", "Planifiez les fournées, suivez la cuisson et mettez à jour les stocks.", action)}
    <div class="production-summary"><span class="summary-chip"><strong>${queued}</strong> en attente</span><span class="summary-chip"><strong>${baking}</strong> au four</span><span class="summary-chip"><strong>${completed}</strong> terminées</span></div>
    <div class="batch-list">${batches.length ? batches.map(batch => {
      const product = productById(batch.productId);
      const statusLabel = batch.status === "planned" ? "En attente" : batch.status === "baking" ? "Au four" : "Prête";
      const actionButton = batch.status === "planned"
        ? `<button class="button button-secondary" data-batch-action="start" data-batch-id="${escapeHtml(batch.id)}">Enfourner →</button>`
        : batch.status === "baking"
          ? `<button class="button button-primary" data-batch-action="complete" data-batch-id="${escapeHtml(batch.id)}">Marquer comme prête ✓</button>`
          : '<span class="status-pill complete">✓ Ajoutée au stock</span>';
      return `<article class="batch-card"><div class="batch-main"><span class="batch-art">${product?.emoji || "🥖"}</span><div><div class="batch-title">${escapeHtml(product?.name || "Produit boulanger")} <span class="status-pill ${batch.status}">${statusLabel}</span></div><div class="batch-details">Fournée ${escapeHtml(batch.id)} · Prévue le ${dateShort(batch.createdAt)} · ${escapeHtml(batch.createdBy || "Équipe")}</div></div></div><div class="batch-right"><div class="batch-quantity">${batch.quantity}<small>${unitLabel(batch.quantity, product?.unit || "pièces")}</small></div>${actionButton}</div></article>`;
    }).join("") : '<div class="panel empty-state"><span class="empty-illustration">🥖</span><strong>Aucune fournée planifiée</strong>Planifiez une fournée pour lancer la production.</div>'}</div>`;
}

function renderInventory() {
  const ingredientRows = state.ingredients.filter(item => inventoryFilter !== "Stock bas" || isLowStock(item));
  const productRows = state.products.filter(item => inventoryFilter !== "Stock bas" || isLowStock(item));
  const ingredientsLow = state.ingredients.filter(isLowStock).length;
  const productsLow = state.products.filter(isLowStock).length;
  const tabButton = label => `<button class="filter-tab${inventoryFilter === label ? " active" : ""}" data-inventory-filter="${label}">${label}</button>`;
  pageContent.innerHTML = `
    ${pageHeading("EN RÉSERVE", "Stock", "Suivez les ingrédients et gardez la vitrine bien garnie.", '<button class="button button-primary" data-action="adjust-stock">＋ Ajuster le stock</button>')}
    <div class="table-card">
      <div class="table-toolbar"><p>${state.ingredients.length + state.products.length} articles suivis · ${ingredientsLow + productsLow} à surveiller</p><div class="filter-tabs">${tabButton("Tout le stock")}${tabButton("Stock bas")}</div></div>
      <div class="table-group-heading">Ingrédients</div>
      <table class="data-table"><thead><tr><th>Article</th><th>En stock</th><th>Seuil d'alerte</th><th>Fournisseur</th><th></th></tr></thead>
        <tbody>${ingredientRows.length ? ingredientRows.map(item => `<tr><td><div class="table-primary">${item.emoji} &nbsp;${escapeHtml(item.name)}</div><div class="table-secondary">Ingrédient</div></td><td class="stock-cell ${isLowStock(item) ? "low" : "ok"}">${formatQuantity(item.stock)} ${unitLabel(item.stock, item.unit)}</td><td>${formatQuantity(item.reorder)} ${unitLabel(item.reorder, item.unit)}</td><td>${escapeHtml(item.supplier)}</td><td><div class="table-actions">${isLowStock(item) ? '<span class="stock-tag">Bas</span>' : ""}<button class="button button-secondary" data-adjust-item="${escapeHtml(item.id)}" data-item-type="ingredient">Ajuster</button></div></td></tr>`).join("") : '<tr><td colspan="5" class="empty-state">Aucun ingrédient en stock bas.</td></tr>'}</tbody>
      </table>
      <div class="table-group-heading">Produits boulangers</div>
      <table class="data-table"><thead><tr><th>Produit</th><th>En stock</th><th>Seuil d'alerte</th><th>Prix</th><th></th></tr></thead>
        <tbody>${productRows.length ? productRows.map(item => `<tr><td><div class="table-primary">${item.emoji} &nbsp;${escapeHtml(item.name)}</div><div class="table-secondary">${escapeHtml(item.category)}</div></td><td class="stock-cell ${isLowStock(item) ? "low" : "ok"}">${formatQuantity(item.stock)} ${unitLabel(item.stock, item.unit)}</td><td>5 ${unitLabel(5, item.unit)}</td><td>${money(item.price)}</td><td><div class="table-actions">${isLowStock(item) ? '<span class="stock-tag">Bas</span>' : ""}<button class="button button-secondary" data-adjust-item="${escapeHtml(item.id)}" data-item-type="product">Ajuster</button></div></td></tr>`).join("") : '<tr><td colspan="5" class="empty-state">Aucun produit en stock bas.</td></tr>'}</tbody>
      </table>
    </div>`;
}

function renderReceipts() {
  const receipts = [...state.receipts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  pageContent.innerHTML = `
    ${pageHeading("JOURNAL DES VENTES", "Tickets", "Retrouvez toutes les ventes de la boulangerie.", '<button class="button button-primary" data-view="pos">＋ Nouvelle vente</button>')}
    <section class="table-card">
      <div class="table-toolbar"><p>${receipts.length} tickets · ${money(receipts.reduce((sum, receipt) => sum + receipt.total, 0))} de ventes</p></div>
      <table class="data-table"><thead><tr><th>Ticket</th><th>Date et heure</th><th>Articles</th><th>Paiement</th><th>Total</th><th></th></tr></thead>
        <tbody>${receipts.length ? receipts.map(receipt => `<tr><td><button class="receipt-open" data-receipt-id="${escapeHtml(receipt.id)}">${escapeHtml(receipt.id)}</button>${receipt.customer ? `<div class="table-secondary">${escapeHtml(receipt.customer)}</div>` : ""}</td><td>${dateShort(receipt.createdAt)}</td><td>${itemCountLabel(receipt.items.reduce((sum, item) => sum + item.quantity, 0))}</td><td>${escapeHtml(receipt.payment)}</td><td class="table-primary">${money(receipt.total)}</td><td><div class="table-actions"><button class="button button-secondary" data-receipt-id="${escapeHtml(receipt.id)}">Voir</button></div></td></tr>`).join("") : '<tr><td colspan="6" class="empty-state">Aucun ticket pour le moment. Votre première vente apparaîtra ici.</td></tr>'}</tbody>
      </table>
    </section>`;
}

function openDialog(markup) {
  actionDialog.innerHTML = markup;
  actionDialog.showModal();
}

function closeDialog() {
  if (actionDialog.open) actionDialog.close();
}

function receiptMarkup(receipt) {
  return `<div class="receipt-paper">
    <div class="receipt-brand"><strong>AKP Confidence</strong><small>RUE DES SAULES · LE GOÛT DU FAIT MAISON</small></div>
    <div class="receipt-meta-block"><span>Ticket</span><strong>${escapeHtml(receipt.id)}</strong></div>
    <div class="receipt-meta-block"><span>Date</span><span>${dateShort(receipt.createdAt)}</span></div>
    <div class="receipt-meta-block"><span>Paiement</span><span>${escapeHtml(receipt.payment)}</span></div>
    ${receipt.customer ? `<div class="receipt-meta-block"><span>Client</span><span>${escapeHtml(receipt.customer)}</span></div>` : ""}
    <div style="margin-top:12px">${receipt.items.map(item => `<div class="receipt-line"><span>${item.quantity} × ${escapeHtml(item.name)}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join("")}</div>
    <div class="receipt-line"><span>Sous-total</span><span>${money(receipt.subtotal)}</span></div>
    <div class="receipt-line"><span>TVA (taux démo. : 8 %)</span><span>${money(receipt.tax)}</span></div>
    <div class="receipt-line receipt-total"><span>Total</span><span>${money(receipt.total)}</span></div>
    <p class="receipt-thanks">Merci pour votre visite. À bientôt ! ♡</p>
  </div>`;
}

function showReceipt(receipt) {
  if (!receipt) return;
  openDialog(`<div class="modal-content"><div class="modal-heading"><div><h2>Ticket ${escapeHtml(receipt.id)}</h2><p>Votre ticket de caisse</p></div><button class="modal-close" data-action="close-dialog" aria-label="Fermer">×</button></div>${receiptMarkup(receipt)}<div class="modal-actions"><button class="button button-secondary" data-action="close-dialog">Fermer</button><button class="button button-primary" data-action="print-receipt">Imprimer le ticket</button></div></div>`);
}

function addToCart(productId, delta = 1) {
  const product = productById(productId);
  if (!product) return;
  const nextQuantity = (cart[productId] || 0) + delta;
  if (nextQuantity > product.stock) {
    notify(`Il ne reste que ${product.stock} ${unitLabel(product.stock, product.unit)} en stock.`, true);
    return;
  }
  if (nextQuantity <= 0) delete cart[productId];
  else cart[productId] = nextQuantity;
  renderPos();
}

function openCheckout() {
  const items = Object.entries(cart).map(([id, quantity]) => {
    const product = productById(id);
    return product ? { product, quantity } : null;
  }).filter(Boolean);
  if (!items.length) return;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  openDialog(`<form class="modal-content" id="checkout-form">
    <div class="modal-heading"><div><h2>Finaliser la vente</h2><p>Vérifiez les articles avant d'encaisser.</p></div><button type="button" class="modal-close" data-action="close-dialog" aria-label="Fermer">×</button></div>
    <div class="receipt-paper" style="margin-bottom:15px">${items.map(item => `<div class="receipt-line"><span>${item.quantity} × ${escapeHtml(item.product.name)}</span><strong>${money(item.product.price * item.quantity)}</strong></div>`).join("")}<div class="receipt-line"><span>Sous-total et TVA</span><strong>${money(subtotal + tax)}</strong></div></div>
    <div class="field"><label for="payment-method">Mode de paiement</label><select id="payment-method" name="payment"><option>Carte</option><option>Espèces</option><option>Autre</option></select></div>
    <div class="field"><label for="customer-name">Nom du client <span style="font-weight:400;color:#999">(facultatif)</span></label><input id="customer-name" name="customer" maxlength="50" placeholder="Nom à indiquer sur le ticket"></div>
    <div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-dialog">Continuer les achats</button><button type="submit" class="button button-primary">Encaisser · ${money(subtotal + tax)}</button></div>
  </form>`);
}

function completeSale(formData) {
  const items = Object.entries(cart).map(([id, quantity]) => {
    const product = productById(id);
    return product ? { product, quantity } : null;
  }).filter(Boolean);
  if (!items.length || items.some(item => item.quantity > item.product.stock)) {
    notify("Le stock a changé depuis l'ouverture de la caisse. Vérifiez la commande.", true);
    closeDialog();
    render();
    return;
  }
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const receipt = {
    id: `R-${state.nextReceipt++}`,
    createdAt: new Date().toISOString(),
    payment: formData.get("payment"),
    customer: String(formData.get("customer") || "").trim(),
    items: items.map(({ product, quantity }) => ({ productId: product.id, name: product.name, emoji: product.emoji, price: product.price, quantity })),
    subtotal, tax, total: subtotal + tax
  };
  items.forEach(({ product, quantity }) => {
    product.stock -= quantity;
    state.movements.unshift({ id: `M-${Date.now()}-${product.id}`, itemId: product.id, itemType: "product", change: -quantity, reason: `Vente ${receipt.id}`, createdAt: receipt.createdAt });
  });
  state.receipts.unshift(receipt);
  cart = {};
  persist();
  closeDialog();
  render();
  showReceipt(receipt);
}

function openBatchDialog() {
  const availableProducts = state.products;
  openDialog(`<form class="modal-content" id="batch-form">
    <div class="modal-heading"><div><h2>Planifier une fournée</h2><p>Ajoutez une nouvelle fournée au planning de l'équipe.</p></div><button type="button" class="modal-close" data-action="close-dialog" aria-label="Fermer">×</button></div>
    <div class="field"><label for="batch-product">Produit à préparer</label><select id="batch-product" name="productId" required>${availableProducts.map(product => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)}</option>`).join("")}</select></div>
    <div class="field"><label for="batch-quantity">Quantité</label><input id="batch-quantity" name="quantity" type="number" min="1" max="200" step="1" value="12" required><span class="field-hint">Les ingrédients seront déduits du stock lorsque vous marquerez la fournée comme prête.</span></div>
    <div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-dialog">Annuler</button><button type="submit" class="button button-primary">Ajouter au planning</button></div>
  </form>`);
}

function ingredientNeeds(productId, quantity) {
  return Object.entries(recipes[productId] || {}).map(([id, perItem]) => ({ ingredient: ingredientById(id), required: perItem * quantity })).filter(item => item.ingredient);
}

function openStockDialog(itemType, itemId) {
  const items = [
    ...state.ingredients.map(item => ({ ...item, itemType: "ingredient" })),
    ...state.products.map(item => ({ ...item, itemType: "product" }))
  ];
  const selected = itemId ? items.find(item => item.id === itemId && item.itemType === itemType) : items[0];
  if (!selected) return;
  const unitStep = unit => unit === "pcs" || unit === "pieces" || unit === "pièces" || unit === "loaves" || unit === "pains" ? "1" : "0.1";
  openDialog(`<form class="modal-content" id="stock-form" data-item-type="${selected.itemType}" data-item-id="${escapeHtml(selected.id)}">
    <div class="modal-heading"><div><h2>Ajuster le stock</h2><p>Modifiez la quantité d'un produit ou d'un ingrédient.</p></div><button type="button" class="modal-close" data-action="close-dialog" aria-label="Fermer">×</button></div>
    <div class="field"><label for="stock-item">Article</label><select id="stock-item" name="item" required>${items.map(item => `<option value="${item.itemType}:${escapeHtml(item.id)}"${item.id === selected.id && item.itemType === selected.itemType ? " selected" : ""}>${item.itemType === "ingredient" ? "Ingrédient" : "Produit boulanger"} · ${escapeHtml(item.name)}</option>`).join("")}</select></div>
    <div class="receipt-paper" style="margin-bottom:15px"><div class="total-row" style="margin:0"><span>Stock actuel</span><strong id="stock-current">${formatQuantity(selected.stock)} ${unitLabel(selected.stock, selected.unit)}</strong></div></div>
    <div class="field"><label for="stock-change">Variation du stock</label><input id="stock-change" name="change" type="number" step="${unitStep(selected.unit)}" placeholder="Ex. : 12 ou -2" required><span class="field-hint">Saisissez un nombre positif pour ajouter du stock ou négatif pour en retirer. Le stock ne peut pas être inférieur à zéro.</span></div>
    <div class="field"><label for="stock-reason">Motif</label><select id="stock-reason" name="reason" required><option value="Réception de stock">Réception de stock</option><option value="Perte / produit périmé">Perte / produit périmé</option><option value="Correction d'inventaire">Correction d'inventaire</option><option value="Autre">Autre</option></select></div>
    <div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-dialog">Annuler</button><button type="submit" class="button button-primary">Enregistrer</button></div>
  </form>`);
  const form = document.getElementById("stock-form");
  form.dataset.itemType = selected.itemType;
  form.dataset.itemId = selected.id;
}

function adjustStock(form, change, reason) {
  const itemType = form.dataset.itemType;
  const item = itemType === "ingredient" ? ingredientById(form.dataset.itemId) : productById(form.dataset.itemId);
  if (!item || !Number.isFinite(change) || change === 0 || item.stock + change < 0) {
    notify("Saisissez une variation valide qui ne fera pas passer le stock sous zéro.", true);
    return false;
  }
  const isCountable = item.unit === "pcs" || item.unit === "pieces" || item.unit === "pièces" || item.unit === "loaves" || item.unit === "pains";
  if (isCountable && !Number.isInteger(change)) {
    notify("Cet article doit être ajusté en unités entières.", true);
    return false;
  }
  item.stock = Math.round((item.stock + change) * 10) / 10;
  state.movements.unshift({ id: `M-${Date.now()}-${item.id}`, itemId: item.id, itemType, change, reason, createdAt: new Date().toISOString() });
  persist();
  closeDialog();
  render();
  notify("Ajustement du stock enregistré.");
  return true;
}

function handleBatchAction(batchId, action) {
  const batch = state.batches.find(item => item.id === batchId);
  if (!batch) return;
  if (action === "start" && batch.status === "planned") {
    batch.status = "baking";
    batch.startedAt = new Date().toISOString();
    persist();
    render();
    notify("La fournée est au four.");
    return;
  }
  if (action === "complete" && batch.status === "baking") {
    const needs = ingredientNeeds(batch.productId, batch.quantity);
    const short = needs.filter(({ ingredient, required }) => ingredient.stock < required);
    if (short.length) {
      notify(`Stock insuffisant pour terminer cette fournée : ${short.map(item => item.ingredient.name).join(", ")}.`, true);
      return;
    }
    needs.forEach(({ ingredient, required }) => {
      ingredient.stock = Math.round((ingredient.stock - required) * 10) / 10;
      state.movements.unshift({ id: `M-${Date.now()}-${ingredient.id}`, itemId: ingredient.id, itemType: "ingredient", change: -required, reason: `Production ${batch.id}`, createdAt: new Date().toISOString() });
    });
    const product = productById(batch.productId);
    if (!product) {
      notify("Le produit associé à cette fournée n'existe plus.", true);
      return;
    }
    product.stock += batch.quantity;
    state.movements.unshift({ id: `M-${Date.now()}-${product.id}`, itemId: product.id, itemType: "product", change: batch.quantity, reason: `Production ${batch.id}`, createdAt: new Date().toISOString() });
    batch.status = "complete";
    batch.completedAt = new Date().toISOString();
    persist();
    render();
    notify(`Stock mis à jour : +${batch.quantity} ${unitLabel(batch.quantity, product.unit)} de ${product.name}.`);
  }
}

document.addEventListener("click", event => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (isClientInterface && target.dataset.customerCategory) {
    customerCategory = target.dataset.customerCategory;
    return renderClient();
  }
  if (isClientInterface && target.dataset.customerAdd) {
    const product = productById(target.dataset.customerAdd);
    if (!product) return;
    const nextQuantity = (cart[product.id] || 0) + 1;
    if (nextQuantity > product.stock) {
      notify(`Il ne reste que ${product.stock} ${unitLabel(product.stock, product.unit)} en stock.`, true);
      return;
    }
    cart[product.id] = nextQuantity;
    return renderClient();
  }
  if (isClientInterface && target.dataset.customerAdjust) {
    const product = productById(target.dataset.customerAdjust);
    if (!product) return;
    const nextQuantity = (cart[product.id] || 0) + Number(target.dataset.delta);
    if (nextQuantity > product.stock) {
      notify(`Il ne reste que ${product.stock} ${unitLabel(product.stock, product.unit)} en stock.`, true);
      return;
    }
    if (nextQuantity <= 0) delete cart[product.id];
    else cart[product.id] = nextQuantity;
    return renderClient();
  }
  if (isClientInterface && target.dataset.action === "customer-checkout") return openCustomerCheckout();
  if (isClientInterface && target.dataset.action === "dismiss-order") {
    lastCustomerOrder = null;
    return renderClient();
  }
  if (target.dataset.onlineOrderAction) return handleCustomerOrderAction(target.dataset.orderId, target.dataset.onlineOrderAction);
  if (target.dataset.action === "open-storefront") {
    window.open("boutique.html", "_blank", "noopener");
    return;
  }
  if (target.dataset.view) {
    event.preventDefault();
    currentView = target.dataset.view;
    render();
    return;
  }
  if (target.dataset.category) {
    posCategory = target.dataset.category;
    renderPos();
    return;
  }
  if (target.dataset.addProduct) {
    addToCart(target.dataset.addProduct);
    return;
  }
  if (target.dataset.cartAdjust) {
    addToCart(target.dataset.cartAdjust, Number(target.dataset.delta));
    return;
  }
  if (target.dataset.action === "checkout") return openCheckout();
  if (target.dataset.action === "new-order") {
    currentView = "pos";
    render();
    return;
  }
  if (target.dataset.action === "new-batch") return openBatchDialog();
  if (target.dataset.action === "adjust-stock") {
    currentView = "inventory";
    render();
    openStockDialog();
    return;
  }
  if (target.dataset.adjustItem) return openStockDialog(target.dataset.itemType, target.dataset.adjustItem);
  if (target.dataset.inventoryFilter) {
    inventoryFilter = target.dataset.inventoryFilter;
    return renderInventory();
  }
  if (target.dataset.batchAction) return handleBatchAction(target.dataset.batchId, target.dataset.batchAction);
  if (target.dataset.receiptId) return showReceipt(state.receipts.find(receipt => receipt.id === target.dataset.receiptId));
  if (target.dataset.action === "close-dialog") return closeDialog();
  if (target.dataset.action === "print-receipt") return window.print();
});

document.addEventListener("input", event => {
  if (isClientInterface && event.target.id === "customer-search") {
    const cursorPosition = event.target.selectionStart;
    customerSearch = event.target.value;
    renderClient();
    const nextSearch = document.getElementById("customer-search");
    nextSearch.focus();
    nextSearch.setSelectionRange(cursorPosition, cursorPosition);
    return;
  }
  if (event.target.id === "product-search") {
    const cursorPosition = event.target.selectionStart;
    posSearch = event.target.value;
    renderPos();
    const nextSearch = document.getElementById("product-search");
    nextSearch.focus();
    nextSearch.setSelectionRange(cursorPosition, cursorPosition);
  }
});

document.addEventListener("change", event => {
  if (event.target.id !== "stock-item") return;
  const [itemType, itemId] = event.target.value.split(":");
  const item = itemType === "ingredient" ? ingredientById(itemId) : productById(itemId);
  const form = event.target.form;
  if (!item || !form) return;
  form.dataset.itemType = itemType;
  form.dataset.itemId = itemId;
  document.getElementById("stock-current").textContent = `${formatQuantity(item.stock)} ${unitLabel(item.stock, item.unit)}`;
  document.getElementById("stock-change").step = item.unit === "pcs" || item.unit === "pieces" || item.unit === "pièces" || item.unit === "loaves" || item.unit === "pains" ? "1" : "0.1";
});

document.addEventListener("submit", event => {
  if (event.target.id === "customer-checkout-form") {
    event.preventDefault();
    submitCustomerOrder(new FormData(event.target));
    return;
  }
  if (event.target.id === "checkout-form") {
    event.preventDefault();
    completeSale(new FormData(event.target));
    return;
  }
  if (event.target.id === "batch-form") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const quantity = Number(formData.get("quantity"));
    const productId = String(formData.get("productId"));
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 200 || !productById(productId)) {
      notify("Choisissez un produit et une quantité entière comprise entre 1 et 200.", true);
      return;
    }
    state.batches.unshift({ id: `B-${state.nextBatch++}`, productId, quantity, status: "planned", createdAt: new Date().toISOString(), createdBy: "Manon Martin" });
    persist();
    closeDialog();
    currentView = "production";
    render();
    notify("Fournée ajoutée au planning.");
    return;
  }
  if (event.target.id === "stock-form") {
    event.preventDefault();
    const formData = new FormData(event.target);
    adjustStock(event.target, Number(formData.get("change")), String(formData.get("reason")));
  }
});

actionDialog.addEventListener("click", event => {
  if (event.target === actionDialog) closeDialog();
});

window.addEventListener("storage", event => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  state = loadState();
  render();
});

render();
