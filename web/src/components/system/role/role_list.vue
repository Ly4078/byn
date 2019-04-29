<template>
  <div class="role_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="roleName"
          placeholder="请输入角色名称"
          @keyup.enter.native="getrole(1)"
          clearable
        ></el-input>
        <el-button type="primary" @click="getrole(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建角色</el-button>
      </div>
    </div>
    <el-table
      :data="permissionlist"
      :height="this.$store.state.tableHeight"
      border
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
      style="width: 100%"
    >
      <el-table-column prop="name" align="center" label="角色名称"></el-table-column>
      <el-table-column prop="code" align="center" label="角色代码"></el-table-column>
      <el-table-column prop="remark" align="center" label="角色说明"></el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            @click="handlemenu(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-tickets"
          >菜单</el-button>
          <!-- <el-button
            @click="handledel(scope.row)"
            type="danger"
            size="mini"
            icon="el-icon-delete"
          >删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>
    <span class="pagein">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="10"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </span>

    <el-dialog
      :title="disval==1?'创建角色':'编辑角色'"
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="ruleForm.name" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色code" prop="code">
          <el-input v-model="ruleForm.code" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色说明" prop="remark">
          <el-input v-model="ruleForm.remark" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
          <el-button @click="resetForm('ruleForm')">表单重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      title="分配菜单"
      :visible.sync="DialogVisible"
      :modal-append-to-body="false"
      width="50%"
      center
    >
      <el-table :data="rolemenulist" border stripe style="width: 100%">
        <el-table-column prop="name" align="center" label="一级菜单" width="100%"></el-table-column>
        <el-table-column label="二级菜单">
          <template slot-scope="scope">
            <el-checkbox-group v-model="checkList" @change="handleCheckedCitiesChange">
              <el-checkbox
                v-for="item in scope.row.child"
                :key="item.id"
                :label="item.id"
              >{{item.name}}</el-checkbox>
            </el-checkbox-group>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "perlist",
  data() {
    return {
      total: 0,
      disval: 1,
      pageNum: 1,
      pageSize: 15,
      roleName: "",
      loading: false,
      DialogVisible: false,
      centerDialogVisible: false,
      checkList: [],
      rolemenulist: [],
      permissionlist: [],
      ruleobj: {},
      actuserobj: {},
      ruleForm: {
        id: "",
        name: "",
        code: "",
        remark: ""
      },
      rules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        code: [{ required: true, message: "请输入角色code", trigger: "blur" }],
        remark: [{ required: true, message: "请输入角色说明", trigger: "blur" }]
      }
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
    getrole(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "role?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      //如果roleName有值则通过roleName查询，如果roleName为空，则查询所有
      if (this.roleName) {
        _Url += "&name=" + this.roleName;
      }
      this.loading = true;
      this.$http.get(_Url).then(res => {
        this.loading = false;
        this.roleName = "";
        this.total = res.data.total;
        if (res.data.total < 1) {
          this.$message("没有查询到相关数据信息");
          this.permissionlist = [];
        } else {
          this.permissionlist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getrole();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getrole();
    },
    //打开编辑弹框
    openDialog(val) {
      this.disval = val;
      this.centerDialogVisible = true;
    },
    //点击编辑某条数据
    handleedit(obj) {
      this.actuserobj = obj;
      this.getidinfo(obj.id);
      this.openDialog(2);
    },
    //二级菜单变化时
    handleCheckedCitiesChange(value) {
      if (this.checkList.length > 0) {
        this.putrolemenu();
      }
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("role/" + id).then(res => {
        let obj = res.data;
        obj.remark = obj.remark ? obj.remark : "";
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //点击菜单某条数据
    handlemenu(obj) {
      this.checkList = [];
      this.DialogVisible = true;
      this.ruleobj = obj;
      this.getrolemenu(obj);
    },
    //获取菜单列表
    getrolemenu(obj) {
      this.$http.get("role/menu/" + obj.id).then(res => {
        let _data = res.data;
        for (let i in _data) {
          for (let j in _data[i].child) {
            if (_data[i].child[j].status == 1) {
              this.checkList.push(_data[i].child[j].id);
            }
          }
        }
        this.rolemenulist = _data;
      });
    },
    //修改用户权限
    putrolemenu() {
      let _parms = {
        roleId: this.ruleobj.id,
        permission: this.checkList
      };
      this.$http.put("role/menu", _parms).then(res => {
        if (res.status == 200) {
          this.$message.success("保存成功！");
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
          this.$http.delete("role/" + obj.id).then(res => {
            this.$message.success("删除操作成功！");
            this.getrole();
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
      let _Url = "role",
        _parms = {};
      for (let key in this.ruleForm) {
        if (this.ruleForm[key]) {
          _parms[key] = this.ruleForm[key];
        }
      }
      if (this.disval == 1) {
        this.$http.post(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getrole();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getrole();
          }
        });
      }
    }
  },
  created() {
    this.getrole();
  }
};
</script>


<style lang="less" scoped>
.topleft {
  width: 300px;
  .el-input {
    width: 70%;
  }
}
</style>
