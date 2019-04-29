<template>
  <div class="replenish_list">
    <ul class="bmbox" v-show="status==-1">
      <li>提示：酒店补货员需要申请后才可使用</li>
      <li>
        <mt-field label="手机号" placeholder="请输入手机号" type="tel" v-model="trem.username"></mt-field>
      </li>
      <li>
        <mt-field label="姓名" placeholder="请输入姓名" v-model="trem.trueName"></mt-field>
      </li>
    </ul>
    <mt-button type="primary" @click="handleapply" v-show="status==-1">申请补货员</mt-button>
    <div class="load" v-show="status==4">申请审核中...</div>
    <div class="load" v-show="status==0">该帐户已停用</div>
    <div class="reptop" v-show="status==1">
      <div class="reptitle">
        <span>补货清单</span>
      </div>
      <div class="repnav">
        <span
          v-for="item in nav"
          :key="item.id"
          :class="actnav == item.id?'actspan':''"
          @click="handnav(item)"
        >{{item.label}}</span>
      </div>
      <div class="repcont">
        <ul :class="actnav=='1'?'actleft':'actright'">
          <li v-for="item in datalist" :key="item.id" @click="handitem(item)">
            <div class="lileft" v-show="actnav==1">
              <div class="llt">房号：{{item.roomNo}}</div>
              <div class="llb">{{item.amount}}件商品待补货</div>
            </div>
            <div class="lileft" v-show="actnav==2">
              <div class="llt">{{item.name}}</div>
              <div class="llb">缺{{item.amount}}件</div>
            </div>
            <div class="liright">
              <img src="../../assets/image/right_icon.png" alt>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Toast } from "mint-ui";
import { Field } from "mint-ui";
import { Button } from "mint-ui";
import { MessageBox } from "mint-ui";
Vue.component(Field.name, Field);
Vue.component(Button.name, Button);
export default {
  name: "replenish",
  data() {
    return {
      datalist: [],
      goodsList: [],
      roomList: [],
      wxback: {},
      trem: {
        username: "",
        trueName: ""
      },
      hotelId: "",
      status: "",
      nav: [
        {
          id: 1,
          label: "缺货房间"
        },
        {
          id: 2,
          label: "缺货商品"
        }
      ],
      actnav: 1
    };
  },
  methods: {
    //登录
    getlogin(code) {
      const _this = this;
      this.$http.get("replenish/login/" + code).then(res => {
        console.log("login_res:", res);
        // alert(JSON.stringify(res));
        this.status = res.data.status;
        localStorage.setItem("TOKEN", res.data.token);

        if (res.data.status == 1) {
          this.getreplenish();
        }
      });
    },
    //查询数据
    getreplenish() {
      this.$http
        .get("replenish").then(res => {
          // alert(JSON.stringify(res));
          if (res.status == 200) {
            this.hotelId = res.data.hotelId;
            this.goodsList = res.data.goodsList;
            this.roomList = res.data.roomList;
            this.datalist = res.data.roomList;
            this.$store.commit("sethotelId", res.data.hotelId);
          }
        });
    },
    //切换nav
    handnav(obj) {
      this.actnav = obj.id;
      if (obj.id == 1) {
        this.datalist = this.roomList;
      } else if (obj.id == 2) {
        this.datalist = this.goodsList;
      }
    },
    //点击某个列表数据
    handitem(obj) {
      if (this.actnav == 1) {
        this.$router.push({
          path: "/addto",
          query: obj
        });
      } else if (this.actnav == 2) {
        this.$router.push({
          path: "/lack",
          query: obj
        });
      }
    },
    //申请补货员
    handleapply() {
      if (!this.trem.username) {
        Toast("请输入电话号码");
      } else if (!this.trem.trueName) {
        Toast("请输入姓名");
      } else {
        const reg = /^1[3|4|5|6|9|7|8][0-9]{9}$/;
        if (!reg.test(this.trem.username)) {
          Toast("手机号码输入错误");
          this.trem.username = "";
        } else {
          let _parms = {
            trueName: this.trem.trueName,
            username: this.trem.username
          };
          this.$http.post("replenish/apply", _parms).then(res => {
            alert(JSON.stringify(res))
            if (res.status == 200) {
              this.status = 4;
              MessageBox("提示", "申请成功，请等待审核结果");
            }
          });
        }
      }
    }
  },
  created() {
    let astr = window.location.href,
      aobj = {};
    if (astr.indexOf("code") != -1) {
      let anum = astr.indexOf("?");
      astr = astr.substr(anum + 1);
      let aarr = astr.split("&");
      for (let i = 0; i < aarr.length; i++) {
        let barr = aarr[i].split("=");
        aobj[barr[0]] = barr[1];
      }
      this.wxback = aobj;
      this.getlogin(aobj.code);
    } else {
      window.location.href =
        "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4c3213fb7c381a0&redirect_uri=http://dev.byn-kj.com/mobile/replenish.html&response_type=code&scope=snsapi_base&state=state#wechat_redirect";
    }
  }
};
</script>
<style lang="less">
.replenish_list {
  position: fixed;
  width: 100%;
  height: 100%;
  background: #eee;
  .reptop {
    height: 144px;
    background: #fff;
    border-bottom: 1px solid #c4c4c4;
    padding-top: 36px;
    .reptitle {
      text-align: center;
      font-size: 36px;
      font-family: PingFang-SC-Bold;
      font-weight: bold;
      color: rgba(21, 21, 21, 1);
      margin-bottom: 35px;
      span {
        box-shadow: 0px -18px #fea34a inset;
      }
    }
    .repnav {
      span {
        width: 50%;
        display: block;
        float: left;
        text-align: center;
        padding: 9px 0;
        font-size: 32px;
      }
      .actspan {
        color: #ff7e00;
        border-bottom: 2px solid#fea34a;
      }
    }
  }
  .repcont {
    margin-top: 120px;
    .actleft {
      li {
        width: 44.9%;
        float: left;
        background: #fff;
        .lileft {
          .llt {
            font-size: 36px;
          }
        }
      }
    }
    .actright {
      padding-left: 2%;
      li {
        width: 96%;
        border-bottom: none;
      }
      li:nth-child(1) {
        border: none;
      }
    }
    ul {
      width: 100%;
      background: #fff;
      li {
        padding: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
        border-top: 1px solid #bababa;
        border-bottom: 1px solid #bababa;
        font-size: 30px;
        .lileft {
          width: 90%;
          text-align: left;
          .llb {
            color: #ff1a1a;
          }
        }
        .liright {
          img {
            width: 28px;
            height: 39px;
          }
        }
      }
      li:nth-child(2n-1) {
        border-right: 1px solid rgba(163, 163, 163, 1);
      }
    }
  }
  .bmbox {
    font-size: 30px;
    li:nth-child(1) {
      margin-bottom: 40px;
    }
  }
  a {
    text-decoration: none;
    margin: 5px 0;
  }
  .mint-cell-title {
    width: 200px;
  }
  .mint-field-core {
    font-size: 40px !important;
  }
  .mint-cell-wrapper {
    font-size: 40px !important;
  }
  .mint-button {
    font-size: 40px !important;
    height: auto;
    margin-top: 50px;
  }
  .load {
    font-size: 30px;
    text-align: center;
    color: blue;
    margin-top: 100px;
  }
}
</style>
