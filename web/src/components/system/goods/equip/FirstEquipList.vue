<template>
  <div class="FirstEquipList mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input v-model="term.name" placeholder="设备名称" @keyup.enter.native="getequiplist(1)" clearable></el-input>
        <el-input v-model="term.serialNo" placeholder="设备编号" @keyup.enter.native="getequiplist(1)" clearable></el-input>
        <el-select v-model="term.status" clearable filterable placeholder="请选择设备状态">
          <el-option
            v-for="item in statuslist"
            :key="item.value"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="getequiplist(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="equiplist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="serialNo" align="center" label="设备编号"></el-table-column>
      <el-table-column prop="name" align="center" label="设备名称"></el-table-column>
      <el-table-column prop="hotelName" align="center" label="所在酒店"></el-table-column>
      <el-table-column prop="roomNo" align="center" label="所在房间"></el-table-column>
      <el-table-column align="center" label="货道数量">
        <template slot-scope="scope">
          {{scope.row.type=='1'?'6货道':scope.row.type=='2'?'8货道':'10货道'}}
        </template>
      </el-table-column>
      <el-table-column align="center" label="设备状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status==1?'':'info'">{{scope.row.status | fiterstatus}}</el-tag>
        </template>
      </el-table-column>
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
  name: "FirstEquipList",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize:15,
      loading: false,
      term:{
        name:"",
        serialNo:"",
        status:""
      },
      equiplist: [],
      statuslist: [
        {
          id: 1,
          label: "离线"
        },
        {
          id: 2,
          label: "在线"
        },
        {
          id: 3,
          label: "停用"
        }
      ]
    };
  },
  filters: {
    fiterstatus: function(val) {
      if (val == 1) {
        return "离线";
      } else if (val == 2) {
        return "在线";
      } else if (val == 3) {
        return "停用";
      }
    }
  },
  methods: {
    //查询列表数据
    getequiplist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "equipInitial?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in this.term) {
        if (this.term[key]) {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.loading=true;
      this.$http.get(_Url).then(res => {
        this.loading=false;
        this.equiplist = res.data.data;
        this.total = res.data.total;
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getequiplist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getequiplist();
    }
  },
  created() {
    console.log("fdasfds");
    this.getequiplist();
  }
};
</script>

<style lang="less">
.FirstEquipList {
  .topleft {
      .el-input {
        width: 25%;
      }
    }
}
</style>