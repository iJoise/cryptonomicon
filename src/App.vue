<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <loader :is-loading="isLoading" />

    <div class="container">
      <add-ticker @add-ticker="add" :tickers="tickers" />

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />

        <filter-tickers
          @prev-page="page = page - 1"
          @next-page="page = page + 1"
          :has-next-page="hasNextPage"
          :page="page"
          :filter="filter"
          @update-filter="filter = $event"
        />

        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <ticker-card @delete-ticker="handleDelete" :ticker="t" />
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <ticker-graph
        v-if="selectedTicker"
        @remove-selectedTicker="selectedTicker = null"
        @max-graph-elements="maxGraphElements = $event"
        :selected-ticker="selectedTicker"
        :graph="graph"
      />
    </div>
  </div>
</template>

<script>
import { subscribeToTickers, unsubscribeToTicker } from "./api/api";
import AddTicker from "./components/AddTicker.vue";
import TickerCard from "@/components/TickerCard";
import TickerGraph from "@/components/TickerGraph";
import Loader from "@/components/Loader";
import FilterTickers from "@/components/FilterTikers";

export default {
  name: "App",

  components: {
    FilterTickers,
    Loader,
    TickerGraph,
    AddTicker,
    TickerCard
  },

  data() {
    return {
      filter: "",
      page: 1,
      isLoading: false,
      tickers: [],
      selectedTicker: null,
      graph: [],
      maxGraphElements: 1
    };
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter(ticker =>
        ticker.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    }
  },

  methods: {
    updateTicker(tickerName, price) {
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
          t.price = price;
        });
    },

    add(value) {
      const currentTicker = {
        name: value,
        price: "-"
      };

      this.tickers = [...this.tickers, currentTicker];

      this.filter = "";
      subscribeToTickers(currentTicker.name, newPrice =>
        this.updateTicker(currentTicker.name, newPrice)
      );
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter(ticker => ticker !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeToTicker(tickerToRemove.name);
    }
  },

  watch: {
    selectedTicker() {
      this.graph = [];
    },

    tickers() {
      localStorage.setItem("cryptonomicon-item", JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      const { pathname } = window.location;
      window.history.pushState(
        null,
        document.title,
        `${pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  },

  created: async function () {
    this.isLoading = true;

    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = +windowData.page;
    }

    const tickersData = localStorage.getItem("cryptonomicon-item");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach(ticker => {
        subscribeToTickers(ticker.name, newPrice =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }

    this.isLoading = false;
  }
};
</script>
