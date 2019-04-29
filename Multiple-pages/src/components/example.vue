<template>
  <div class="example">
    <div class="parbox" v-show="status == -1">
      <mt-field label="用户名：" placeholder="请输入用户名" v-model="apply.trueName"></mt-field>
      <mt-field label="手机号：" placeholder="请输入手机号" type="number" v-model="apply.username"></mt-field>
      <mt-button type="primary" @click="handapply">申请</mt-button>
    </div>
    <div class="parbox" v-show="status == 1">
      <p class="prompt">提示：请输入正确的8位设备编号</p>
      <mt-field label="设备号：" placeholder="请输入8位设备号" type="number" v-model="device.equipNo"></mt-field>
      <mt-button type="primary" @click="inquire">设备查询</mt-button>
      <!-- <mt-field label="货道号：" placeholder="请输入货道号" type="number" v-model="device.channelNo"></mt-field> -->
      <div
        class="equipul"
        v-for="(item,index) in equiplist"
        :key="item.equipNo"
        @click="handli(item)"
        :class="actequipNo==item.equipNo?'actequipul':''"
      >
        <p>酒店名称：{{item.hotelName}}</p>
        <p>设备编号：{{item.equipNo}}</p>
        <ul v-show="actequipNo==item.equipNo" class="addcont">
          <li
            v-for="(items,indexs) in item.channelList"
            :key="items.channelId"
            @click="handitem(items,index,indexs)"
          >
            <img class="selectedimg" v-show="items.act" src="../assets/image/yixz_icon.png" alt>
            <img class="selectedimg" v-show="!items.act" src="../assets/image/weisz_icon.png" alt>
            <div class="liright">
              <p class="goodsname">
                <span>货道{{items.channelNo}}</span>
              </p>
            </div>
          </li>
        </ul>
      </div>

      <mt-button v-show="equiplist.length>0" type="primary" @click="handfirst">初次布货</mt-button>
      <mt-button v-show="equiplist.length>0" type="primary" @click="handdoor">开门补货</mt-button>
    </div>
    <h1>{{status==0?'账户已停用':status==4?'账户正在申请中':''}}</h1>
  </div>
</template>
<script>
import Vue from "vue";
import { Field } from "mint-ui";
import { Button } from "mint-ui";
import { MessageBox } from "mint-ui";
Vue.component(Button.name, Button);
Vue.component(Field.name, Field);
import { Toast } from "mint-ui";
export default {
  name: "goods_list",
  data() {
    return {
      status: 1,
      actequipNo: "",
      apply: {
        trueName: "",
        username: ""
      },
      device: {
        channelNo: "",
        equipNo: ""
      },
      wxback: {},
      actlist: [],
      equiplist: []
    };
  },
  watch: {
    actequipNo: function(curVal, oldVal) {
      if (oldVal) {
        for (let i in this.equiplist) {
          if (oldVal == this.equiplist[i].equipNo) {
            for (let j in this.equiplist[i].channelList) {
              this.equiplist[i].channelList[j].act = false;
            }
          }
        }
      }
      this.actlist = [];
    }
  },
  methods: {
    //查询当前用户权限
    queryPermission(code) {
      this.$http.get("operation/login/" + code).then(res => {
        //   -1 可申请   0：停用    1：已经申请成功  4：申请中
        this.status = res.data.status;
        localStorage.setItem("TOKEN", res.data.token);
      });
    },
    //申请成为运营人员
    handapply() {
      if (!this.apply.trueName) {
        Toast("请输入用户名");
        return;
      }
      if (!this.apply.username) {
        Toast("请输入手机号");
        return;
      }
      if (!/^1[3456789]\d{9}$/.test(this.apply.username)) {
        Toast("手机号码有误，请重填");
        this.apply.username = "";
        return;
      }
      this.$http.post("operation/apply", this.apply).then(res => {
        console.log("res:", res);
        if (res.status == 200) {
          MessageBox("提示", res.data);
          this.status = 4;
        }
      });
    },
    //设备查询
    inquire() {
      if (!this.device.equipNo) {
        Toast("请输入设备号");
      } else {
        let _url = "operation/openCheck?equipNo=" + this.device.equipNo;
        this.$http.get(_url).then(res => {
          if (res.data.length > 0) {
            let _datalist = res.data;
            for (let i in _datalist) {
              for (let j in _datalist[i].channelList) {
                _datalist[i].channelList[j].act = false;
              }
              _datalist[i].channelList.sort(this.compare("channelNo"));
            }
            if (_datalist.length == 1) {
              this.actequipNo = _datalist[0].equipNo;
            }
            this.equiplist = _datalist;
            console.log("equiplist:", this.equiplist);
          } else {
            this.equiplist = [];
            this.device.equipNo = "";
            MessageBox("提示", "未查询到相关设备");
          }
        });
      }
    },
    //排序
    compare(property) {
      return function(a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
      };
    },
    //选中、取消选中某一个货道
    handitem(obj, val1, val2) {
      console.log("obj:", obj);
      this.equiplist[val1].channelList[val2].act = !this.equiplist[val1]
        .channelList[val2].act;
      if (this.equiplist[val1].channelList[val2].act) {
        this.actlist.push(obj);
      } else {
        for (let i in this.actlist) {
          if (obj.channelId == this.actlist[i].channelId) {
            this.actlist.splice(i, 1);
          }
        }
      }
      console.log("actlist:", this.actlist);
    },
    //选择某一个设备
    handli(obj) {
      this.actequipNo = obj.equipNo;
    },
    //初次布货
    handfirst() {
      if (this.actequipNo) {
        this.$http.post("operation/first/"+this.actequipNo).then(res => {
          MessageBox("提示", res.data);
        });
      } else {
        MessageBox("提示", "请先选中一个设备");
      }
    },
    //开门
    handdoor(equipNo) {
      let arr = [];
      console.log("actlist321:", this.actlist, this.actlist.length);
      if (this.actequipNo) {
        if (this.actlist.length > 0) {
          for (let i in this.actlist) {
            let _obj = {};
            (_obj.channelId = this.actlist[i].channelId),
              (_obj.channelNo = this.actlist[i].channelNo),
              (_obj.equipNo = this.actequipNo);
            arr.push(_obj);
          }
          this.$http.post("operation/open", arr).then(res => {
            MessageBox("提示", res.data);
          });
        } else {
          MessageBox("提示", "请选择货道");
        }
      } else {
        MessageBox("提示", "请先选中一个设备");
      }
      if (!this.device.channelNo) {
        Toast("请输入货道号");
        return;
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
      this.queryPermission(aobj.code);
    } else {
      window.location.href =
        "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4c3213fb7c381a0&redirect_uri=http://dev.byn-kj.com/mobile/example.html&response_type=code&scope=snsapi_base&state=state#wechat_redirect";
    }
  }
};
</script>

<style lang="less">
.example {
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
    margin: 10px 0;
  }
  .equipul {
    padding: 5px;
    text-align: left;
    border-top: 1px solid #999;
    p {
      margin: 10px;
    }
    p:nth-child(1) {
      font-size: 30px;
    }
  }
  .actequipul {
    background: #41abe3;
  }
  .prompt {
    color: red;
    font-weight: 800;
    font-size: 30px;
    text-align: left;
    margin-left: 5%;
    width: 95%;
  }
  .addcont {
    li {
      height: 50px;
      padding: 16px 0;
      display: flex;
      background: #fff;
      border-bottom: 2px solid #eee;
      .selectedimg {
        width: 44px;
        height: 44px;
        margin-top: 10px;
      }
      .liright {
        flex: 1;
        overflow: auto;
        p {
          text-align: left;
          width: 95%;
          font-size: 30px;
          font-family: "PingFang-SC-Bold";
          font-weight: bold;
          color: rgba(88, 88, 88, 1);
          span {
            color: #8a8a8a;
            font-size: 26px;
            font-family: PingFang-SC-Bold;
            font-weight: bold;
            color: rgba(138, 138, 138, 1);
          }
        }
      }
    }
  }
}
</style>
