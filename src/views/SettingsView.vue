<script setup lang="ts">
import { isTransmission } from '@/config/torrentClient'
import TransmissionSettingsView from './TransmissionSettingsView.vue'
import QBittorrentSettingsView from './QBittorrentSettingsView.vue'

// 根据构建参数选择组件
// Vite 会在构建时进行 Tree Shaking，移除未使用的组件
const SettingsComponent = isTransmission ? TransmissionSettingsView : QBittorrentSettingsView
</script>

<template>
  <component :is="SettingsComponent" />
</template>
