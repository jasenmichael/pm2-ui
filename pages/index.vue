<template>
  <div>
    <b-container>
      <b-navbar variant="faded" type="light">
        <b-navbar-brand href="#">
          PmTooYooEee
        </b-navbar-brand>
      </b-navbar>
      <List />
    </b-container>
  </div>
</template>

<script>
import List from '@/components/list.vue'

export default {
  components: { List }
}
</script>
