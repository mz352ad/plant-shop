/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Telegram helpers
async function sendTelegramMessage(text) {
  // Option A (functions:config:set telegram.token=... telegram.chat_id=...)
  const cfg = functions.config && functions.config();
  const token = (cfg.telegram && cfg.telegram.token) || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = (cfg.telegram && cfg.telegram.chat_id) || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('Telegram secrets are not set. Skipping notification.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`);
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

exports.notifyNewOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, ctx) => {
    const o = snap.data() || {};
    const id = ctx.params.orderId;

    const name = escapeHtml(o.customer && o.customer.name);
    const phone = escapeHtml(o.customer && o.customer.phone);
    const city = escapeHtml(o.customer && o.customer.city);

    const delivery = escapeHtml(o.delivery && o.delivery.method);
    const address = escapeHtml(o.delivery && o.delivery.address);

    const total = Number(o.total || 0);

    const items = Array.isArray(o.items) ? o.items : [];
    const itemsLines = items
      .map((it, idx) => {
        const n = escapeHtml(it.name);
        const q = Number(it.quantity || 0);
        const p = Number(it.price || 0);
        return `${idx + 1}) ${n} — ${q} × ${p} = ${q * p}`;
      })
      .join('\n');

    const text = [
      `🧾 <b>Нове замовлення</b> #${escapeHtml(String(id).slice(0, 8).toUpperCase())}`,
      '',
      itemsLines || '(позиції відсутні)',
      '',
      `💰 <b>Разом:</b> ${total} грн`,
      '',
      `👤 <b>Ім’я:</b> ${name || '—'}`,
      `📞 <b>Телефон:</b> ${phone || '—'}`,
      city ? `🏙️ <b>Місто:</b> ${city}` : null,
      `🚚 <b>Доставка:</b> ${delivery || '—'}`,
      address ? `📍 <b>Адреса:</b> ${address}` : null,
      o.comment ? `💬 <b>Коментар:</b> ${escapeHtml(o.comment)}` : null,
    ].filter(Boolean).join('\n');

    await sendTelegramMessage(text);
  });
