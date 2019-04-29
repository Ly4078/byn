<template>
  <div class="user_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="term.name"
          placeholder="请输入用户名"
          @keyup.enter.native="getuserlist(1)"
          clearable
        ></el-input>
        <el-select v-model="term.hotelId" clearable filterable placeholder="请选择" @focus="gethotel">
          <el-option
            v-for="item in hotellist"
            :key="item.value"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="getuserlist(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建帐户</el-button>
      </div>
    </div>
    <el-table
      :data="userlist"
      :height="this.$store.state.tableHeight"
      border
      style="width: 100%"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      element-loading-text="数据正在加载中"
    >
      <el-table-column prop="username" align="center" label="用户名"></el-table-column>
      <el-table-column prop="trueName" align="center" label="真实姓名"></el-table-column>
      <!-- <el-table-column prop="email" align="center" label="邮箱"></el-table-column> -->
      <el-table-column prop="createTime" align="center" label="创建时间"></el-table-column>
      <el-table-column align="center" label="当前状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            @change="changestatus(scope.row)"
            active-text
            inactive-text
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="350px">
        <template slot-scope="scope">
          <el-button
            :disabled="!scope.row.status"
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            :disabled="!scope.row.status"
            @click="handledeploy(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-service"
          >分配角色</el-button>
          <el-button
            :disabled="!scope.row.status"
            @click="handlereset(scope.row)"
            type="danger"
            size="mini"
            icon="el-icon-setting"
          >重置密码</el-button>
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
      :title="disval==3?'分配角色':disval==1?'创建权限':'编辑权限'"
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
        v-show="disval==1 || disval==2"
      >
        <el-form-item label="账户名称" prop="username">
          <el-input v-model="ruleForm.username" :disabled="disval==2?true:false" clearable></el-input>
        </el-form-item>
        <el-form-item label="账户密码" prop="password" v-if="disval==1">
          <el-input v-model="ruleForm.password" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="trueName">
          <el-input v-model="ruleForm.trueName" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="ruleForm.email" maxlength="255" clearable></el-input>
        </el-form-item>
        <el-form-item label="用户类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择用户类型">
            <el-option v-for="item in typelist" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
          <el-button @click="resetForm('ruleForm')">表单重置</el-button>
        </el-form-item>
      </el-form>
      <ul v-show="disval==3" class="diaul">
        <li v-for="item in rolelist" :key="item.id">
          <el-checkbox v-model="item.status" :label="item.status">{{item.name}}</el-checkbox>
        </li>
        <el-button type="primary" @click="saverole">保存</el-button>
      </ul>
    </el-dialog>
  </div>
</template>
<script>
var checkEmail = (rule, value, callback) => {
  const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
  if (!value) {
    return callback(new Error("邮箱不能为空"));
  }
  setTimeout(() => {
    if (mailReg.test(value)) {
      callback();
    } else {
      callback(new Error("请输入正确的邮箱格式"));
    }
  }, 100);
};
export default {
  name: "perlist",
  data() {
    return {
      total: 0,
      ptotal: 0,
      disval: 1,
      pageNum: 1,
      pageSize: 15,
      term: {
        hotelId: "",
        name: ""
      },
      loading: false,
      centerDialogVisible: false,
      actuserobj: {},
      ruleForm: {
        username: "",
        password: "",
        trueName: "",
        email: "",
        type: ""
      },
      rules: {
        username: [
          { required: true, message: "请输入账户名称", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入账户密码", trigger: "blur" },
          {
            pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,30}$/,
            message:
              "密码为数字，小写字母，大写字母，特殊符号 至少包含三种，长度为 8 - 30位"
          }
        ],
        trueName: [
          { required: true, message: "请输入真实姓名", trigger: "blur" }
        ],
        email: [{ required: true, validator: checkEmail, trigger: "blur" }],
        type: [{ required: true, message: "请选择用户类型", trigger: "change" }]
      },
      rolelist: [],
      typelist: [
        {
          id: 1,
          label: "系统管理用户"
        },
        {
          id: 2,
          label: "酒店管理用户"
        },
        {
          id: 3,
          label: "供应商用户"
        }
      ],
      hotellist: [],
      userlist: []
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (this.centerDialogVisible) {
      } else {
        for (let key in this.ruleForm) {
          this.ruleForm[key] = "";
        }
        this.actuserobj = {};
      }
    }
  },
  methods: {
    //查询酒店下拉列表
    gethotel() {
      if (this.hotellist.length < 1) {
        this.$http.get("user/hotel").then(res => {
          this.hotellist = res.data;
        });
      }
    },
    //获取列表数据
    getuserlist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "user?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
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
          this.userlist = [];
        } else {
          let _data = res.data.data;
          for (let i in _data) {
            if (_data[i].status == 1) {
              _data[i].status = true;
            } else {
              _data[i].status = false;
            }
          }
          this.userlist = res.data.data;
        }
      });
    },
    //表格翻页
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getuserlist();
    },
    //修改每页请求数据条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.getuserlist();
    },
    //打开编辑弹框
    openDialog(val) {
      this.disval = val;
      this.centerDialogVisible = !this.centerDialogVisible;
    },
    //点击编辑某条数据
    handleedit(obj) {
      this.getidinfo(obj.id);
      this.openDialog(2);
      this.actuserobj = obj;
    },
    //分配角色
    handledeploy(obj) {
      this.openDialog(3);
      this.actuserobj = obj;
      this.getrole(obj.id);
    },
    //重置密码
    handlereset(obj) {
      this.$confirm(
        "重置密码后，之前旧密码将不能再使用，是否确认重置密码?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.$http.put("user/resetPassword/" + obj.id).then(res => {
            if (res.status == 200) {
              this.$message.success("重置成功！");
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消密码重置"
          });
        });
    },
    //查询可分配角色
    getrole(id) {
      let _Url = "user/role/" + id;
      this.$http.get(_Url).then(res => {
        if (res.status == 200) {
          for (let i in res.data) {
            if (res.data[i].status == 1) {
              res.data[i].status = true;
            } else {
              res.data[i].status = false;
            }
          }
          this.rolelist = res.data;
        }
      });
    },
    //保存分配角色
    saverole() {
      let role = [];
      for (let i in this.rolelist) {
        if (this.rolelist[i].status) {
          role.push(this.rolelist[i].id);
        }
      }
      if (role.length < 1) {
        this.$message.error("请至少选择一个选项");
        return;
      }
      let _parms = {
        userId: this.actuserobj.id,
        role: role
      };
      this.$http.put("user/role", _parms).then(res => {
        this.$message.success("保存成功");
        this.centerDialogVisible = !this.centerDialogVisible;
      });
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("user/" + id).then(res => {
        let obj = res.data;
        obj.remark = obj.remark ? obj.remark : "";
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //修改用户状态
    changestatus(obj) {
      let _Url = "user/status",
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
          this.$message.success("修改成功");
        }
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
      let _Url = "user",
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
            this.getuserlist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getuserlist();
          }
        });
      }
    }
  },
  created() {
    this.getuserlist();
  }
};
</script>
<style lang="less">
.user_list {
  .topleft {
    .el-input {
      width: 40%;
    }
  }
  .diaul {
    width: 70%;
    padding-left: 15%;
    li {
      margin: 5px;
    }
    button {
      margin: 20px auto;
    }
  }
}
</style>
