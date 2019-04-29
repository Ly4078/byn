<template>
  <div class="perlist mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="PermissionName"
          placeholder="请输入权限名称"
          @keyup.enter.native="getpermission(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getpermission(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建权限</el-button>
      </div>
    </div>
    <el-table
      :data="permissionlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="name" align="center" label="权限名称"></el-table-column>
      <el-table-column prop="url" align="center" label="权限地址"></el-table-column>
      <el-table-column prop="skey" align="center" label="权限KEY"></el-table-column>
      <el-table-column prop="sort" align="center" label="排序"></el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            @click="handledel(scope.row)"
            type="danger"
            size="mini"
            icon="el-icon-delete"
          >删除</el-button>
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
      :title="disval==1?'创建权限':'编辑权限'"
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
        <el-form-item label="父级资源" prop="parentKey">
          <el-select v-model="ruleForm.parentKey" placeholder="请选择父级资源">
            <el-option
              v-for="item in paginationlist"
              :key="item.id"
              :label="item.name"
              :value="item.skey"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="ruleForm.name" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="权限URL">
          <el-input v-model="ruleForm.url" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="权限KEY" prop="skey">
          <el-input v-model="ruleForm.skey" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="ruleForm.sort" maxlength="11" clearable></el-input>
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
  name: "perlist",
  data() {
    return {
      total: 0,
      ptotal: 0,
      disval: 1,
      pageNum: 1,
      pageSize: 15,
      PermissionName: "",
      loading: false,
      centerDialogVisible: false,
      actuserobj: {},
      ruleForm: {
        id: "",
        name: "",
        url: "",
        skey: "",
        sort: "",
        parentKey: ""
      },
      rules: {
        name: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
        url: [
          { required: true, message: "请输入权限地址(URL)", trigger: "blur" }
        ],
        skey: [{ required: true, message: "请输入权限KEY", trigger: "blur" }],
        sort: [{ required: true, message: "请输入排序", trigger: "blur" }]
      },
      permissionlist: [],
      paginationlist: []
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        for (let key in this.ruleForm) {
          this.ruleForm[key] = "";
        }
        this.actuserobj = {};
      }
    }
  },
  methods: {
    //获取列表数据
    getpermission(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url =
        "permission?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      if (this.PermissionName) {
        _Url += "&name=" + this.PermissionName;
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.PermissionName = "";
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.permissionlist = [];
        } else {
          let _data=res.data.data;
          _data=_data.sort(this.compare('sort'));
          this.permissionlist = res.data.data;
        }
      });
    },
    compare(property){
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    },
    //查询权限父菜单
    CurrentChange(val) {
      this.$http.get("permission/parent").then(res => {
        this.paginationlist = res.data;
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getpermission();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getpermission();
    },
    //打开编辑弹框
    openDialog(val) {
      if (this.paginationlist.length < 1) {
        this.CurrentChange();
      }
      this.disval = val;
      this.centerDialogVisible = true;
    },
    //点击编辑某条数据
    handleedit(obj) {
      // this.ruleForm = obj;
      this.actuserobj = obj;
      this.getidinfo(obj.id);
      this.openDialog(2);
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("permission/" + id).then(res => {
        let obj = res.data;
        obj.remark = obj.remark ? obj.remark : "";
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //点击删除某条数据
    handledel(obj) {
      this.$confirm("是否确定删除此数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete("permission/" + obj.id).then(res => {
            this.$message.success("删除操作成功！");
            this.getpermission();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //保存
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
    //重置
    resetForm(formName) {
      if (this.actuserobj && this.actuserobj.id) {
        this.getidinfo(this.actuserobj.id);
      } else {
        this.$refs[formName].resetFields();
      }
    },
    //保存编辑
    savedata() {
      let _Url = "permission",
        _parms = {};
      for (let key in this.ruleForm) {
        if (this.ruleForm[key]) {
          _parms[key] = this.ruleForm[key];
        }
      }
      // Content-Type: application/json
      // console.log("_parms:",_parms)
      // const formData = new FormData();
      // Object.keys(_parms).forEach(key =>
      //   formData.append(key, _parms[key])
      // );
      // // config.data = formData;
      // console.log('formData:',formData)
      if (this.disval == 1) {
        this.$http.post(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getpermission();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getpermission();
          }
        });
      }
    }
  },
  created() {
    this.getpermission();
  }
};
</script>
<style lang="less" scoped>
.perlist {
  .topleft {
    width: 300px;
    .el-input {
      width: 70%;
    }
  }
}
</style>
