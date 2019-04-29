<template>
  <div class="equip_list mainboss">
    <div class="martop">
      <div class="topleft">
        <el-input
          v-model="term.name"
          placeholder="请输入设备名称"
          @keyup.enter.native="getequiplist(1)"
          clearable
        ></el-input>
        <el-input
          v-model="term.serialNo"
          placeholder="请输入设备编号"
          @keyup.enter.native="getequiplist(1)"
          clearable
        ></el-input>
        <el-select v-model="term.status" clearable filterable placeholder="请选择状态">
          <el-option v-for="item in statuslist" :key="item.id" :label="item.label" :value="item.id"></el-option>
        </el-select>
        <el-select v-model="term.voltage" clearable filterable placeholder="请选择电压量">
          <el-option
            v-for="item in voltagelist"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="getequiplist(1)">搜索</el-button>
      </div>
      <div class="topright">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">创建设备</el-button>
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
        <template slot-scope="scope">{{scope.row.type | fitertype}}</template>
      </el-table-column>
      <el-table-column align="center" label="设备电量">
        <template slot-scope="scope">{{scope.row.voltage | fitervoltage}}</template>
      </el-table-column>
      <el-table-column prop="updateTime" align="center" label="上次更新时间"></el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">{{scope.row.status | fiterstatus}}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template slot-scope="scope">
          <el-button
            @click="handleedit(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            @click="handlecopy(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-tickets"
          >复制</el-button>
          <el-button
            @click="handleqrcode(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-menu"
          >二维码</el-button>
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
      :title="disval ==3?'设备二维码':disval==1?'创建设备':'编辑设备'"
      :visible.sync="centerDialogVisible"
      :top="isfrist?'-100%':disval ==3?'5%':'1%'"
      :modal-append-to-body="false"
      :width="disval ==3?'14%':'70%'"
      center
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
        v-show="disval !=3"
        v-if="centerDialogVisible"
      >
        <fieldset>
          <legend>设备信息</legend>
          <el-form-item label="设备编号" required>
            <el-col :span="6">
              <el-form-item prop="serialNo">
                <el-input
                  v-model="ruleForm.serialNo"
                  placeholder="请输入设备编号"
                  :disabled="disval==2?true:false"
                  oninput="if(value.length>64)value=value.slice(0,64)"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备名称" prop="name">
                <el-input v-model="ruleForm.name" placeholder="请输入设备名称" maxlength="256" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <!-- prop="hotelId" -->
              <el-form-item label="所在酒店" prop="hotelId">
                <el-cascader
                  @focus="getarea"
                  :placeholder="actuserobj.hotelName"
                  :show-all-levels="false"
                  :options="options"
                  filterable
                  clearable
                  @active-item-change="handleItemChange"
                  @change="handlechange"
                ></el-cascader>
              </el-form-item>
            </el-col>
          </el-form-item>

          <el-form-item label="所在房间" required>
            <el-col :span="6">
              <el-form-item label prop="roomId">
                <!-- <el-input v-model="ruleForm.roomNo" placeholder="请输入所在房间" clearable></el-input> -->
                <el-select v-model="ruleForm.roomId" clearable filterable placeholder="请输入所在酒店">
                  <el-option
                    v-for="item in roomlist"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备类型" prop="type">
                <el-select v-model="ruleForm.type" placeholder="请选择设备类型">
                  <el-option
                    v-for="item in device"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备状态" v-show="disval == 2">
                <el-select v-model="ruleForm.status" placeholder="请选择设备状态">
                  <el-option
                    v-for="item in statuslist"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                    :disabled="item.disabled"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="ruleForm.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              maxlength="500"
              clearable
            ></el-input>
          </el-form-item>

          <el-form-item v-show="disval == 2">
            <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
            <!-- <el-button @click="resetForm('ruleForm')" >表单重置</el-button> -->
          </el-form-item>
        </fieldset>

        <fieldset v-if="ruleForm.type">
          <legend>货道信息</legend>
          <el-form-item label="货道编号" v-for="(item,index) in ruleForm.channelList" :key="index">
            <el-col :span="6">
              <el-form-item>
                <el-input
                  v-model="item.serialNo"
                  placeholder="请输入设备编号"
                  type="number"
                  :disabled="true"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item
                label="货道商品"
                :prop="'channelList.' + index +'.goodsId'"
                :rules="newrules.cheackgoods"
              >
                <el-select
                  v-model="item.goodsId"
                  clearable
                  filterable
                  placeholder="请选择商品"
                >
                  <el-option
                    v-for="item in goodslist"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6">
              <el-form-item label="货道库存">
                <el-input
                  v-model="item.stock"
                  placeholder="请输入货道库存"
                  type="number"
                  :disabled="true"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>-->
            <el-col :span="8">
              <el-form-item
                label="货道状态"
                :prop="'channelList.' + index +'.status'"
                :rules="newrules.cheackstatus"
              >
                <el-select v-model="item.status" placeholder="请选择货道状态">
                  <el-option
                    v-for="item in channestatus"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-show="disval ==2">
              <el-button @click="handlesave(item)" type="primary" size="mini" icon="el-icon-edit">保存</el-button>
            </el-col>
          </el-form-item>
        </fieldset>
        <el-form-item v-show="disval == 1">
          <el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
          <el-button @click="resetForm('ruleForm')">表单重置</el-button>
        </el-form-item>
      </el-form>
      <div v-show="disval ==3">
        <div class="qrimg imageWrapper" ref="imageWrapper" id="imageWrapper">
          <div id="qrcode" ref="qrcode"></div>
          <slot v-show="actuserobj.serialNo">{{actuserobj.serialNo }}</slot>
        </div>
        <el-button type="primary" class="doloadbut" @click="downloadImg">下载二维码</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="请输入新设备，并确认保存"
      :visible.sync="DialogVisible"
      :modal-append-to-body="false"
      top="5%"
      width="40%"
      center
    >
      <el-form
        :model="Formedit"
        :rules="rules"
        ref="Formedit"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="设备编号" prop="serialNo">
          <el-input
            v-model="Formedit.serialNo"
            placeholder="请输入设备编号"
            oninput="if(value.length>64)value=value.slice(0,64)"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="Formedit.name" placeholder="请输入设备名称" maxlength="256" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('Formedit')">确认保存</el-button>
          <el-button @click="resetForm('Formedit')">表单重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcodejs2";
import html2canvas from "html2canvas";
var cheackNumber = (rule, value, callback) => {
  value *= 1;
  if (!value) {
    callback(new Error("请输入设备编号"));
  }
  setTimeout(() => {
    if (Number.isFinite(value)) {
      if (value < 0) {
        callback(new Error("设备编号不应该是小于0"));
      } else {
        if (Number.isInteger(value)) {
          callback();
        } else {
          callback(new Error("设备编号应该是一个正整数"));
        }
      }
    } else {
      callback(new Error("设备编号应该是一个正整数"));
    }
  }, 100);
};

export default {
  name: "equip_list",
  data() {
    return {
      isfrist:true,
      disval: 1,
      total: 0,
      pageNum: 1,
      pageSize: 15,
      loading: false,
      DialogVisible: false,
      centerDialogVisible: true,
      arealist: [],
      equiplist: [],
      hotelList: [],
      roomlist: [],
      options: [],
      goodslist: [],
      device: [
        {
          id: 1,
          label: "6货道"
        },
        {
          id: 2,
          label: "8货道"
        },
        {
          id: 3,
          label: "10货道"
        }
      ],
      channestatus: [
        {
          id: 1,
          label: "有效"
        },
        {
          id: 2,
          label: "作废"
        },
        {
          id: 3,
          label: "故障"
        }
      ],
      statuslist: [
        {
          id: 1,
          label: "离线",
          disabled: true
        },
        {
          id: 2,
          label: "在线",
          disabled: true
        },
        {
          id: 3,
          label: "停用"
        },
        {
          id: 4,
          label: "故障"
        }
      ],
      voltagelist: [
        {
          id: 1,
          label: ">80%"
        },
        {
          id: 2,
          label: "50%~80%"
        },
        {
          id: 3,
          label: "20%~50%"
        },
        {
          id: 4,
          label: "<20%"
        }
      ],
      actuserobj: {},
      term: {
        serialNo: "",
        name: "",
        status: "",
        voltage: ""
      },
      channobj: {
        equipId: "",
        goodsId: "",
        id: "",
        serialNo: "",
        status: "",
        stock: ""
      },
      Formedit: {
        serialNo: "",
        name: ""
      },
      ruleForm: {
        hotelId: "",
        id: "",
        name: "",
        remark: "",
        roomId: "",
        serialNo: "",
        status: 1,
        type: "",
        channelList: []
      },
      rules: {
        name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
        serialNo: [
          { required: true, message: "请输入设备编号", trigger: "blur" }
        ],
        roomId: [
          { required: true, message: "请选择房间号", trigger: "change" }
        ],
        hotelId: [
          { required: true, message: "请选择酒店名称", trigger: "change" }
        ],
        status: [
          { required: true, message: "请选择设备状态", trigger: "change" }
        ],
        type: [
          { required: true, message: "请选择设备类型", trigger: "change" }
        ],
        goodsId: [
          { required: true, message: "请选择货道商品", trigger: "change" }
        ],
        channstatus: [
          { required: true, message: "请选择货道状态", trigger: "change" }
        ]
      },
      newrules: {
        cheackgoods: [
          {
            required: true,
            message: "请选择货道商品",
            trigger: ["blur", "change"]
          }
        ],
        cheackstatus: [
          {
            required: true,
            message: "请选择货道状态",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  watch: {
    centerDialogVisible: function() {
      if (!this.centerDialogVisible) {
        for (let key in this.ruleForm) {
          if (this.ruleForm[key]) {
            this.ruleForm[key] = "";
          }
        }
        this.ruleForm.channelList = [];
        this.actuserobj = {};
      }
    },
    DialogVisible: function() {
      if (!this.DialogVisible) {
        for (let key in this.Formedit) {
          this.Formedit[key] = "";
        }
      }
    },
    "ruleForm.hotelId": {
      handler(value) {
        if (value) {
          this.getroomlist(value);
        } else {
          this.roomlist = [];
          if (this.ruleForm.roomId) {
            this.ruleForm.roomId = "";
          }
        }
      }
    },
    "ruleForm.type": {
      handler(value) {
        if (value) {
          this.setchannelList(value);
        } else {
          this.ruleForm.channelList = [];
        }
      },
      deep: true
    }
  },
  filters: {
    fitertype: function(val) {
      if (val == 1) {
        return "6货道";
      } else if (val == 2) {
        return "8货道";
      } else if (val == 3) {
        return "10货道";
      }
    },
    fiterstatus: function(val) {
      if (val == 1) {
        return "离线";
      } else if (val == 2) {
        return "在线";
      } else if (val == 3) {
        return "停用";
      } else if (val == 4) {
        return "故障";
      }
    },
    flterserialno: function(val) {
      if (val) {
        let _serialNo = val.substring(val.length - 8);
        return _serialNo;
      }
    },
    fitervoltage: function(val) {
      if (val == 1) {
        return ">80%";
      } else if (val == 2) {
        return "50%~80%";
      } else if (val == 3) {
        return "20%~50%";
      } else if (val == 4) {
        return "<20%";
      }
    }
  },
  methods: {
    //查询区域下拉列表
    getarea() {
      if (this.options.length < 1) {
        this.$http.get("equip/areaList").then(res => {
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
      this.$http.get("equip/hotelList/" + areaId).then(res => {
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
      if(this.centerDialogVisible){
        this.ruleForm.hotelId=val[1]
      }else{
        this.term.hotelId = val[1];
      }
    },
    //查询房间列表
    getroomlist(id) {
      this.$http.get("equip/roomlList/" + id).then(res => {
        this.roomlist = res.data;
      });
    },
    //查询商品列表
    getgoods() {
      if (this.goodslist.length < 1) {
        this.$http.get("equip/goods").then(res => {
          this.goodslist = res.data;
        });
      }
    },
    //查询列表数据
    getequiplist(val) {
      if (val == 1) {
        this.pageNum = 1;
      }
      let _Url = "equip?pageNum=" + this.pageNum + "&pageSize=" + this.pageSize;
      for (let key in this.term) {
        if (this.term[key]) {
          _Url += "&" + key + "=" + this.term[key];
        }
      }
      this.$http.get(_Url).then(res => {
        let _data = res.data.data;
        this.equiplist = _data;
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
    },
    //打开编辑弹框
    openDialog(val) {
      this.getgoods();
      let _this = this;
      this.disval = val;
      this.centerDialogVisible = !this.centerDialogVisible;
      if (val == 3) {
        let qrcodeEL = document.getElementById("qrcode");
        let qrcode = new QRCode(qrcodeEL);
        document.getElementById("qrcode").innerHTML = "";
        setTimeout(() => {
          _this.qrcode();
        }, 100);
      }
    },
    //点击编辑某条数据
    handleedit(obj) {
      this.getidinfo(obj.id);
      this.openDialog(2);
      this.actuserobj = obj;
    },
    //点击复制某条数据
    handlecopy(obj) {
      this.actuserobj = obj;
      this.DialogVisible = true;
    },
    //点击查看二维码
    handleqrcode(obj) {
      this.isfrist=false;
      this.actuserobj = obj;
      this.getidinfo(obj.id);
      this.openDialog(3);
    },
    //通过ID查询某个数据信息
    getidinfo(id) {
      this.$http.get("equip/" + id).then(res => {
        let obj = res.data;
        this.actuserobj.children=obj;
        obj.type = Number(obj.type);
        for (let key in obj) {
          for (let i in obj.channelList) {
            obj.channelList[i].serialNo = Number(obj.channelList[i].serialNo);
            obj.channelList[i].stock = Number(obj.channelList[i].stock);
          }
        }
        obj.channelList.sort(function(a, b) {
          if (a.serialNo < b.serialNo) {
            return -1;
          } else if (a.serialNo > b.serialNo) {
            return 1;
          }
          return 0;
        });
        obj.remark = obj.remark ? obj.remark : "";
        for (let key in obj) {
          // if (obj[key]) {
          this.ruleForm[key] = obj[key];
          // }
        }
      });
    },
    //点击确认按钮，进行表单校验
    submitForm(formName) {
      if (this.disval == 2) {
        delete this.ruleForm.channelList;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (formName == "Formedit") {
            this.savecopy();
          } else if (formName == "ruleForm") {
            this.savedata();
          }
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
        this.ruleForm.remark = "";
      }
    },
    // 保存复制编辑
    savecopy() {
      let _Url = "equip/copy",
        _parms = {};
      _parms = {
        id: this.actuserobj.id,
        serialNo: this.Formedit.serialNo,
        name: this.Formedit.name
      };
      this.$http.post(_Url, _parms).then(res => {
        this.$message.success("操作成功");
        this.getequiplist();
        this.DialogVisible = false;
      });
    },
    //保存修改编辑
    savedata() {
      let _Url = "equip",
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
            this.getequiplist();
          }
        });
      } else if (this.disval == 2) {
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
            this.centerDialogVisible = !this.centerDialogVisible;
            this.getequiplist();
          }
        });
      }
    },
    //保存货道信息修改
    handlesave(obj) {
      let _Url = "equip/channel",
        _parms = {};
      if (!obj.goodsId) {
        this.$message.error("请选择商品");
      } else if (!obj.status) {
        this.$message.error("请选择状态");
      } else {
        _parms = {
          goodsId: obj.goodsId,
          id: obj.id,
          status: obj.status
        };
        this.$http.put(_Url, _parms).then(res => {
          if (res.status == 200) {
            this.$message.success("保存成功");
          }
        });
      }
    },
    //添加货道
    setchannelList(val) {
      let _length = 0;
      if (val == 1) {
        _length = 6;
      } else if (val == 2) {
        _length = 8;
      } else if (val == 3) {
        _length = 10;
      }
      let _diff = Number(_length) - Number(this.ruleForm.channelList.length);
      if (_diff > 0) {
        for (let i = 0; i < _diff; i++) {
          let _channobj = {
            goodsId: "",
            serialNo: Number(this.ruleForm.channelList.length) + 1,
            status: "",
            stock: Number(this.ruleForm.channelList.length) + 1
          };
          this.ruleForm.channelList.push(_channobj);
        }
      } else {
        let _ndiff = Math.abs(_diff);
        for (let i = 0; i < _ndiff; i++) {
          this.ruleForm.channelList.pop();
        }
      }
    },
    // 生成二维码
    qrcode() {
      let qrcode = new QRCode("qrcode", {
        width: 114, // 设置宽度，单位像素
        height: 114, // 设置高度，单位像素
        text: this.$GLOBAL.qrAPI + this.actuserobj.serialNo // 设置二维码内容或跳转地址
      });
    },
    //下载设备二维码
    downloadImg() {
      html2canvas(document.querySelector("#imageWrapper")).then(canvas => {
        let dataURL = canvas.toDataURL("image/png");
        let a = document.createElement("a");
        let event = new MouseEvent("click");
        // 下载图名字
        a.download = this.actuserobj.name;
        //url
        a.href = dataURL;
        //合成函数，执行下载
        a.dispatchEvent(event);
      });
    }
  },
  created() {
    this.getequiplist();
    const _this=this;
    setTimeout(() => {
        _this.centerDialogVisible=false;
    },10);
  }
};
</script>

<style lang="less">
.equip_list {
  .topleft {
      .el-input {
        width: 20%;
      }
    }
  fieldset {
    padding: 5px;
    border: 1px solid pink;
    margin-bottom: 20px;
  }

  .qrimg {
    #qrcode {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    width: 140px;
    margin: 0 auto;
    text-align: center;
    margin-bottom: 20px;
    padding: 10px 5px;
    border: 1px solid pink;
  }
  .doloadbut {
    margin-left: 25%;
  }
}
</style>