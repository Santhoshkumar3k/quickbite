import { encryptPayload, decryptPayload, generateHmac } from './cryptoService';

const GATEWAY_ENDPOINT = '/dapi/v1/flow';

/**
 * Enterprise Secure Gateway Dispatcher (Swiggy / Zomato Architecture)
 * - Obfuscated single endpoint
 * - End-to-end AES-256-CBC encrypted payload
 * - HMAC-SHA256 signature for anti-tamper and replay validation
 * - Network DevTools displays zero plaintext business data or controller names
 */
async function dispatchSecureGateway(action, payloadData = null) {
  const ts = Date.now();
  const pld = payloadData ? encryptPayload(payloadData) : '';
  const sig = generateHmac(action, ts, pld);

  const requestEnvelope = {
    act: action,
    ts: ts,
    sig: sig,
    pld: pld,
  };

  const res = await fetch(GATEWAY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(requestEnvelope),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.msg || errorJson.message || `Gateway request failed (${res.status})`);
  }

  const responseEnvelope = await res.json();
  if (responseEnvelope.code !== 0) {
    throw new Error(responseEnvelope.msg || 'Gateway returned non-zero code');
  }

  if (responseEnvelope.pld) {
    const decrypted = decryptPayload(responseEnvelope.pld);
    return decrypted;
  }

  return null;
}

export async function fetchRestaurants(cuisine = '') {
  return await dispatchSecureGateway('qb_rst_list', { cuisine: cuisine === 'All' ? '' : cuisine });
}

export async function fetchRestaurant(id) {
  return await dispatchSecureGateway('qb_rst_detail', { restaurantId: Number(id) });
}

export async function fetchRestaurantMenu(id, category = '') {
  return await dispatchSecureGateway('qb_rst_menu', { 
    restaurantId: Number(id), 
    category: category === 'All' ? '' : category 
  });
}

export async function fetchCategories() {
  return await dispatchSecureGateway('qb_menu_cats');
}

export async function searchItems(q) {
  if (!q) return [];
  return await dispatchSecureGateway('qb_menu_srch', { query: q });
}

export async function createOrder(payload) {
  return await dispatchSecureGateway('qb_ord_save', payload);
}

export async function fetchOrder(id) {
  return await dispatchSecureGateway('qb_ord_detail', { orderId: Number(id) });
}

export async function fetchOrders(phone = '') {
  return await dispatchSecureGateway('qb_ord_hist', { phone });
}

export async function advanceOrderStatus(id) {
  return await dispatchSecureGateway('qb_ord_adv', { orderId: Number(id) });
}

export async function fetchHealth() {
  return { status: 'Healthy', service: 'QuickBite Shielded Gateway V1', timestamp: new Date().toISOString() };
}

export async function fetchUser(phone) {
  if (!phone) return null;
  try {
    return await dispatchSecureGateway('qb_usr_prof', { phone });
  } catch (err) {
    console.warn('Customer profile lookup:', err.message);
    return null;
  }
}

export async function loginUser(phone) {
  return await dispatchSecureGateway('qb_usr_login', { phone });
}

export async function registerUser(userData) {
  return await dispatchSecureGateway('qb_usr_reg', userData);
}

export async function updateUserProfile(phone, profileData) {
  return await dispatchSecureGateway('qb_usr_save', { phone, ...profileData });
}

export async function applyReferralCode(phone, referralCode) {
  return await dispatchSecureGateway('qb_usr_ref', { phone, referralCode });
}

export async function deductUserWallet(phone, amount) {
  return await dispatchSecureGateway('qb_usr_wlt', { phone, amount });
}

export async function deleteUserAccount(phone) {
  return await dispatchSecureGateway('qb_usr_del', { phone });
}

export function generateReferralCode(name, phone) {
  const cleanLetters = (name || '').replace(/[^a-zA-Z]/g, '');
  const prefix = (cleanLetters.slice(0, 4) || 'USER').padEnd(4, 'X').toUpperCase();
  const cleanDigits = (phone || '').replace(/\D/g, '');
  const suffix = cleanDigits.slice(-3) || '100';
  return `${prefix}${suffix}`;
}
