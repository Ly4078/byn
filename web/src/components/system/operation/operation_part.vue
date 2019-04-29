<template>
  <div class="operation_part mainboss">
    <div class="martop">
      <div class="topleft">
        <el-select
          v-model="term.areaId"
          clearable
          filterable
          placeholder="请选择区域"
          @focus="getarealist"
        >
          <el-option v-for="item in arealist" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-input
          v-model="term.trueName"
          placeholder="请输入姓名"
          @keyup.enter.native="getreplenisherlist(1)"
          clearable
        ></el-input>
        <el-input
          v-model="term.username"
          placeholder="请输入联系方式"
          @keyup.enter.native="getreplenisherlist(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getoperatorlist(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="operatorlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="trueName" align="center" label="姓名"></el-table-column>
      <el-table-column prop="username" align="center" label="联系电话"></el-table-column>
      <el-table-column prop="areaName" align="center" label="所属区域"></el-table-column>
      <el-table-column prop="createTime" align="center" label="创建时间"></el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            @change="changestatus(scope.row)"
            active-text
            inactive-text
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            @click="handlebut(scope.row)"
            :disabled="!scope.row.status"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >区域分配</el-button>
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

    <el-dialog
      title="分配区域"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      width="50%"
      center
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="姓名">
          <el-input v-model="ruleForm.trueName" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="ruleForm.username" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item label="绑定区域" prop="areaId">
          <el-select v-model="ruleForm.areaId" clearable filterable placeholder="请选择酒店">
            <el-option v-for="item in arealist" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="ruleForm.createTime" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
          <el-button @click="resetForm('ruleForm')">表单重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "operation_part",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 15,
      supplierName: "",
      centerDialogVisible: false,
      ruleForm: {
        areaId: ""
      },
      rules: {
        areaId: [{ required: true, message: "请选择酒店", trigger: "change" }]
      },
      term: {
        trueName: "",
        username: "",
        areaId: ""
      },
      operatorlist: [],
      arealist: []
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        this.ruleForm.areaId = "";
      }
    }
  },
  methods: {
    //获取区域下拉列表数据
    getarealist() {
      if (this.arealist.length < 1) {
        this.$http.get("operator/hotelList").then(res => {
          this.arealist = res.data;
        });
      }
    },
    //获取列表数据
    getoperatorlist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "operator?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in this.term) {
        if (this.term[key] || this.term[key] == "0") {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.operatorlist = [];
        } else {
          let _data = res.data.data;
          for (let i in _data) {
            if (_data[i].status == 1) {
              _data[i].status = true;
            } else {
              _data[i].status = false;
            }
          }
          this.operatorlist = _data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getoperatorlist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getoperatorlist();
    },
    //修改状态
    changestatus(obj) {
      let _Url = "operator/status",
        _parms = {
          status: "",
          id: obj.id
        };
      if (obj.status) {
        _parms.status = 1;
      } else {
        _parms.status = 0;
      }
      this.$http.put(_Url, _parms).then(res => {
        if (res.status == 200) {
          this.$message.success("操作成功");
        }
      });
    },
    //打开编辑弹框
    openDialog(val) {
      this.centerDialogVisible = true;
    },
    //点击区域分配
    handlebut(obj) {
      console.log("obj:", obj);
      this.getarealist();
      const _this = this;
      for (let key in obj) {
        this.ruleForm[key] = obj[key];
      }
      if (this.arealist.length > 1) {
        this.fparea(obj);
      } else {
        setTimeout(() => {
          _this.fparea(obj);
        }, 500);
      }
    },
    fparea(obj) {
      for (let i in this.arealist) {
        if (obj.areaName == this.arealist[i].name) {
          this.ruleForm.areaId = this.arealist[i].id;
        }
      }
      this.centerDialogVisible = true;
    },
    //区域分配
    handleby() {
      let _Url = "operator/update",
        _parms = { id: this.ruleForm.id };
      if (this.ruleForm.areaId) {
        _parms.areaId = this.ruleForm.areaId;
      }
      this.$http.put(_Url, _parms).then(res => {
        this.$message.success("操作成功");
        this.getoperatorlist();
        this.centerDialogVisible = false;
      });
    },
    //点击确认按钮，表单校验
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.handleby();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //重置
    resetForm(formName) {
      //   this.ruleForm.areaId = "";
      //   this.$refs[formName].resetFields();
    }
  },
  created() {
    this.getoperatorlist();
  }
};
</script>

<style lang="less">
.operation_part {
  .topleft {
    .el-input {
      width: 25%;
    }
  }
}
</style>

