<template>
  <div class="apply_list mainboss">
    <div class="martop">
      <div class="topleft">
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
        <el-button type="primary" @click="getreplenisherlist(1)">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="replenisherlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="trueName" align="center" label="姓名"></el-table-column>
      <el-table-column prop="username" align="center" label="联系电话"></el-table-column>
      <el-table-column prop="hotelId" align="center" label="酒店名称"></el-table-column>
      <el-table-column prop="createTime" align="center" label="创建时间"></el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            v-show="scope.row.status!='1'"
            @click="handlebut(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >审批</el-button>
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
      title="审批"
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
        <el-form-item label="绑定酒店">
          <el-cascader
            placeholder="选择区域酒店"
            :show-all-levels="false"
            :options="options"
            filterable
            clearable
            @active-item-change="handleItemChange"
            @change="handlechange"
            @focus="getarea"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="ruleForm.createTime" :disabled="true" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleby">通过</el-button>
          <el-button type="danger" @click="handlerefuse">拒绝</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
var checkPhone = (rule, value, callback) => {
  const tel = /^0\d{2,3}-?\d{7,8}$/;
  const phone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  if (!value) {
    return callback(new Error("电话号码不能为空"));
  }
  setTimeout(() => {
    if (!Number.isInteger(+value)) {
      callback(new Error("请输入数字值"));
    } else {
      if (tel.test(value)) {
        callback();
      } else if (phone.test(value)) {
        callback();
      } else {
        callback(new Error("电话号码格式不正确"));
      }
    }
  }, 100);
};
export default {
  name: "apply_list",
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 15,
      supplierName: "",
      centerDialogVisible: false,
      ruleForm: {
        hotelId: ""
      },
      rules: {
        hotelId: [{ required: true, message: "请选择酒店", trigger: "change" }]
      },
      term: {
        hotelId: "",
        trueName:"",
        userNmae:"",
        status: 0
      },
      replenisherlist: [],
      options: [],
      hotellist: []
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        this.ruleForm.hotelId = "";
      }
    }
  },
  methods: {
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("store/areaList").then(res => {
          let _data = [];
          for (let i in res.data) {
            let _ob = {};
            _ob.value = res.data[i].id;
            _ob.label = res.data[i].name;
            _ob.children = [];
            _data.push(_ob);
          }
          this.options = _data;
        });
      }
    },
    handleItemChange(val) {
      this.gethotel(val[0]);
    },
    //查询酒店下拉列表
    gethotel(areaId) {
      this.$http.get("replenisher/hotelList/" + areaId).then(res => {
        let _datas = [];
        for (let i in this.options) {
          if (areaId == this.options[i].value) {
            for (let j in res.data) {
              let _obj = {};
              _obj.value = res.data[j].id;
              _obj.label = res.data[j].name;
              _datas.push(_obj);
            }
            this.options[i].children = _datas;
          }
        }
      });
    },
    handlechange(val) {
      if (this.centerDialogVisible) {
        this.ruleForm.hotelId = val[1];
      } else {
        this.term.hotelId = val[1];
      }
    },
    //获取列表数据
    getreplenisherlist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "/replenisher?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
          this.replenisherlist = [];
        } else {
          this.replenisherlist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getreplenisherlist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getreplenisherlist();
    },
    //打开编辑弹框
    openDialog(val) {
      this.centerDialogVisible = true;
    },
    //点击审批
    handlebut(obj) {
      for (let key in obj) {
        this.ruleForm[key] = obj[key];
      }

      this.ruleForm.hotelId = "";
      this.centerDialogVisible = true;
    },
    //审批通过
    handleby() {
      if (!this.ruleForm.hotelId) {
        this.$message.error("请选择酒店绑定");
      } else {
        let _Url = "replenisher/update",
          _parms = {
            id: this.ruleForm.id,
            hotelId: this.ruleForm.hotelId
          };
        this.$http.put(_Url, _parms).then(res => {
          this.$message.success("操作成功");
          this.getreplenisherlist();
          this.centerDialogVisible = false;
        });
      }
    },
    // 审批不通过
    handlerefuse() {
      this.$confirm("拒绝审批会删除未通过的数据，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete("replenisher/" + this.ruleForm.id).then(res => {
            this.$message.success("操作成功");
            this.getreplenisherlist();
            this.centerDialogVisible = false;
          });
        })
        .catch(() => {});
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
      this.ruleForm.hotelId = "";
      //   this.$refs[formName].resetFields();
    }
  },
  created() {
    this.getreplenisherlist();
  }
};
</script>

<style lang="less">
.apply_list {
  .topleft {
    .el-input {
      width: 40%;
    }
  }
}
</style>

