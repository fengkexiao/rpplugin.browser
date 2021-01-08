import Vue from 'vue'
import Login from './login'
import Monitor from './monitor/monitor'
import api from './../api'
import './common.css'
import { get, post, origin } from './../http'
import { Button, Input, Dialog, Card, Checkbox, Dropdown, DropdownMenu, Tabs, TabPane, Select, Option, DropdownItem, Pagination, Message, Form, FormItem, MessageBox } from 'element-ui'
import { contentOnMessage, setChromeStorage, getChromeStorage } from '../utils'
Vue.use(Button)
Vue.use(Input)
Vue.use(Dialog)
Vue.use(Card)
Vue.use(Checkbox)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Select)
Vue.use(Option)
Vue.use(DropdownItem)
Vue.use(Pagination)
Vue.use(Form)
Vue.use(FormItem)

Vue.prototype.$api = api
Vue.prototype.$message = Message
Vue.prototype.$messageBox = MessageBox
Vue.prototype.$get = get
Vue.prototype.$post = post
Vue.prototype.$setChromeStorage = setChromeStorage
Vue.prototype.$getChromeStorage = getChromeStorage
Vue.prototype.$origin= origin()

let VApp
window.addEventListener('DOMContentLoaded', async () => {
  const el = document.createElement('div')
  el.id = 'v-app'
  
  console.log(Vue.prototype.$origin)
  if(Vue.prototype.$origin === "https://mms.pinduoduo.com") {
    let appContainer = document.querySelector('.merchantApp')
    document.querySelector('.app-container').style = 'width: calc(100% - 420px);overflow-x: auto;'
    appContainer.style = 'display:flex;'
    appContainer.appendChild(el)
  }else if(Vue.prototype.$origin === "https://health.meituan.com") {
    let appContainer = document.querySelector('#app')
    document.querySelector('#app').firstChild.style = 'width: calc(100% - 420px);overflow-x: auto;display: flex;height: 100%;flex-direction: column;'
    appContainer.style = 'display:flex;'
    appContainer.appendChild(el)
  }
  try {
    VApp = new Vue({
      el: '#v-app',
      components: {
        Login,
        Monitor
      },
      template: '<div v-if="taoziState" style="border-left: 1px solid #ccc;"><login @loginSuccess="listenLoginSuccess" v-show="!showMonitor" :originStatus="originStatus"></login><monitor @loginOut="listenLoginOut" v-show="showMonitor" :showMonitor="showMonitor" :dataInfoDetail="dataInfoDetail" :searchInfo="searchInfo" :originStatus="originStatus" :leaveModel="leaveModel"></monitor></div>',
      data: {
        showMonitor: false,
        dosage: "",
        isCover: false,
        leaveModel: false,
        timer: "",
        timerTaozi: "",
        taoziState: false,
        timerTakeDirection: "",
        originStatus: 1, // 1是pdd,2是美团
        dataInfoDetail: { patientInfo: {}, medicines: [] },
        searchInfo: { takeDirection: "", specification: "", takeDose: "", formType: "", takeFrequence: "", medicineName: "", fullName: '', illDesc: "", sicknessDetail: "", allergyDetail: "", primaryDiagnosis: "", dosage: "", medicineAmount: "", medicineList: [] }
      },
      created() {
        if(this.$origin === "https://mms.pinduoduo.com") {
          this.originStatus = 1
        }else if(this.$origin === "https://health.meituan.com"){
          this.originStatus = 2
        }
      },
      mounted () {
        if(this.originStatus === 1) {
          this.getTaoziState()
          this.listenDOM()
        }else if(this.originStatus === 2){
          this.getTaoziStateMT()
          this.listenDOMMT()
        }
      },
      methods: {
        // 获取用户信息显示页面
        getChromeStorageUserInfo() {
          let _this = this
          getChromeStorage(['userInfo']).then(res => {
            if (JSON.stringify(res) !== '{}' && JSON.stringify(res.userInfo) != '{}' && res.userInfo.token) {
              _this.showMonitor = true
            }
          })
        },
        getTaoziState() {
          setTimeout(() => {
            let src = document.getElementsByClassName("header panel-tab-header")[0].firstChild.src
            if(src === "http://t16img.yangkeduo.com/pdd_ims/mainObject/v1/pub_202005286230b499acc0423c94f6370e6f19fab8.jpg") {
              this.taoziState = true
              this.getChromeStorageUserInfo()
            }else {
              document.querySelector('.app-container').style = 'width: 100%;overflow-x: auto;'
            }
          },500)
        },
        listenDOM () {
          document.addEventListener("DOMNodeInserted", this.handle, false);
          document.addEventListener("DOMNodeRemoved", (e) => {
            if (e.target.className === 'v-modal v-modal-leave' || e.target.className === "v-modal") {
              this.isCover = false
              this.leaveModel = false
            }
          }, false);
        },
        async handle (e) {
          const res = await getChromeStorage(['userInfo'])
          if (JSON.stringify(res) == '{}' || (JSON.stringify(res) !== '{}' && JSON.stringify(res.userInfo) === '{}')) {
            return false;
          }
          if (e.target.className === 'error-div' || e.target.className === 'el-message el-message--error plugin-error__message') {
            return false;
          }
          if (e.target.className === 'v-modal') {
            this.isCover = false
          }
          if (e.target.className === 'el-tag el-tag--info el-tag--mini' || e.target.className === 'el-tag el-tag--info el-tag--mini v-move' || e.target.className === 'v-modal') {
            let list = this.getDiagnosisList()
            clearTimeout(this.timer)
            if (list.length <= 0) {
              this.isCover = false
            }
            this.timer = setTimeout(()=> {
              this.getDosageSearch()
            },100) 
            this.getInputBlur()
          }
          this.getPatientInfo()
        },
        throttle (fn, wait) {
          var timer = null;
          return function () {
            var context = this;
            var args = arguments;
            if (!timer) {
              timer = setTimeout(function () {
                fn.apply(context, args);
                timer = null;
              }, wait)
            }
          }
        },
        // 药品名称
        getMedicineName () {
          let medicineName = ''
          let node = document.querySelector('[for="dosage1"]')
          if (node) {
            let parentNode = node.parentNode
            let childNodes = parentNode.childNodes || []
            for (let i = 0; i < childNodes.length; i++) {
              if (childNodes[i].nodeName === 'DIV') {
                medicineName = childNodes[i].innerText
              }
            }
          }
          return medicineName
        },
        // 获取诊断
        getDiagnosisList () {
          let diagnosisList = []
          let selTag = document.getElementsByClassName('el-select__tags-text')
          if (selTag.length > 0) {
            for (let i = 0; i < selTag.length; i++) {
              let text = selTag[i].innerText
              text = text.replace(/\s+/g, "")
              diagnosisList.push(text)
            }
          }
          return diagnosisList
        },
        // 获取用法用量
        async getDosageSearch () {
          let _this = this
          try {
            let medicineName = this.getMedicineName() || ''
            let diagnosisList = this.getDiagnosisList() || []
            if (!medicineName || diagnosisList.length <= 0) {
              this.removeErrorText()
              return false
            }
            let dosage = document.querySelector('[for="dosage"]')
            let dosageParent = dosage.parentNode
            let dosageChildNodes = dosageParent.childNodes || []
            let params = {
              goodsName: medicineName,
              diagnosis: diagnosisList.join(',')
            }
            _this.searchInfo = { takeDirection: "", specification: "", takeDose: "", formType: "", takeFrequence: "", medicineName: "", fullName: '', illDesc: "", sicknessDetail: "", allergyDetail: "", primaryDiagnosis: "", dosage: "", medicineAmount: "" ,medicineList: []}

            chrome.runtime.sendMessage({ dosageSearch: JSON.stringify(params) }, (response) => {
              const res = JSON.parse(response)
              if (res.code === 0) {
                this.leaveModel = true
                for (let i = 0; i < dosageChildNodes.length; i++) {
                  if (dosageChildNodes[i].nodeName === 'DIV') {
                    let dosageInput = dosageChildNodes[i].querySelector('input')
                    if (res.data) {
                      if (!this.isCover) {
                        this.removeErrorText()
                        dosageInput.value = res.data.dosage
                        this.isCover = true
                        var event = document.createEvent('HTMLEvents');
                        event.initEvent("input", true, true);
                        event.eventType = 'message';
                        dosageInput.dispatchEvent(event)
                      }
                    } else {
                      this.isCover = false
                      this.removeErrorText()
                      let div = document.createElement("div");
                      div.className = 'error-div';
                      div.innerHTML = `<p class="error-text__cus" style="color:red;">未查找到相应诊断的用法用量，请酌量开方!</p>`
                      dosageInput.parentNode.append(div)
                    }
                  }
                }
                this.getSearchInfo(res)
              } else if (res && res.code == 401) {
                this.$message({
                  type: "error",
                  message: '登录超时，重新登录',
                  customClass: "plugin-error__message"
                })
                this.listenLoginOut()
                this.$setChromeStorage({ userInfo: {} })
              }
            });
          } catch (error) {
            console.log(error)
          }
        },
        // 获取患者信息
        getPatientInfo () {
          let list = document.getElementsByClassName('notify-card')
          this.dataInfoDetail.patientInfo = {}
          for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].children[0].innerText == '复诊申请') {
              let sicknessDetail = list[i].children[1].children[4].children[1].innerText
              this.dataInfoDetail.patientInfo = {
                patientName: list[i].children[1].children[0].children[1].innerText,
                patientSex: list[i].children[1].children[1].children[1].innerText.split("，")[0],
                patientAge: list[i].children[1].children[1].children[1].innerText.split("，")[1],
                patientWeight: "",
                illDesc: list[i].children[1].children[3].children[1].innerText,
                allergyDetail: "",// 过敏史
                sicknessDetail: list[i].children[1].children[4].children[1].innerText,
                liver: sicknessDetail == "无" ? 0 : (sicknessDetail.includes("肝功能异常") ? 1 : 0),
                renal: sicknessDetail == "无" ? 0 : (sicknessDetail.includes("肾功能异常") ? 1 : 0),
                pregnancy: "",
                primaryDiagnosis: list[i].children[1].children[3].children[1].innerText,
              }
              break;
            }
          }
        },
        // 监听输入框失去焦点
        getInputBlur () {
          //监听开处方页面输入框变化
          let _this = this, appeal = {}, pastHistory = {}, allergyHistory = {}, diagnostic_info_list = {}, dosage = {}, num = {}, decrease = {}, increase = {};
          if (document.querySelector('[for="appeal"]')) {
            appeal = document.querySelector('[for="appeal"]').nextSibling.firstChild.children[0]
            pastHistory = document.querySelector('[for="pastHistory"]').nextSibling.firstChild.children[0]
            allergyHistory = document.querySelector('[for="allergyHistory"]').nextSibling.firstChild.children[0]
            diagnostic_info_list = document.querySelector('[for="diagnostic_info_list"]').nextSibling.firstChild
            dosage = document.querySelector('[for="dosage"]').nextSibling.firstChild.children[0]
            num = document.querySelector('[for="num"]').nextSibling.firstChild.children[2].firstElementChild
            decrease = document.querySelector('[for="num"]').nextSibling.firstChild.children[0]
            increase = document.querySelector('[for="num"]').nextSibling.firstChild.children[1]
            // 主诉 
            appeal.onblur = function (e) {
              _this.searchInfo.illDesc = e.target.value
            }
            // 既往史
            pastHistory.onblur = function (e) {
              _this.searchInfo.sicknessDetail = e.target.value
            }
            // 过敏史
            allergyHistory.onblur = function (e) {
              _this.searchInfo.allergyDetail = e.target.value
            }
            // 诊断
            diagnostic_info_list.onchange = function (e) {
              // _this.searchInfo.primaryDiagnosis = (_this.searchInfo.primaryDiagnosis ? (_this.searchInfo.primaryDiagnosis + ',') : '') + e.target.value
            }
            // 用法用量
            dosage.onblur = function (e) {
              _this.searchInfo.dosage = this.dosage ? this.dosage : e.target.value
            }
            // 开方数量
            num.onblur = function (e) {
              setTimeout(() => {
                var obj = document.querySelector('[for="num"]').nextSibling.innerText
                var index = obj.lastIndexOf("\=")
                obj = obj.substring(index + 1, obj.length)
                _this.searchInfo.medicineAmount = obj
              }, 200);
            }
            decrease.onclick = function(e) {
              setTimeout(() => {
                var obj = document.querySelector('[for="num"]').nextSibling.innerText
                var index = obj.lastIndexOf("\=")
                obj = obj.substring(index + 1, obj.length)
                _this.searchInfo.medicineAmount = obj
              }, 200);
            }
            increase.onclick = function(e) {
              setTimeout(() => {
                var obj = document.querySelector('[for="num"]').nextSibling.innerText
                var index = obj.lastIndexOf("\=")
                obj = obj.substring(index + 1, obj.length)
                _this.searchInfo.medicineAmount = obj
              }, 200);
            }
          }
        },
        // 获取用法用量等数据
        getSearchInfo (res) {
          // 获取主诉
          this.searchInfo.illDesc = document.querySelector('[for="appeal"]').nextSibling.firstChild.children[0].value
          // 获取既往史
          this.searchInfo.sicknessDetail = document.querySelector('[for="pastHistory"]').nextSibling.firstChild.children[0].value
          // 获取过敏史
          this.searchInfo.allergyDetail = document.querySelector('[for="allergyHistory"]').nextSibling.firstChild.children[0].value
          // 药名称规格
          this.searchInfo.fullName = this.getMedicineName() || ''
          // 获取诊断
          this.searchInfo.primaryDiagnosis = this.getDiagnosisList().join(",") || ""
          // 获取用法用量
          this.searchInfo.dosage = document.querySelector('[for="dosage"]').nextSibling.firstChild.children[0].value
          // 获取开方数量
          let text = document.querySelector('[for="num"]').nextSibling.innerText
          text = text.replace(/\s+/g, "")
          let index = text.lastIndexOf("\=")
          text = text.substring(index + 1, text.length)
          this.searchInfo.medicineAmount = text
          if (res.data) {
            this.searchInfo.formType = res.data.formType
            this.searchInfo.takeFrequence = res.data.takeFrequence
            this.searchInfo.specification = res.data.specification
            this.searchInfo.takeDirection = res.data.takeDirection
            this.searchInfo.primaryDiagnosis = res.data.primaryDiagnosis
            this.searchInfo.takeDose = res.data.takeDose
            this.searchInfo.dosage = document.querySelector('[for="dosage"]').nextSibling.firstChild.children[0].value
            this.dosage = res.data.dosage
            this.searchInfo.medicineName = res.data.medicineName
          }
        },
        // 登录成功
        listenLoginSuccess (data) {
          this.showMonitor = true
        },
        // 退出
        listenLoginOut () {
          this.showMonitor = false
          this.dosage = ""
          this.dataInfoDetail = { patientInfo: {}, medicines: [] }
          this.searchInfo = { takeDirection: "", specification: "", takeDose: "", formType: "", takeFrequence: "", medicineName: "", fullName: '', illDesc: "", sicknessDetail: "", allergyDetail: "", primaryDiagnosis: "", dosage: "", medicineAmount: "" ,medicineList: []}
        },
        // 移除错误提示
        removeErrorText () {
          if (document.querySelector('.error-text__cus')) {
            document.querySelector('.error-text__cus').remove()
          }
        },
        //美团
        getTaoziStateMT() {
          let innerText = document.getElementsByClassName("header-left").length > 0?document.getElementsByClassName("header-left")[0].children[1].innerText:''
          if(innerText === "成都双流华府医院桃子互联网医院") {
            document.querySelector('#app').firstChild.style = 'width: calc(100% - 420px);overflow-x: auto;display: flex;height: 100%;flex-direction: column;'
            document.querySelector('#app').style = "display: flex;"
            this.taoziState = true
            this.getChromeStorageUserInfo()
          }else {
            document.querySelector('#app').firstChild.style = 'width: 100%;overflow-x: auto;display: flex;height: 100%;flex-direction: column;'
            document.querySelector('#app').style = "display: block;"
          }
        },
        listenDOMMT () {
          document.addEventListener("DOMNodeInserted", this.handleMT, false);
          document.addEventListener("DOMNodeRemoved", (e) => {
            if (e.target.className === "boo-tag boo-tag-checked") {
              setTimeout(() => {
                this.searchInfo.primaryDiagnosis = this.getDiagnosisListMT().join(",") || ""
              },200)
            }
          }, false);
        },
        async handleMT (e) {
          if(e.target.nextSibling && e.target.nextSibling.baseURI === "https://health.meituan.com/doctor#/" && e.relatedNode.id === "app") {
            clearTimeout(this.timerTaozi)
            this.timerTaozi = setTimeout(()=> {
              this.getTaoziStateMT()
            },200)
          }
          const res = await getChromeStorage(['userInfo'])
          if (JSON.stringify(res) == '{}' || (JSON.stringify(res) !== '{}' && JSON.stringify(res.userInfo) === '{}')) {
            return false;
          }
          if (e.target.className === 'boo-tag boo-tag-checked') {
            clearTimeout(this.timer)
            this.timer = setTimeout(()=> {
              this.getMedicineInfoMT()
            },200)
            this.getInputBlurMT()
            this.getPatientInfoMT()
          }
        },
        // 获取诊断
        getDiagnosisListMT () {
          let diagnosisList = []
          let selTag = document.getElementsByClassName('boo-tag boo-tag-checked')
          if (selTag.length > 0) {
            for (let i = 0; i < selTag.length; i++) {
              let text = selTag[i].textContent
              text = text.replace(/\s+/g, "")
              diagnosisList.push(text)
            }
          }
          return diagnosisList
        },
        // 获取患者信息
        getPatientInfoMT () {
          this.dataInfoDetail.patientInfo = {}
          // 患者姓名
          let patientName = document.querySelector('.prescription .first-row').children[1].children[0].textContent
          let patientNameIndex = patientName.lastIndexOf("：")
          patientName = patientName.substring(patientNameIndex+1,patientName.length)
          // 患者性别
          let patientSex = document.querySelector('.prescription .first-row').children[1].children[1].textContent
          let patientSexIndex = patientSex.lastIndexOf("：")
          patientSex = patientSex.substring(patientSexIndex+1,patientSex.length)
          // 患者年龄
          let patientAge = document.querySelector('.prescription .first-row').children[1].children[2].textContent
          let patientAgeIndex = patientAge.lastIndexOf("：")
          patientAge = patientAge.substring(patientAgeIndex+1,patientAge.length)
          patientAge = patientAge?patientAge.replace("岁",""):""
          // 患者体重
          let patientWeight = document.querySelector('.prescription .first-row').children[4].children[1].children[1].textContent
          let patientWeightIndex = patientWeight.lastIndexOf("：")
          patientWeight = patientWeight.substring(patientWeightIndex+1,patientWeight.length)
          patientWeight = patientWeight.replace("kg","")
          // 患者肝
          let liver = document.querySelector('.prescription .first-row').children[4].children[0].children[0].textContent
          let liverIndex = liver.lastIndexOf("：")
          liver = liver.substring(liverIndex+1,liver.length)
          // 患者肾
          let renal = document.querySelector('.prescription .first-row').children[4].children[0].children[0].textContent
          let renalIndex = renal.lastIndexOf("：")
          renal = renal.substring(renalIndex+1,renal.length)
          // 患者妊娠哺乳
          let pregnancy = document.querySelector('.prescription .first-row').children[4].children[1].children[0].textContent
          let pregnancyIndex = pregnancy.lastIndexOf("：")
          pregnancy = pregnancy.substring(pregnancyIndex+1,pregnancy.length)
          // 获取既往史
          let sicknessDetail = document.querySelector('.prescription .first-row .first-other').children[1].textContent
          let sicknessIndex = sicknessDetail.lastIndexOf("：")
          sicknessDetail = sicknessDetail.substring(sicknessIndex+1,sicknessDetail.length)
          // 获取过敏史
          let allergyDetail = document.querySelector('.prescription .first-row .first-other').children[0].textContent
          let allergyIndex = allergyDetail.lastIndexOf("：")
          allergyDetail = allergyDetail.substring(allergyIndex+1,allergyDetail.length)

          this.dataInfoDetail.patientInfo = {
            patientName: patientName,
            patientSex: patientSex,
            patientAge: patientAge,
            patientWeight: patientWeight,
            liver: liver === "正常"? 0 : 1,
            renal: renal === "正常"? 0 : 1,
            pregnancy: pregnancy,
            sicknessDetail: sicknessDetail,
            allergyDetail: allergyDetail,
          }
        },
        // 监听输入框失去焦点
        getInputBlurMT () {
          //监听开处方页面输入框变化
          let _this = this, appeal = {}, medicineList = [], diagnostic_info_list = {}, dosage = {}, num = {};
          if (document.querySelector(".prescription-tab .top-content")) {
            appeal = document.querySelector('.prescription .boo-form-label-top .boo-input-wrapper textarea')
            medicineList = document.querySelector('.prescription .medicine-list').childNodes
            // 主诉 
            appeal.onblur = function (e) {
              _this.searchInfo.illDesc = e.target.value
            }
            // 药品列表
            medicineList.forEach(ele => {
              // 用法
              _this.watchSelectDom(ele)
              // 频次
              let takeFrequence = ele.children[0].children[0].children[1].children[1].children[1].children[1].children[1].children[0]
              takeFrequence.onblur = function(e) {
                _this.searchInfo.medicineList = _this.getMedicineList()
              }
              // 剂量
              let takeDose = ele.children[0].children[0].children[1].children[2].children[1].children[0].children[1].children[0]
              takeDose.onblur = function(e) {
                _this.searchInfo.medicineList = _this.getMedicineList()
              }
              // 用药天数
              let medicationDays = ele.children[0].children[0].children[1].children[3].children[1].children[0].children[1].children[0]
              medicationDays.onblur = function(e) {
                _this.searchInfo.medicineList = _this.getMedicineList()
              }
            });
          }
        },
        watchSelectDom (content) {
          let _this = this
          var targetNode = content; //content监听的元素id
          var options = {
              attributes: false, //受监视元素的属性值变更
              childList: true,
              subtree: true,
              characterDataOldValue: true,
              characterData: true, //监视指定目标节点或子节点树中节点所包含的字符数据的变化
          };
          function callback (mutationsList, observer) {
            clearTimeout(_this.timerTakeDirection)
            _this.timerTakeDirection = setTimeout(() => {
              _this.searchInfo.medicineList = _this.getMedicineList()
            },100)
          }
          var mutationObserver = new MutationObserver(callback);
          mutationObserver.observe(targetNode, options);
        },
        // 获取药品数据
        getMedicineInfoMT (res) {
          // 获取主诉
          this.searchInfo.illDesc = document.querySelector('.prescription .boo-form-label-top .boo-input-wrapper textarea').value
          // 获取诊断
          this.searchInfo.primaryDiagnosis = this.getDiagnosisListMT().join(",") || ""
          // 获取药品列表数据
          this.searchInfo.medicineList = this.getMedicineList()
        },
        // 获取药品列表数据
        getMedicineList() {
          // 患者凭证
          let isCertificate = document.querySelector('.prescription .first-row').children[6]
          let medicineList = []
          let list = document.querySelector('.prescription .medicine-list').childNodes || []
          list.forEach(ele => {
            let fullName = ele.children[0].children[0].children[0].children[1].children[0].textContent
            let specification = ele.children[0].children[0].children[0].children[1].children[1].textContent
            let takeDirection = ele.children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[0].value
            let takeFrequence1 = ele.children[0].children[0].children[1].children[1].children[1].children[0].children[0].children[0].value
            let takeFrequence2 = ele.children[0].children[0].children[1].children[1].children[1].children[1].children[1].children[0].value
            let takeDose = ele.children[0].children[0].children[1].children[2].children[1].children[0].children[1].children[0].value
            let formType = ele.children[0].children[0].children[1].children[2].children[1].children[1].children[0].children[0].value
            let medicationDays = ele.children[0].children[0].children[1].children[3].children[1].children[0].children[1].children[0].value
            let medicineAmount = ele.children[0].children[0].children[1].children[4].children[1].children[0].children[1].children[0].value
            let obj = {
              fullName: fullName,
              specification: specification,
              medicineAmount: medicineAmount,                 
              formType: formType,
              takeDose: takeDose,
              takeFrequence: takeFrequence1 + takeFrequence2 + "次",
              takeDirection: takeDirection,
              medicationDays: medicationDays,
              isCertificate: isCertificate ? 1 : 0
            }
            medicineList.push(obj)
          });
          return medicineList
        }
      }
    })
  } catch (err) { }
})

contentOnMessage((request, sender, sendResponse) => {
  const { cmd, data } = request

  if (cmd === 'isShowMenuChange') {
    return VApp.setIsShowMenu(data).then(() => {
      sendResponse()
    })
  }
})