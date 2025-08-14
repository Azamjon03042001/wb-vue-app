import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  config.params = config.params || {};
  // добавляем ключ как query param
  if (!config.params.key) config.params.key = import.meta.env.VITE_API_KEY;
  return config;
});

// Нормализуем разные возможные формы ответа (массив/объект)
function toList(data) {
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.data,
    data?.items,
    data?.rows,
    data?.orders,
    data?.sales,
    data?.incomes,
    data?.stocks,
    data?.data?.orders,
    data?.data?.sales,
    data?.data?.incomes,
    data?.data?.stocks,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  // Фолбэк: взять первый массив верхнего уровня, если есть
  const firstArray = Object.values(data || {}).find((v) => Array.isArray(v));
  return firstArray || [];
}

export async function getOrders({ dateFrom, dateTo, limit = 50, page = 1 }) {
  const { data } = await api.get("/orders", {
    params: { dateFrom, dateTo, limit, page },
  });
  return { raw: data, list: toList(data) };
}

export async function getSales({ dateFrom, dateTo, limit = 50, page = 1 }) {
  const { data } = await api.get("/sales", {
    params: { dateFrom, dateTo, limit, page },
  });
  return { raw: data, list: toList(data) };
}

export async function getIncomes({ dateFrom, dateTo, limit = 50, page = 1 }) {
  const { data } = await api.get("/incomes", {
    params: { dateFrom, dateTo, limit, page },
  });
  return { raw: data, list: toList(data) };
}

// stocks — только за текущий день, принимает ТОЛЬКО dateFrom
export async function getStocks({ dateFrom, limit = 50, page = 1 }) {
  const { data } = await api.get("/stocks", {
    params: { dateFrom, limit, page },
  });
  return { raw: data, list: toList(data) };
}

