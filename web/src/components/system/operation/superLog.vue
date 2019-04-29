<template>
  <div class="superLog mainboss">
    <el-table
      :data="superloglist"
      :height="this.$store.state.tableHeight2"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="equipNo" align="center" label="设备号"></el-table-column>
      <el-table-column prop="channelNo" align="center" label="货道号"></el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">{{scope.row.status | fiterstatus}}</template>
      </el-table-column>
      <el-table-column prop="createTime" align="center" label="操作时间"></el-table-column>
      <el-table-column prop="trueName" align="center" label="操作人"></el-table-column>
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
  name: "operation_log",
  data() {
    return {
      pageNum: 1,
      pageSize: 15,
      total: 0,
      loading: false,
      superloglist: []
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
    }
  },
  methods: {
    getsuperloglist() {
      let _Url =
        "superLog?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        if (res.status == 200) {
          this.superloglist = res.data.data;
          this.total = res.data.total;
        }
        console.log("res:", res);
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getsuperloglist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getsuperloglist();
    }
  },
  created() {
    this.getsuperloglist();
  }
};
</script>