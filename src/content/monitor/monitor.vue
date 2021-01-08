<template>
  <div class="tzpool_right">
    <div class="prescriptions">
      <span :class="['tab',activeIndex == 1?'active':'']" @click="activeIndex = 1">风险监测</span>
      <span :class="['tab',activeIndex == 2?'active':'']"  @click="activeIndex = 2">用药说明</span>
      <span class="account"><img src="/assets/headImg.png" class="account_headImg"><span v-if="JSON.stringify(userInfo) !== '{}'">{{userInfo.phone.replace(userInfo.phone.substring(3,7), "****")}}</span></span>
      <span class="Logout" @click="logout">退出登录</span>
    </div>
    <risk-monitoring v-show="activeIndex == 1 && (medicineResult.length > 0 || validateResults.length > 0)" @toMonitor="toMonitor" :medicineResult="medicineResult" :validateResults="validateResults" :riskStatiscal="riskStatiscal" :dataInfoDetail="searchInfo"></risk-monitoring>
    <div v-show="activeIndex == 1 && ((medicineResult.length == 0 && validateResults.length == 0))" class="noData">
      <div class="ai">
        <img src="/assets/robot.png" class="ai_robot">
        <p>合理用药检测中...</p>
      </div>
    </div>
    <medical-information  v-show="activeIndex == 2 && medicineResult.length > 0" @loginOutSon="listenLoginOut" :medicineResult="medicineResult"></medical-information>
    <div v-show="activeIndex == 2 && medicineResult.length == 0" class="noData">
      <div class="ai">
        <img src="/assets/robot.png" class="ai_robot1">
        <p>合理用药检测中...</p>
      </div>
    </div>
  </div>
</template>

<script>
import riskMonitoring from "./riskMonitoring";
import medicalInformation from "./medicalInformation";
export default {
  name: 'monitor',
  data () {
    return {
      activeIndex: 1,
      medicineResult: [],
      validateResults: [],
      riskStatiscal: {},
      userInfo: {},
      dataInfo:{},
      logoutState: true,
      timer: ""
    }
  },
  props:{
    showMonitor:{
      type: Boolean,
      default: false
    },
    dataInfoDetail: Object,
    searchInfo: Object,
    nickname:String,
    originStatus: Number,
    leaveModel: Boolean
  },
  computed: {
  },
  components:{
    riskMonitoring,
    medicalInformation
  },
  watch: {
    leaveModel(val) {
      if(!val && this.originStatus === 1) {
        this.medicineResult = []
        this.validateResults = []
      }
    },
    showMonitor(val) {
      if(val) {
        this.activeIndex = 1
        let that = this
        this.$getChromeStorage(['userInfo']).then(function (res) {
          that.userInfo = res.userInfo
        })
      }
    },
    dataInfoDetail: {
      handler (val,oldVal) {
        if(this.showMonitor) {
          this.dataInfoDetail = val
          // this.dataInfo.medicines.push(this.searchInfo)
        }
      },
      deep: true
    },
    searchInfo:{
      handler(val,oldVal) {
        let state = true
        if(this.searchInfo.medicineList.length > 0) {
          this.searchInfo.medicineList.forEach(ele => {
            if(ele.fullName === "" || ele.medicineAmount === "" || ele.formType === "" || ele.takeDose === "" || ele.takeFrequence === "" || ele.takeFrequence.length < 4 || ele.takeDirection === "" || ele.medicationDays === "") {
              state = false
            }
          })
        }else {
          state = false
        }
        if((this.searchInfo.dosage && this.searchInfo.fullName && this.searchInfo.medicineAmount) || this.searchInfo.primaryDiagnosis && state) {
          clearTimeout(this.timer)
          this.timer = setTimeout(()=> {
            this.dataInfo = this.dataInfoDetail
            this.rationalMedicineCheck(this.dataInfoDetail,"")
            this.rationalMedicineFlushInfo(this.dataInfoDetail)
          },200)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.insertImg()
  },
  methods:{
    insertImg () {
      var headImg = chrome.extension.getURL("assets/headImg.png");
      document.querySelector(".account_headImg").src = headImg;
      var robot = chrome.extension.getURL("assets/robot.png");
      document.querySelector(".ai_robot").src = robot;
      document.querySelector(".ai_robot1").src = robot;
    },
    async logout() {
      if(!this.logoutState == true) {
        return false
      } {
        this.logoutState = false
        this.$messageBox.confirm("<p style='color: #000000;line-height: 24px; font-size:16px'>是否退出当前账号?</p><p style='line-height: 24px;color: #595959;font-size: 16px;margin-top:16px'>退出登录后将不可使用桃子远程医疗助手相关功能。</p>", "退出登录", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        customClass: "messageDangerLogout",
        dangerouslyUseHTMLString: true
      }).then(async res=> {
        try {
          chrome.runtime.sendMessage({ logout: JSON.stringify({}) }, (response) => {
            const res = JSON.parse(response)
            if (res.code === 0) {
              this.$emit('loginOut', "")
              this.$setChromeStorage({ userInfo: {}})
              this.medicineResult = []
              this.validateResults = []
            } else {
              this.$message({
                message: res.message,
                type: 'error',
                customClass: "plugin-error__message"
              });
            }
          });
        } catch (error) {
          console.error(error)
        }
        this.logoutState = true
      }).catch(res=>{
        this.logoutState = true
      })
      }
    },
    toMonitor() {
      this.rationalMedicineCheck(this.dataInfo,"reCheck")
    },
    // 检测审方
    rationalMedicineCheck(data,action) {
      let medicineList = [];
      if(this.originStatus === 1) {
        let obj = {
          // medicineName: this.searchInfo.medicineName,///药名
          // specification:  this.searchInfo.specification,///规格
          medicineAmount: this.searchInfo.medicineAmount,//                 
          formType: this.searchInfo.formType,//片
          takeDose: this.searchInfo.takeDose,//剂量
          takeFrequence: this.searchInfo.takeFrequence,//频率
          takeDirection: this.searchInfo.takeDirection,
          medicationDays: "",
          usageAndDosage: this.searchInfo.dosage,
          fullName: this.searchInfo.fullName
        }
        medicineList.push(obj);
      }
      let params = {
        rp:{
          medicineList: this.originStatus === 1 ? medicineList:this.searchInfo.medicineList,
          source: this.originStatus === 1 ?'pdd':"meituan",
          endPoint: "plugin",
          clientID: '20052310152649060391301093',
          orderID: this.userInfo.orderID,
          doctorID: this.userInfo.keyID,
          doctorName:this.originStatus === 1 ? document.querySelector(".left-panel .nickname").innerText : document.querySelector(".header .boo-dropdown-rel").innerText,
          action: action
        },
        patientInfo:{
          patientName: data.patientInfo.patientName,
          patientSex: data.patientInfo.patientSex === "男"?'1':'2',
          patientAge: data.patientInfo.patientAge,
          patientWeight: data.patientInfo.patientWeight,
          illDesc: this.searchInfo.illDesc,
          allergyDetail: this.searchInfo.allergyDetail?this.searchInfo.allergyDetail:data.patientInfo.allergyDetail,
          sicknessDetail: this.searchInfo.sicknessDetail?this.searchInfo.sicknessDetail:data.patientInfo.sicknessDetail,
          liver: data.patientInfo.liver,
          renal: data.patientInfo.renal,
          pregnancy: data.patientInfo.pregnancy,
          primaryDiagnosis: this.searchInfo.primaryDiagnosis,
        }
      }
      this.validateResults = []
      this.riskStatiscal = {}
      let sendMessage = {}
      if(this.originStatus === 1) {
        sendMessage = {
          pddCheck: JSON.stringify(params)
        }
      }else if(this.originStatus === 2){
        sendMessage = {
          meituanCheck: JSON.stringify(params)
        }
      }
      chrome.runtime.sendMessage( sendMessage, (response) => {
        const res = JSON.parse(response)
        if (res.code === 0) {
          let validateResults = res.data.validateResults
          let arr = []
          validateResults.forEach(ele => {
            ele.state = true
            arr.push(ele)
          })
          this.validateResults = arr
          this.riskStatiscal = res.data.riskStatiscal
        }else if(res && res.code == 401) {
          this.$message({
            type: "error",
            message: '登录超时，重新登录',
            customClass: "plugin-error__message"
          })
          this.$emit('loginOut', "")
          this.$setChromeStorage({ userInfo: {}})
        }
      })
    },
    // 查询药品规格信息
    rationalMedicineFlushInfo(data) {
      this.medicineResult = []
      let sendMessage = {}
      if(this.originStatus === 1) {
        let params = {
          medicineName:this.searchInfo.fullName,
          useDosage:this.searchInfo.dosage
        }
        sendMessage = {
          pddFlushInfo: JSON.stringify(params)
        }
      }else {
        let medicineList = []
        this.searchInfo.medicineList.forEach(ele => {
          let obj = {
            medicineName: ele.fullName,
            takeDirection: ele.takeDirection,
            specification: ele.specification
          }
          medicineList.push(obj)
        })
        let params = { 
          meituanMedicineInfos: medicineList
        }
        sendMessage = {
          meituanFlushInfo: JSON.stringify(params)
        }
      }
      chrome.runtime.sendMessage( sendMessage, (response) => {
        const res = JSON.parse(response)
        if (res.code === 0) {
          if(this.originStatus === 1) {
            this.medicineResult.push(res.data)
          }else {
            this.medicineResult = res.data
          }
        }else if(res && res.code == 401) {
          this.$message({
            type: "error",
            message: '登录超时，重新登录',
            customClass: "plugin-error__message"
          })
          this.$emit('loginOut', "")
          this.$setChromeStorage({ userInfo: {}})
        }
      })
    },
    listenLoginOut() {
      this.$emit('loginOut', "")
      this.$setChromeStorage({ userInfo: {}})
    }
  }
}
</script>
<style>
*,*::before,*::after {
  box-sizing: inherit;
}
.tzpool_right {
  position: relative;
  width: 420px;
  background: #fff;
  height: 100vh;
  overflow: auto;
  z-index: 9999;
}
.tzpool_right .prescriptions {
  height: 42px;
  line-height: 42px;
  overflow: hidden;
}
.tzpool_right .prescriptions .tab {
  text-align: center;
  display: inline-block;
  width: 96px;
  font-size: 16px;
  line-height: 42px;
  height: 42px;
  border: 1px solid #387fe2;
  cursor: pointer;
  color: #262626;
  float: left;
}
.tzpool_right .active {
  background: #387fe2 !important;
  color: #fff !important;
}
.tzpool_right .account {
  font-size: 14px;
  color: #595959;
  margin-right: 18px;
}
.tzpool_right .account img {
  width: 14px;
  height: 14px;
  float: left;
  margin-left: 39px;
  margin-top: 14px;
  margin-right: 4px;
}
.tzpool_right .Logout {
  color: #595959;
  font-size: 14px;
  cursor: pointer;
}
.tzpool_right .noData {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 42px);
  color: #ffa216;
}
.tzpool_right .ai img{
  width: 144px;
  height: 144px;
  display: block;
}
.tzpool_right .ai p {
  text-align: center;
  color: #262626;
  font-size: 18px;
  line-height: 14px;
}
.messageDangerLogout  {
  width: 480px !important;
}
.messageDangerLogout .el-message-box__status{
  display: none !important;
}
.messageDangerLogout .el-message-box__message{
  padding-left: 12px !important;
}
.messageDangerLogout .el-message-box__header {
  border-bottom: 1px solid #eee !important;
}
.messageDangerLogout .el-message-box__header .el-message-box__title {
  text-align: center !important;
  font-weight: 700 !important;
}
.messageDangerLogout .el-message-box__btns {
  text-align: center !important;
  padding: 20px 15px 10px !important;
}
.messageDangerLogout .el-message-box__btns .el-button--primary{
  color: #fff !important;
  background-color: #387ef5 !important;
  border-color: #387ef5 !important;
 }
</style>