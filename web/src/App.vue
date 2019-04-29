<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      clientHeight: "600px",
      mainHeight: "800px",
      tableHeight: "732px",
      tableHeight2:"770px"
    };
  },
  mounted() {
    this.init();
    // 动态设置背景图的高度为浏览器可视区域高度

    // 首先在Virtual DOM渲染数据时，设置下背景图的高度．
    this.clientHeight = `${document.documentElement.clientHeight}px`;
    // 然后监听window的resize事件．在浏览器窗口变化时再设置下背景图高度．
    const that = this;
    window.onresize = function temp() {
      that.clientHeight = `${document.documentElement.clientHeight}px`;
      that.mainHeight = `${document.documentElement.clientHeight * 0.86}px`;
      that.tableHeight = `${document.documentElement.clientHeight * 0.925 -
        140}px`;
      that.tableHeight2 = `${document.documentElement.clientHeight * 0.84}px`;
    };
  },

  watch: {
    clientHeight: function() {
      this.$store.commit("setClientHeight", this.clientHeight);
    },
    mainHeight: function() {
      this.$store.commit("setMainHeight", this.mainHeight);
    },
    tableHeight: function() {
      this.$store.commit("setTableHeight", this.tableHeight);
    },
    tableHeight2: function() {
      this.$store.commit("setTableHeight2", this.tableHeight2);
    },
    "this.$store.state.token": {
      handler: function() {
        console.log("app_token:", this.$store.state.token);
        this.init();
      }
    }
  },
  methods: {
    //状态判断，跳转路由
    init() {
      if (!this.$store.state.token) {
        this.$router.push({
          name: ""
          // name:"Login"
        });
      }
      this.$store.commit("setClientHeight", this.clientHeight);
      this.$store.commit("setMainHeight", this.mainHeight);
      this.$store.commit("setTableHeight", this.tableHeight);
      this.$store.commit("setTableHeight2", this.tableHeight2);
    }
  },
  created() {
    // console.log("statestate：", this.$store.state);
    this.init();
  }
};
</script>

<style lang="less">
#app {
  position: fixed;
  width: 100%;
  height: 100%;
  font-family: "微软雅黑";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .el-pagination {
    float: left;
  }
  .mainboss {
    width: 98%;
    height: 96%;
    padding: 1%;
    background: #ececec;
    .martop {
      text-align: left;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .topleft {
        .el-cascader {
          .el-input {
            width: 100%;
          }
        }
        .el-select {
          .el-input {
            width: 100%;
          }
        }
      }
    }
  }
}
/* li{ list-style: none;} */
</style>
