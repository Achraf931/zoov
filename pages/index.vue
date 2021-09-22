<template>
  <main class="flex h-screen w-full max-w-screen p-5" style="background: rgba(53, 197, 254, 0.025);">
    <div class="w-3/12 p-5 h-full mr-5 custom-box-shadow rounded-xl bg-white">
      <div class="flex items-center justify-between mb-3">
        <input @keyup="searchBike" class="custom-box-shadow w-6/10 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Recherche..." type="search" v-model="search">
        <p @click="createBike" class="cursor-pointer rounded-sm bg-white filter drop-shadow-md flex items-center justify-center text-4xl" style="width: 38px; height: 38px;">+</p>
      </div>
      <p>Filtrer</p>
      <div class="items-center justify-between mb-3 flex-wrap">
        <input @keyup="filterBikes" class="custom-box-shadow appearance-none border w-1/2 mr-2 rounded py-2 mb-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="% Batterie" type="number" min="0" max="100" inputmode="numeric" v-model="battery_level">
        <label class="inline-flex items-center text-xs mr-2">
          <input type="checkbox" @change="filterBikes" v-model="in_order" class="form-checkbox border-gray-700 h-5 w-5 text-blue-600"><span class="ml-2 text-gray-700">En service</span>
        </label>
        <label class="inline-flex items-center text-xs mr-2">
          <input type="checkbox" @change="filterBikes" v-model="status_free" class="form-checkbox border-gray-700 h-5 w-5 text-blue-600"><span class="ml-2 text-gray-700">Libre</span>
        </label>
        <label class="inline-flex items-center text-xs mr-2">
          <input type="checkbox" @change="filterBikes" v-model="status_reserved" class="form-checkbox border-gray-700 h-5 w-5 text-blue-600"><span class="ml-2 text-gray-700">Réservé</span>
        </label>
        <label class="inline-flex items-center text-xs">
          <input type="checkbox" @change="filterBikes" v-model="status_used" class="form-checkbox border-gray-700 h-5 w-5 text-blue-600"><span class="ml-2 text-gray-700">Utilisé</span>
        </label>
      </div>
      <div class="flex justify-between items-center"></div>
      <div class="container-bikes overflow-x-hidden overflow-y-scroll" style="height: calc(100% - 170px)">
        <div :class="{'opacity-100': lat === bike.location.coordinates[1] && long === bike.location.coordinates[0]}" @click="focusBikeMap([bike.location.coordinates[1], bike.location.coordinates[0]])" class="opacity-50 relative bg-white bike custom-box-shadow p-2.5 rounded-md cursor-pointer mb-5" v-for="(bike, index) in bikes" :key="index">
          <p @click="removeBike(bike)" class="absolute text-xs top-2.5 right-2.5">❌</p>
          <div class="flex">
            <p @click="editOrder(bike, false)" v-if="bike.in_order" class="text-sm px-1.5 bg-green-100 rounded-sm text-green-500 mr-2.5">En service</p>
            <p @click="editOrder(bike, true)" v-else class="text-sm px-1.5 bg-red-100 rounded-md text-red-500 mr-2.5">Hors service</p>
            <p @click="editStatus(bike, 2)" v-if="bike.service_status === 1" class="text-sm px-1.5 bg-green-100 rounded-sm text-green-500">Libre</p>
            <p @click="editStatus(bike, 3)" v-else-if="bike.service_status === 2" class="text-sm px-1.5 bg-yellow-100 rounded-md text-yellow-500">Réservé</p>
            <p @click="editStatus(bike, 1)" v-else-if="bike.service_status === 3" class="text-sm px-1.5 bg-red-100 rounded-md text-red-500">Utilisé</p>
          </div>
          <div class="my-2.5">
            <p class="mb-2.5 text-sm">Série: {{ bike.serial_number }}</p>
            <p class="text-sm">Latitude: {{ bike.location.coordinates[1] }}</p>
            <p class="text-sm">Longitude: {{ bike.location.coordinates[0] }}</p>
          </div>
          <div class="w-full flex items-center">
            <img width="100" height="auto" src="https://www.zoov.eu/images/tech/ebike-zone-touch.png" alt="Bike">
            <p class="font-medium text-sm">Batterie: <span :class="{'text-green-500': bike.battery_level >= 80 && bike.battery_level <= 100, 'text-yellow-500': bike.battery_level >= 30 && bike.battery_level <= 79, 'text-red-500': bike.battery_level >= 0 && bike.battery_level <= 29}">{{ bike.battery_level }}%</span></p>
          </div>
        </div>
      </div>
    </div>
    <div id="map" class="w-9/12 h-full custom-box-shadow rounded-xl"></div>
  </main>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import { mapMutations, mapGetters } from 'vuex'

export default {
  data() {
    return {
      map: {},
      search: '',
      battery_level: '',
      in_order: false,
      status_free: false,
      status_reserved: false,
      status_used: false,
      lat: 2.37085,
      long: 48.6566
    }
  },
  watch: {
    bikes() {
      this.addBikes()
    }
  },
  computed: {
    ...mapGetters({
      bikes: 'bikes/getBikes',
      total: 'bikes/getTotal'
    })
  },
  async fetch() {
    await this.$store.dispatch('bikes/getBikes')
  },
  beforeMount() {
    this.$store.dispatch('bikes/getBikes')
  },
  mounted() {
    this.$nextTick(() => {
      this.createMap()
    })
  },
  ...mapMutations(['bikes/getBikes']),
  methods: {
    createMap() {
      mapboxgl.accessToken = process.env.access_token
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 11,
        center: [this.lat, this.long]
      })

      setTimeout(() => {
        this.addBikes()
      }, 500)
    },
    addBikes() {
      document.querySelectorAll('.marker').forEach(marker => {
        marker.remove()
      })

      this.bikes.forEach(bike => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker(el)
          .setLngLat([bike.location.coordinates[1], bike.location.coordinates[0]])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(
                `<div class="relative">
          <div class="my-2.5">
            <p class="mb-2.5 text-sm">Série: ${bike.serial_number}</p>
            <p class="text-sm">Latitude: ${bike.location.coordinates[1]}</p>
            <p class="text-sm">Longitude: ${bike.location.coordinates[0]}</p>
          </div>
          <div class="w-full flex items-center">
            <img width="100" height="auto" src="https://www.zoov.eu/images/tech/ebike-zone-touch.png" alt="Bike">
            <p class="font-medium text-sm">Batterie: ${bike.battery_level}%</p>
          </div>
        </div>`
              )
          )
          .addTo(this.map);
      })
    },
    focusBikeMap(coords) {
      this.lat = coords[0]
      this.long = coords[1]
      this.map.setCenter(coords)
    },
    createBike() {
      const bike = {
        battery_level: Math.floor((Math.random() * 100) + 1),
          service_status: Math.floor((Math.random() * 3) + 1),
          in_order: true,
          location: {
          coordinates: [
            `${Math.floor((Math.random() * 3) + 1)}.${Math.floor((Math.random() * 40000) + 1)}`,
            `${Math.floor((Math.random() * 50) + 1)}.${Math.floor((Math.random() * 8000) + 1)}`
          ],
            type: "Point"
        },
        serial_number: `AZX${Math.floor((Math.random() * 8000) + 1)}B`
      }

      this.$store.dispatch('bikes/createBike', bike)
    },
    editStatus(bike, service_status) {
      this.$store.dispatch('bikes/editStatus', {bike: bike, service_status: service_status})
    },
    editOrder(bike, in_order) {
      this.$store.dispatch('bikes/editOrder', {bike: bike, in_order: in_order})
    },
    async searchBike() {
      if (this.search === '') {
        this.$fetch()
      }

      await this.$store.dispatch('bikes/searchBike', this.search)
    },
    removeBike(bike) {
      this.$store.dispatch('bikes/removeBike', bike)
    },
    async filterBikes() {
      await this.$store.dispatch('bikes/filterBikes', {battery_level: this.battery_level, in_order: this.in_order, status_free: this.status_free, status_reserved: this.status_reserved, status_used: this.status_used })
    }
  }
}
</script>

<style>
* {
  transition: all .2s ease-in-out;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch; /* Touch scroll by default */
}

::-webkit-scrollbar {
  display: none;
}

.container-bikes {
  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;
}

.bike {
  scroll-snap-align: start;
}

.bike:last-child {
  margin-bottom: 0!important;
}

.marker {
  background: url('https://www.zoov.eu/images/tech/ebike-zone-touch.png') center center no-repeat;
  background-size: contain;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.mapboxgl-popup {
  transition: all .2s ease-in-out;
  max-width: 200px;
}

.mapboxgl-control-container {
  display: none;
}

.mapboxgl-popup-content {
  text-align: center;
  font-family: 'Open Sans', sans-serif;
}

.mapboxgl-canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.mapboxgl-canvas {
  left: unset!important;
  width: 100%;
  height: 100%;
}

.custom-box-shadow {
  box-shadow: rgba(0, 0, 0, 0.08) 0 4px 12px;
}
</style>
