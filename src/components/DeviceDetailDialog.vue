<template>
  <q-dialog v-model="show">
    <q-card>
      <q-card-section class="text-h6">Device Details</q-card-section>
      <q-card-section v-if="tank">
        <p><strong>Name:</strong> {{ tank.name }}</p>
        <p><strong>Description:</strong> {{ tank.description }}</p>
        <p><strong>Water Level:</strong> {{ tank.water_level }}%</p>
        <p><strong>Last Update:</strong> {{ tank.last_update }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue'

const props = defineProps({
  tank: Object,
  show: Boolean,
})
</script>
