<template>
  <div>
    <h1>Counter: {{ counter.count }}</h1>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment()">Increment</button>
    <button @click="counter.decrement()">Decrement</button>
  </div>
</template>

<script setup>
import { useCounterStore } from "../stores/counter";

const counter = useCounterStore();
</script>
