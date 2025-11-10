<script lang="ts" setup>
import { filters, filterAPI } from "../apis/filter";
</script>
<template>
  <div class="input-group">
    <span
      class="input-group-text"
      for="top-level-search"
    >Search for courses:</span>
    <input
      id="top-level-search"
      v-model="filters.search"
      class="form-control"
      type="search"
      autocomplete="off"
    >

    <fieldset
      class="ps-2 pe-2"
      style="background-color: var(--bs-tertiary-bg)"
    >
      <legend class="pb-0">
        Semesters offered:
      </legend>
    </fieldset>

    <span
      class="input-group-text"
      for="top-level-sem-1"
    >Sem 1:</span>
    <div class="input-group-text">
      <input
        v-model="filters.sem_1"
        class="form-check-input"
        type="checkbox"
      >
    </div>
    <span
      class="input-group-text"
      for="top-level-sem-2"
    >Sem 2:</span>
    <div class="input-group-text">
      <input
        v-model="filters.sem_2"
        class="form-check-input"
        type="checkbox"
      >
    </div>
    <span
      class="input-group-text"
      for="top-level-sem-summer"
    >Sem Summer:</span>
    <div class="input-group-text">
      <input
        v-model="filters.sem_summer"
        class="form-check-input"
        type="checkbox"
      >
    </div>

    <button
      class="btn btn-outline-secondary"
      @click="filterAPI.clear"
    >
      Clear Filters
    </button>
  </div>
</template>
