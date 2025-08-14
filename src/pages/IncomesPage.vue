<script setup>
import { ref, computed, onMounted } from "vue";
import dayjs from "dayjs";
import { getIncomes } from "../services/api";
import { Bar } from "vue-chartjs";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const today = dayjs().format("YYYY-MM-DD");
const dateFrom = ref(today);
const dateTo = ref(today);
const limit = ref(50);
const page = ref(1);

const loading = ref(false);
const error = ref("");
const raw = ref(null);
const list = ref([]);

const search = ref("");
const sortKey = ref("");
const sortDir = ref("asc");
const keys = computed(() => (list.value[0] ? Object.keys(list.value[0]) : []));

function getDay(r) {
  return (
    r?.last_change_date ||
    (typeof r?.date === "string" ? r.date.slice(0, 10) : "—")
  );
}
function pickNumericKey(rows) {
  const first = rows?.[0] || {};
  const ks = Object.keys(first);
  if (ks.includes("total_price")) return "total_price";
  return ks.find((k) => !Number.isNaN(Number(first[k])));
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { raw: r, list: arr } = await getIncomes({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      limit: limit.value,
      page: page.value,
    });
    raw.value = r;
    list.value = arr;
  } catch (e) {
    error.value = e.message || String(e);
    list.value = [];
  } finally {
    loading.value = false;
  }
}
function prevPage() {
  if (page.value > 1) {
    page.value--;
    load();
  }
}
function nextPage() {
  page.value++;
  load();
}
function toggleSort(k) {
  sortKey.value === k
    ? (sortDir.value = sortDir.value === "asc" ? "desc" : "asc")
    : ((sortKey.value = k), (sortDir.value = "asc"));
}

const rows = computed(() => {
  let arr = list.value;
  const q = search.value.trim().toLowerCase();
  if (q)
    arr = arr.filter((r) =>
      Object.values(r ?? {}).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  if (sortKey.value) {
    const k = sortKey.value,
      dir = sortDir.value === "asc" ? 1 : -1;
    arr = [...arr].sort((a, b) => {
      const va = a?.[k],
        vb = b?.[k];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const na = Number(va),
        nb = Number(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb))
        return (na > nb ? 1 : na < nb ? -1 : 0) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }
  return arr;
});

const chartData = computed(() => {
  const numericKey = pickNumericKey(rows.value);
  const map = new Map();
  for (const r of rows.value) {
    const day = getDay(r);
    const val = numericKey ? Number(r?.[numericKey]) || 0 : 1;
    map.set(day, (map.get(day) ?? 0) + val);
  }
  return {
    labels: [...map.keys()],
    datasets: [
      {
        label: numericKey ? `Сумма по ${numericKey}` : "Количество",
        data: [...map.values()],
      },
    ],
  };
});

onMounted(load);
</script>

<template>
  <div>
    <h2>Incomes</h2>
    <!-- фильтры, таблица, пагинация, debug — такие же как в Sales -->
    <!-- Скопируй блоки из SalesPage.vue и оставь заголовок Incomes -->
    <div class="filters">
      <label>От: <input type="date" v-model="dateFrom" /></label>
      <label>До: <input type="date" v-model="dateTo" /></label>
      <label
        >Limit:
        <select v-model.number="limit">
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="200">200</option>
          <option :value="500">500</option>
        </select>
      </label>
      <input
        class="search"
        placeholder="Поиск…"
        v-model="search"
        @keyup.enter="
          page = 1;
          load();
        "
      />
      <button
        @click="
          page = 1;
          load();
        "
      >
        Применить
      </button>
    </div>

    <p v-if="loading">Загрузка…</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <div v-if="!loading && !error">
      <div class="card">
        <Bar
          :data="chartData"
          :options="{ responsive: true, maintainAspectRatio: false }"
          style="height: 320px"
        />
      </div>
      <p>
        Найдено записей (на этой странице): <b>{{ rows.length }}</b>
      </p>

      <div class="table-wrap" v-if="rows.length">
        <table>
          <thead>
            <tr>
              <th
                v-for="k in keys"
                :key="k"
                class="sortable"
                @click="toggleSort(k)"
              >
                {{ k }} <span v-if="sortKey === k">({{ sortDir }})</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="idx">
              <td v-for="k in keys" :key="k">{{ row?.[k] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagi">
        <button :disabled="page <= 1" @click="prevPage">« Prev</button
        ><span>Page {{ page }}</span
        ><button @click="nextPage">Next »</button>
      </div>
      <details style="margin-top: 12px">
        <summary>Debug response</summary>
        <pre>{{ JSON.stringify(raw, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<style scoped>
/* стили такие же как в SalesPage.vue — можешь скопировать */
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 12px 0;
  align-items: center;
}
.search {
  padding: 6px 10px;
  min-width: 220px;
}
.card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.table-wrap {
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 14px;
}
th,
td {
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}
th.sortable {
  cursor: pointer;
  user-select: none;
}
.pagi {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 10px;
}
button {
  padding: 6px 10px;
}
</style>
