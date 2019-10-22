<template>
  <!-- eslint-disable -->
  <div>
    <div v-for="item in list" :key="item.id">
      <b-card :style="'max-width: 100vw;'" class="mb-2 item-card" no-body>
        <b-row class="item" align-v="center" align-h="end">
          <b-col cols="auto">
            <h3>
              <fa :color="item.execIcon.color" :icon="item.execIcon.icon" class="icon-interpreter" />
              {{ item.name }}
            </h3>
            <b-card-text>{{ item.pwd }}</b-card-text>
            <a v-if="item.status === 'online'" :href="item.url" target="_blank">{{item.url}}</a>
            <br />
            <a
              v-if="item.lan_url && (item.status === 'online')"
              :href="item.lan_url"
              target="_blank"
            >{{item.lan_url}}</a>
          </b-col>
          <b-col />
          <b-col cols="auto">
            <b-list-group-item class="status-box">
              <b-spinner
                v-show="item.statusIcon.isLoading"
                class="icon-status"
                type="grow"
                label="Spinning"
              />
              <fa
                v-show="!item.statusIcon.isLoading"
                :icon="item.statusIcon.icon"
                :color="item.statusIcon.color"
                class="icon-status"
              />
              <span>Status:</span>
              <span :style="'color:'+item.statusIcon.color+';'" class="status">{{ item.status }}</span>
            </b-list-group-item>
          </b-col>
        </b-row>
        <b-row class="item" align-v="end" align-h="end">
          <b-col class="info">
            <fa :color="action.drop.color" :icon="action.drop.icon" class="info-drop" />
          </b-col>
          <b-col cols="auto" class="actions">
            <b-button
              title="Restart"
              variant="link"
              class="action-btn"
              @click="item.status === 'online' ? restart(item.name) : ''"
            >
              <fa :color="action.restart.color" :icon="action.restart.icon" class="action-icon" />
            </b-button>
            <b-button title="Start" variant="link" class="action-btn">
              <fa
                :color="action.start.color"
                :icon="action.start.icon"
                class="action-icon"
                @click="item.status === 'stopped' ? start(item.name) : ''"
              />
            </b-button>
            <b-button title="Stop" variant="link" class="action-btn">
              <fa
                :color="action.stop.color"
                :icon="action.stop.icon"
                class="action-icon"
                @click="item.status === 'online' ? stop(item.name) : ''"
              />
            </b-button>

            <b-button
              :id="item.id+'-remove-btn'"
              title="Remove"
              variant="link"
              class="action-btn"
              @click="showRemoveModal(item.id)"
            >
              <fa :color="action.remove.color" :icon="action.remove.icon" class="action-icon" />
            </b-button>
            <b-button title="Settings" variant="link" class="action-btn">
              <fa :color="action.settings.color" :icon="action.settings.icon" class="action-icon" />
            </b-button>
          </b-col>
        </b-row>
      </b-card>
    </div>

    <!-- move me inside for loop, switch selected.id to item.id -->
    <!-- DELETE/REMOVE MODAL -->
    <!-- <b-button v-b-modal.remove>Launch demo modal</b-button> -->
    <b-modal ref="remove-modal" hide-footer :title="`Delete id:${selected.id}`">
      <div class="d-block text-center">
        <h5>ARE YOU SURE??</h5>
        <h4>YOU ARE ABOUT TO DELETE {{ selected.name }}</h4>
        <code>No files will be deleted</code>
      </div>
      <b-button class="mt-2" variant="outline-danger" block @click="remove(selected.id)">DELETE</b-button>
      <b-button
        class="mt-3"
        variant="outline-warning"
        block
        @click="hideRemoveModal(selected.id)"
      >Cancel</b-button>
    </b-modal>
    <!--  -->
    <!--  -->

    <div v-if="list.length">
      <b-row>
        <b-col>
          <b-button title="Add New" variant="link" class="action-btn">
            <fa :icon="action.add.icon" :color="action.add.color" class="add-icon" />
          </b-button>
        </b-col>
        <b-col cols="auto" class="save-reset">
          <b-button title="Save" variant="link" class="action-btn">
            <fa :icon="action.save.icon" class="icon" />&nbsp;save current processes
          </b-button>
        </b-col>
        <b-col cols="auto" class="save-reset">
          <b-button title="Reset" variant="link" class="action-btn">
            <fa :icon="action.reset.icon" class="icon" />&nbsp;reset changes
          </b-button>
        </b-col>
      </b-row>
      <br />
      <hr />
      <br />
      <client-only placeholder="loading...">
        <b-button @click="logger = []">
          reset logger
          <fa :icon="action.reset.icon" class="icon" />
        </b-button>
        <div v-if="logger.length || list.length !== 0">
          <vue-json-pretty :data="{logger, list}" />
        </div>
      </client-only>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    VueJsonPretty: () => import('vue-json-pretty')
  },
  data: () => {
    return {
      logger: [],
      list: [],
      selected: {},
      action: {
        restart: { icon: ['fas', 'retweet'], color: '#2b5ca5' },
        start: { icon: ['fas', 'play-circle'], color: 'green' },
        stop: { icon: ['fas', 'stop-circle'], color: 'darkblue' },
        add: { icon: ['fas', 'plus-circle'], color: 'darkblue' },
        remove: { icon: ['fas', 'trash'], color: 'darkred' },
        settings: { icon: ['fas', 'cog'], color: '#5f6972' },
        save: { icon: ['fas', 'save'], color: '' },
        reset: { icon: ['fas', 'undo'], color: '' },
        drop: { icon: ['fas', 'chevron-down'], color: 'darkgrey' }
      },
      status: {
        online: { icon: ['fas', 'check-square'], color: 'green' },
        stopped: { icon: ['fas', 'stop-circle'], color: 'blue' },
        errored: { icon: ['fas', 'check-square'], color: 'red' }
      },
      interpreter: {
        node: { icon: ['fab', 'node-js'], color: 'darkgreen' },
        default: { icon: ['fas', 'code'], color: 'black' }
      }
    }
  },
  // computed: {},
  // eslint-disable-next-line
  mounted() {
    this.getList()
  },
  methods: {
    // eslint-disable-next-line
    async getList() {
      const list = await this.$axios.$get(`/api/list`)
      this.list = await this.addStatusIcons(list)
    },
    // eslint-disable-next-line
    addStatusIcons(list) {
      // eslint-disable-next-line
      let newList = []
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        item.statusIcon = this.status[item.status]
        item.statusIcon.isLoading = false
        item.execIcon = this.interpreter[item.exec_interpreter]
        newList.push(item)
        // this.list.push(item)
      }
      return newList
    },
    // eslint-disable-next-line
    async changeStatusIcon(item) {
      const i = await this.list.findIndex(el => el.name == item.name)
      // this.list[i].statusIcon.isLoading = true
      if (this.list[i].status !== item.status) {
        console.log('status changed')
        this.list[i] = await this.addStatusIcons([item])[0]
        this.list[i].statusIcon.isLoading = false
        this.logger.unshift(`STATUS_CHANGED ${item.name} ${item.status}`)
      }
    },
    // eslint-disable-next-line
    async restart(name) {
      const item = await this.$axios.$get(`/api/restart/${name}`)
      this.changeStatusIcon(item)
    },
    async start(name) {
      const item = await this.$axios.$get(`/api/start/${name}`)
      this.changeStatusIcon(item)
    },
    async stop(name) {
      const item = await this.$axios.$get(`/api/stop/${name}`)
      this.changeStatusIcon(item)
    },

    async remove(id) {
      console.log('deleteing', id)
      const result = await this.$axios.$get(`/api/delete/${id}`)
      if (result.deleted) {
        await this.$axios.$get('/api/list/')
        this.getList()
        this.hideRemoveModal(id)
      }
      // this.$refs['remove-modal'].toggle('#toggle-btn')
    },

    showRemoveModal(id) {
      this.$refs['remove-modal'].show(`#${id}-remove-btn"`)
      this.selected = this.list.filter(item => {
        return item.id === id
      })[0]
      console.log('---', this.selected.name)
    },
    hideRemoveModal(id) {
      this.$refs['remove-modal'].hide(`#${id}-remove-btn"`)
    }
  }
}
</script>

<style scoped>
.yo {
  color: #2b5ca5;
}
.item-card {
  border-style: solid;
  border-color: darkgrey;
  border-radius: 2px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s ease-in-out;
}
.item-card:hover {
  box-shadow: 0 4px 8px lightgrey;
  transform: scale(1.01, 1.01);
  transition: box-shadow 0.2s ease-in-out;
}
.item-card::after {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.item-card:hover::after {
  opacity: 1;
}
.status {
  margin-right: 4px;
  text-transform: capitalize;
}
.status-box > span.status {
  font-weight: bold;
  margin-right: 6px;
}
.action-btn {
  padding: 4px;
}
.action-icon {
  font-size: 22px;
  padding: 0px;
  margin: 0px;
}
.add-icon {
  font-size: 38px;
  margin-left: 12px;
  padding: 0px;
}
.add-icon:hover {
  transform: scale(1.1, 1.1);
}
.info-drop {
  margin-left: 1rem;
  font-size: 26px;
}

.icon-status {
  font-size: 26px;
  padding-right: 4px;
}
.icon-interpreter {
  font-size: 48px;
  padding-right: 4px;
  padding-top: 2px;
}
@media only screen and (max-width: 600px) {
  .icon-interpreter {
    font-size: 36px;
  }
  .status-box > span:not(.status) {
    display: none;
    visibility: hidden;
  }
  .icon-status {
    font-size: 20px;
    padding-right: 3px;
  }
}
.save-reset {
  border-style: solid;
  border-color: lightgrey;
  border-width: thin;
  border-radius: 6px;
  padding: 6px;
  margin-right: 18px;
}
</style>
