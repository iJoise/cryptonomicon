<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            v-on:keydown.enter="add(ticker)"
            type="text"
            name="wallet"
            autocomplete="off"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="searchCurrency.length"
          class="flex bg-white p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="currency in searchCurrency"
            :key="currency"
            @click="add(currency)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ currency }}
          </span>
        </div>
        <div v-if="isError" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>
    <add-button @click="add(ticker)" type="button" />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";

export default {
  components: {
    AddButton
  },

  props: {
    tickers: {
      type: Array,
      requierd: true
    }
  },

  emits: {
    "add-ticker": value => typeof value === "string"
  },

  data() {
    return {
      ticker: "",
      isError: false,
      searchCurrency: [],
      allCurrency: []
    };
  },

  methods: {
    add(value) {
      if (value.length === 0) {
        return;
      }
      const findMatchesForTickers = tickerValue => {
        return this.tickers.some(ticker => ticker.name === tickerValue);
      };
      if (findMatchesForTickers(value)) {
        this.isError = true;
        return;
      }

      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
      this.searchCurrency = [];
    }
  },

  created: async function () {
    const result = await fetch(
      `${process.env.VUE_APP_BASE_URL}all/coinlist?summary=true`
    );
    const { Data } = await result.json();
    this.allCurrency.push(...Object.keys(Data));
  },

  watch: {
    ticker(newValue) {
      this.searchCurrency = [];

      if (this.isError) this.isError = false;

      if (newValue.length > 1) {
        const newCurrency = this.allCurrency
          .filter(currency => {
            return currency.toLowerCase().includes(newValue.toLowerCase());
          })
          .sort((a, b) => a.length - b.length)
          .slice(0, 4);
        this.searchCurrency.push(...newCurrency);
      } else {
        this.searchCurrency = [];
      }
    }
  }
};
</script>
