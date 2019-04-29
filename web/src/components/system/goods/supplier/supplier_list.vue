<template>
  <div class="supplier_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input v-model="supplierName" placeholder="供应商名称" @keyup.enter.native="getsupplylist(1)" clearable></el-input>
        <el-button type="primary" @click="getsupplylist(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建供应商</el-button>
      </div>
    </div>
    <el-table
      :data="supplylist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="name" align="center" label="供应商名称"></el-table-column>
      <el-table-column prop="contactName" align="center" label="联系人"></el-table-column>
      <el-table-column prop="contactTel" align="center" label="联系电话"></el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status==1?'':'info'">{{scope.row.status | fiterstatus}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
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
      :title="disval==1?'创建供应商':'编辑供应商'"
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
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入供应商名称" maxlength="100" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="ruleForm.contactName" placeholder="请输入联系人" maxlength="10" clearable></el-input>
        </el-form-item>

        <el-form-item label="联系电话" prop="contactTel">
          <el-input v-model="ruleForm.contactTel" placeholder="请输入联系电话" type="number" oninput="if(value.length>11)value=value.slice(0,11)" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择状态">
            <el-option
              v-for="item in statuslist"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            ></el-option>
          </el-select>
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
  name: "supplier_list",
  data() {
    return {
      disval: 1,
      total: 0,
      pageNum: 1,
      pageSize: 15,
      supplierName: "",
      centerDialogVisible: false,
      actuserobj:{},
      ruleForm: {
        contactName: "",
        contactTel: "",
        id: "",
        name: "",
        remark: "",
        status: ""
      },
      rules: {
        name: [{ required: true, message: "请输入区域名称", trigger: "blur" }],
        contactTel: [
          { required: true, validator: checkPhone, trigger: "blur" }
        ],
        contactName: [
          { required: true, message: "请输入联系人", trigger: "blur" }
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }]
      },
      supplylist: [],
      statuslist: [
        {
          id: 1,
          label: "有效"
        },
        {
          id: 2,
          label: "无效"
        }
      ]
    };
  },
  filters: {
    fiterstatus: function(val) {
      if (val == 1) {
        return "有效";
      } else {
        return "无效";
      }
    }
  },
  watch:{
    centerDialogVisible:function(){
      if(!this.centerDialogVisible){
        for (let key in this.ruleForm) {
          if (this.ruleForm[key]) {
            this.ruleForm[key] = "";
          }
        }
        this.actuserobj={};
      }
    }

  },
  methods: {
    //获取列表数据
    getsupplylist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "supply?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      if (this.supplierName) {
        _Url += "&name=" + this.supplierName;
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.total = res.data.total;
        if (res.data.total < 1) {
         this.$message("没有查询到相关数据信息");
          this.supplylist = [];
        } else {
          this.supplylist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getsupplylist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getsupplylist();
    },
    //打开编辑弹框
    openDialog(val) {
      this.disval = val;
      this.centerDialogVisible = true;
    },
    //点击编辑某条数据
    handleedit(obj) {
      // this.ruleForm = obj;
      this.actuserobj=obj;
      this.getidinfo(obj.id);
      this.openDialog(2);
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("supply/" + id).then(res => {
        let obj = res.data;
        obj.remark=obj.remark?obj.remark:"";
        for (let key in obj) {
          // if (obj[key]) {
            this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //点击确认按钮，进行表单校验
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.savedata();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //表单重置
    resetForm(formName) {
       if(this.actuserobj && this.actuserobj.id){
         this.getidinfo(this.actuserobj.id);
       }else {
         this.$refs[formName].resetFields();
       }
    },
    //保存编辑
    savedata() {
      let _Url = "supply",
        _parms = {};
      for (let key in this.ruleForm) {
        // if (this.ruleForm[key]) {
        _parms[key] = this.ruleForm[key];
        // }
      }
      if (this.disval == 1) {
        this.$http.post(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getsupplylist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getsupplylist();
          }
        });
      }
    }
  },
  created() {
    this.getsupplylist();
  }
};
</script>

<style lang="less">
.supplier_list {
  .topleft {
      .el-input {
        width: 70%;
      }
    }
}
</style>

