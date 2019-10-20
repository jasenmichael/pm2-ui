<template>
  <div>
    <b-card
      v-for="item in list"
      :key="item.id"
      :style="'max-width: 100vw;'"
      class="mb-2 item-card"
      no-body
    >
      <b-row class="item" align-v="center" align-h="end">
        <b-col cols="auto">
          <h3>
            <fa :color="item.execIcon.color" :icon="item.execIcon.icon" class="icon-interpreter" />
            {{ item.name }}
          </h3>
          <b-card-text>{{ item.pwd }}</b-card-text>
        </b-col>
        <b-col />
        <b-col cols="auto">
          <b-list-group-item class="status-box">
            <b-spinner
              class="icon-status"
              v-show="item.statusIcon.isLoading"
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
          <b-button title="Restart" variant="link" class="action-btn" @click="restart(item.name)">
            <fa :color="action.restart.color" :icon="action.restart.icon" class="action-icon" />
          </b-button>
          <b-button title="Start" variant="link" class="action-btn">
            <fa :color="action.start.color" :icon="action.start.icon" class="action-icon" />
          </b-button>
          <b-button title="Stop" variant="link" class="action-btn">
            <fa :color="action.stop.color" :icon="action.stop.icon" class="action-icon" />
          </b-button>
          <b-button title="Remove" variant="link" class="action-btn">
            <fa :color="action.remove.color" :icon="action.remove.icon" class="action-icon" />
          </b-button>
          <b-button title="Settings" variant="link" class="action-btn">
            <fa :color="action.settings.color" :icon="action.settings.icon" class="action-icon" />
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <b-row>
      <b-col />
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
    <no-ssr placeholder="loading...">
      <div v-if="testResult.length || list.length !== 0">
        <vue-json-pretty :data="{restart: testResult, list}" />
      </div>
    </no-ssr>
  </div>
</template>

<script>
export default {
  components: {
    VueJsonPretty: () => import('vue-json-pretty')
  },
  data: () => {
    return {
      testResult: [],
      list: [],
      action: {
        restart: { icon: ['fas', 'retweet'], color: '#2b5ca5' },
        start: { icon: ['fas', 'play-circle'], color: 'green' },
        stop: { icon: ['fas', 'stop-circle'], color: 'darkblue' },
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
      const list = await this.$axios.$get(`http://localhost:8081/api/list`)
      this.list = await this.addStatusIcons(list)
    },
    // eslint-disable-next-line
    addStatusIcons(list) {
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
      }
      this.testResult.push(item)
    },
    // eslint-disable-next-line
    async restart(name) {
      const item = await this.$axios.$get(`/api/restart/${name}`)
      this.changeStatusIcon(item)
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
