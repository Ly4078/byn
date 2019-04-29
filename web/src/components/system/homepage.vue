<template>
  <div class="home">
    <el-container justify="center">
      <el-header>
        <div class="title">
          <img src="../../assets/images/timgs.png" alt="管理员头像">
          管理控制台
        </div>
        <div class="info">
          <span class="el-dropdown-link">{{this.$store.state.userInfo.trueName}}</span>
          <span class="command" @click="handleCommand">退出登录</span>
        </div>
      </el-header>
      <el-container>
        <el-aside width="220px">
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            background-color="#2f323e"
            active-text-color="#007eff"
            text-color="#fff"
            :unique-opened="true"
            @open="handleOpen"
            @close="handleClose"
          >
            <el-submenu v-for="item in menulist" :key="item.id" :index="item.id">
              <template slot="title">
                <img src="../../assets/images/menu.png" alt>
                <span>{{item.name}}</span>
              </template>
              <el-menu-item-group v-if="item.child">
                <el-menu-item
                  v-for="items in item.child"
                  :key="items.id"
                  :index="items.id"
                  @click="handitems(items)"
                >{{items.name}}</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <router-view v-bind:style="{height: this.$store.state.mainHeight}"></router-view>
              <p>©版权所有-比翼鸟系统</p>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      menulist: []
    };
  },
  methods: {
    //获取菜单列表
    getmenulist() {
      this.$http.get("menu").then(res => {
        res.data.sort(function(a, b) {
          if (a.sort < b.sort) {
            return -1;
          } else if (a.sort > b.sort) {
            return 1;
          }
          return 0;
        });
        for (let i in res.data) {
          res.data[i].child.sort(function(a, b) {
            if (a.sort < b.sort) {
              return -1;
            } else if (a.sort > b.sort) {
              return 1;
            }
            return 0;
          });
        }
        this.menulist = res.data;
      });
    },
    handitems(obj) {
      this.$router.push("/" + obj.url);
    },
    handleOpen(key, keyPath) {
      // console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      // console.log(key, keyPath);
    },
    //退出登录
    handleCommand(val) {
      this.$store.commit("setUserInfo", {});
      this.$store.commit("setshopInfo", {});
      this.$store.commit("setToken", "");
      localStorage.setItem("TOKEN", "");
      this.$router.push({ name: "Login" });
    }
  },
  created() {
    this.getmenulist();
  }
};
</script>

<style lang="less">
.home {
  width: 100%;
  height: 100%;
  section {
    width: 100%;
    height: 100%;
    header {
      width: 100%;
      padding: 0.5% 2%;
      background: #33373b;
      display: flex;
      align-items: center; /*垂直居中*/
      justify-content: space-between; /*两端对齐*/
      font-size: 20px;
      color: #fff;
      .title{
margin-left: 32px;
      }
      .title img {
        width: 36px;
        height: 36px;
        border-radius: 50px;
        
        margin-right: 10px;
      }
      .command {
        margin-left: 20px;
        cursor: pointer;
        color: burlywood;
      }
      & > div {
        display: flex;
        align-items: center; /*垂直居中*/
        justify-content: space-between;
      }
    }
    aside {
      height: 100%;
      // border-right: 2px solid #ebebeb;
      background: #2f323e;
    }
    main {
      background: #dadada;
      padding: 0;
      overflow-y: auto;
      p{
        margin-top: 5px;
      }
    }
  }
  // .el-table tbody tr:hover>td { background-color: #0a36b9 }
}
</style>
