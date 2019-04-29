<template>
  <div class="addto">
    <div class="addtop">
      <div class="top1">
        <img src="../../assets/image/left_icon.png" alt @click="goback">
        <span>房间{{repdata.roomNo}}</span>
      </div>
      <div class="top2">设备：{{repdata.equipNo}}</div>
    </div>
    <div class="addcont">
      <ul>
        <li v-for="(item,index) in goodslist" :key="item.id" @click="handitem(item,index)">
          <img class="selectedimg" v-show="item.act" src="../../assets/image/yixz_icon.png" alt>
          <img class="selectedimg" v-show="!item.act" src="../../assets/image/weisz_icon.png" alt>
          <div class="liright">
            <img class="goodsimg" :src="$GLOBAL.API+item.thumb" alt>
            <p class="goodsname">
              {{item.name}}
              <span>货道{{item.channelNo}}</span>
            </p>
            <p class="qhdate">已缺货{{item.hour | fiterdate}}</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="ad_footer">
      <div @click="handbuton(1)">开门补货</div>
      <div @click="handbuton(2)">补货完成</div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Toast } from "mint-ui";
import { Indicator } from "mint-ui";
export default {
  name: "addto",
  data() {
    return {
      roomNo:"",
      repdata: {},
      actlist: [],
      goodslist: []
    };
  },
  filters: {
    fiterdate(value) {
      let _day = parseInt(value / 24);
      let _hour = parseInt(value % 24);
      return _day ? _day + "天" + _hour + "小时" : _hour + "小时";
    }
  },
  methods: {
    //回退到上一页面
    goback() {
      window.history.back(-1);
    },
    //查询列表数据
    getdetails() {
      const _this = this;
      this.$http.get("replenish/details/" + this.roomNo).then(res => {
        let _data = res.data;
        if (_data.length > 0) {
          for (let i = 0; i < _data.length; i++) {
            _data[i].act = false;
          }
        }
        setTimeout(() => {
          _this.goodslist = _data;
        }, 200);
      });
    },
    //点击数列某条数据
    handitem(obj, ind) {
      this.goodslist[ind].act = !this.goodslist[ind].act;
      if (this.goodslist[ind].act) {
        this.actlist.push(obj);
      } else {
        for (let i in this.actlist) {
          if (obj.id == this.actlist[i].id) {
            this.actlist.splice(i, 1);
          }
        }
      }
    },
    //开门
    handbuton(val) {
      let _url = val == 1 ? "replenish" : "replenish/complete",
        arr = [];
      Indicator.open({
        text: "加载中...",
        spinnerType: "fading-circle"
      });
      for (let i in this.actlist) {
        let obj = {};
        obj.channelId = this.actlist[i].channelId;
        obj.channelNo = this.actlist[i].channelNo;
        obj.equipNo = this.actlist[i].equipNO;
        arr.push(obj);
      }
      this.$http.post(_url, arr).then(res => {
        Indicator.close();
        alert(JSON.stringify(res))
        Toast(res.data);
        if(val ==2){
          this.getdetails();
        }
      });
    }
  },
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.repdata = this.$route.query;
      this.roomNo=this.$route.query.id;
      this.getdetails();
    }
  }
};
</script>
<style lang="less">
.addto {
  position: fixed;
  width: 100%;
  height: 100%;
  background: #eee;
  a {
    text-decoration: none;
  }
  .addtop {
    padding-top: 15px;
    text-align: center;
    background: #f6f6f6;
    .top1 {
      font-size: 36px;
      font-family: PingFang-SC-Bold;
      font-weight: bold;
      height: 60px;
      color: rgba(21, 21, 21, 1);
      img {
        float: left;
        width: 40px;
        height: 40px;
        padding: 10px;
      }
      span {
        box-shadow: 0px -18px #fea34a inset;
      }
    }
    .top2 {
      padding: 24px 0;
      font-size: 24px;
      font-family: PingFang-SC-Regular;
      font-weight: 400;
      color: rgba(138, 138, 138, 1);
    }
  }
  .addcont {
    ul > li {
      height: 116px;
      padding: 16px 0;
      display: flex;
      background: #fff;
      border-bottom: 2px solid #eee;
      .selectedimg {
        width: 44px;
        height: 44px;
        margin: 28px 24px;
      }
      .liright {
        flex: 1;
        overflow: auto;
        .goodsimg {
          width: auto;
          width: 100px;
          height: 100px;
          background: #c3c3c3;
          margin-right: 16px;
          float: left;
        }
        p {
          text-align: left;
          width: 95%;
          height: 58px;
          line-height: 58px;
          font-size: 30px;
          font-family: PingFang-SC-Bold;
          font-weight: bold;
          color: rgba(88, 88, 88, 1);
          span {
            float: right;
            color: #8a8a8a;
            font-size: 26px;
            font-family: PingFang-SC-Bold;
            font-weight: bold;
            color: rgba(138, 138, 138, 1);
          }
        }
        .qhdate {
          color: #ff1a1a;
        }
      }
    }
  }
  .ad_footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100px;
    & > div {
      width: 50%;
      height: 100px;
      line-height: 100px;
      text-align: center;
      float: left;
      font-size: 36px;
      font-family: "PingFang-SC-Bold";
      color: #434343;
    }
    div:nth-child(1) {
      background: #fff1a1;
    }
    div:nth-child(2) {
      background: #fdd808;
    }
  }
}
</style>
