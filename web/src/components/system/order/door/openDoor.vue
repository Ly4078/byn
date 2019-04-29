
<template>
  <div class="door mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          type="number"
          v-model="term.equipNo"
          placeholder="请输入设备编号"
          @keyup.enter.native="getloglist(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getloglist(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="loglist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="hotelName" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="roomNo" align="center" label="房间号"></el-table-column>
      <el-table-column prop="equipNo" align="center" label="设备号"></el-table-column>
      <el-table-column prop="channelNo" align="center" label="货道号"></el-table-column>
      <el-table-column align="center" label="类型">
        <template slot-scope="scope">{{scope.row.type | fitertype}}</template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">{{scope.row.status | fiterstatus}}</template>
      </el-table-column>

      <el-table-column prop="createTime" align="center" label="操作时间"></el-table-column>
    </el-table>
    <span class="pagein">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="15"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </span>
  </div>
</template>

<script>
export default {
  name: "storeloglist",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 15,
      term: {
        equipNo: ""
      },
      loglist: []
    };
  },
  filters: {
    fiterstatus(val) {
      if (val == 1) {
        return "成功";
      } else if (val == 2) {
        return "失败";
      } else if (val == 3) {
        return "离线";
      } else if (val == 4) {
        return "异常";
      } else if (val == 6) {
        return "已开";
      }
    },
    fitertype(val) {
      if (val == 1) {
        return "开门";
      } else if (val == 11) {
        return "重试1";
      } else if (val == 12) {
        return "重试2";
      } else if (val == 13) {
        return "重试3";
      } else if (val == 14) {
        return "重试4";
      }
    }
  },
  methods: {
    //获取列表数据
    getloglist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "openLog?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in this.term) {
        if (this.term[key]) {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.loglist = [];
        } else {
          let _data = res.data.data;
          this.loglist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getloglist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getloglist();
    }
  },
  created() {
    this.getloglist();
  }
};
</script>

<style lang="less">
.door {
  .topleft {
    .el-input {
      width: 70%;
    }
  }
}
</style>

