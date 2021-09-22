export const state = () => ({
  bikes: [],
  total: 0
})

export const getters = {
  getBikes(state) {
    return state.bikes
  },
  getTotal() {
    return state.total
  }
}

export const mutations = {
  getBikes(state, bikes) {
    state.bikes = bikes
  },
  getTotal(state, total) {
    state.total = total
  },
  addBike(state, bike) {
    state.bikes.push(bike)
    state.total++
  },
  createBike(state, bike) {
    state.bikes.push(bike)
  },
  removeBike(state, bike) {
    state.bikes.splice(state.bikes.indexOf(bike), 1)
    state.total--
  },
  editStatus(state, bike) {
    state.bikes.map(item => {
      if (item.id === bike.id) {
        item.service_status = bike.service_status
      }
    })
  },
  editOrder(state, bike) {
    state.bikes.map(item => {
      if (item.id === bike.id) {
        item.in_order = bike.in_order
      }
    })
  }
}

export const actions = {
  getBikes({ commit }) {
    this.$axios.$get('bikes')
      .then(res => {
        commit('getBikes', res.bikes)
        commit('getTotal', res.total)
      })
  },
  createBike({ commit }, bike) {
    this.$axios.$post('bikes', bike)
      .then(res => {
        commit('createBike', res)
      })
  },
  searchBike({ commit }, search) {
    this.$axios.$get('bikes?search=' + search)
      .then(res => {
        commit('getBikes', res.bikes)
        commit('getTotal', res.total)
      })
  },
  editStatus({ commit }, bike) {
    this.$axios.$put('bikes/' + bike.bike.id, {service_status: bike.service_status})
      .then(res => {
        commit('editStatus', res)
      })
  },
  editOrder({ commit }, bike) {
    this.$axios.$put('bikes/' + bike.bike.id, {in_order: bike.in_order})
      .then(res => {
        commit('editOrder', res)
      })
  },
  removeBike({ commit }, bike) {
    this.$axios.$delete('bikes/' + bike.id)
      .then(() => {
        commit('removeBike', bike)
      })
  },
  filterBikes({ commit }, { battery_level, in_order = false, status_free = false, status_reserved = false, status_used = false }) {
    let filter = ''
    filter += battery_level > 0 ? `&battery_level=${battery_level}` : ''
    filter += in_order ? `&in_order=${in_order}` : ''
    filter += status_free ? `&service_status=${1}` : ''
    filter += status_reserved ? `&service_status=${2}` : ''
    filter += status_used ? `&service_status=${3}` : ''

    this.$axios.$get('bikes?' + filter)
      .then(res => {
        console.log(filter)
        console.log(res)
        commit('getBikes', res.bikes)
        commit('getTotal', res.total)
      })
  }
}
