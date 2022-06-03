<template>
  <div class="mt-2">
    <button
      @click="$emit('prev-page')"
      v-if="page > 1"
      class="inline-flex mr-2 items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      Назад
    </button>
    <button
      @click="$emit('next-page')"
      v-if="hasNextPage"
      class="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      Вперед
    </button>

    <label for="filter" class="block text-sm font-medium text-gray-700 mt-1"
      >Фильтр</label
    >
    <div class="mt-1 relative rounded-md shadow-md max-w-xs">
      <input
        id="filter"
        name="filter"
        type="text"
        :value="filter"
        @input="$emit('update-filter', $event.target.value)"
        class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterTickers",

  props: {
    page: {
      type: Number
    },
    hasNextPage: {
      type: Boolean
    },
    filter: {
      type: String
    }
  },

  emits: {
    "prev-page": null,
    "next-page": null,
    "update-filter": value => typeof value === "string"
  }
};
</script>
