<template>
  <div class="riskMain">
    <div class="riskItem">
      <p class="riskItemName">风险监测</p>
      <div class="riskItamMain">
        <span class="toMonitor"  @click="toMonitorClick"><i class="el-icon-refresh"></i>重新检测</span>
        <div class="reminder" v-show="riskStatiscal.maxRisk != 0">
          <img class="topImage forbiddenImg" v-show="(riskStatiscal.maxRisk == 1 || riskStatiscal.maxRisk == 2)">
          <img class="topImage dequeImg" v-show="riskStatiscal.maxRisk != 1 && riskStatiscal.maxRisk != 2">
          <p class="reminder_title">{{(riskStatiscal.maxRisk == 1 || riskStatiscal.maxRisk == 2)?'禁止开方':'谨慎开方'}}</p>
          <p class="reminder_content">共审查{{riskStatiscal.total}}项内容，{{riskStatiscal.forbidden}}项禁止，{{riskStatiscal.caution}}项谨慎，{{riskStatiscal.safe}}项安全</p>
          <ul class="reminder_ul">
            <template v-for="(item,index) in validateResults"> 
              <li :key="index">
                <span :class="(item.risk == 1 || item.risk == 2)?'forbiddenFill':'dequeFill'">{{(item.risk == 1 || item.risk == 2)?'禁用':'慎用'}}</span><p><span v-if="item.medicineName" class="medicineName">{{item.medicineName}} </span>{{item.tip}}</p>
                <p class="suggest" v-if="item.advise">用药建议：{{item.advise}}</p>
              </li>
            </template>
          </ul>
        </div>
        <div class="reminder" v-show="riskStatiscal.maxRisk == 0">
          <img class="topImage safetyTop">
          <p class="reminder_title safetyReminder_title">未检测到问题，可放心开方</p>
          <p class="reminder_content" style="padding-bottom:91px;">共审查{{riskStatiscal.total}}项内容，{{riskStatiscal.forbidden}}项禁止，{{riskStatiscal.caution}}项谨慎，{{riskStatiscal.safe}}项安全</p>
        </div>
      </div>
    </div>
    <div class="riskItem">
      <p class="riskItemName">用药助手</p>
      <div class="riskItamMain">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane :label="item.medicineName" :name="item.medicineName" v-for="(item,index) in medicineResult" :key="index">
            <template v-if="item.result">
              <el-select class="specification" popper-class="TZselectDropdown" v-model="specificationName" @change="specificationChange">
                <el-option :label="items.specificationName" :value="items.specificationName" v-for="(items,indexs) in specificationList" :key="indexs"></el-option>
              </el-select>
              <ul class="assistant">
                <li>
                  <span class="assistantName">药品风险</span>
                  <span class="assistantMain">{{item.result.reInquiry == 1 ? '强制要求复诊凭证': '非强制要求复诊凭证'}}</span>
                </li>
                <li class="border_right">
                  <span class="assistantName border_right">6岁以下儿童开方标准</span>
                  <span class="assistantMain border_left">{{specificationInfo.takeDirection == "口服" ? '不可开': '可开'}}</span>
                </li>
                <li>
                  <span class="assistantName">给药途径</span>
                  <span class="assistantMain">{{specificationInfo.takeDirection}}</span>
                </li>
                <li>
                  <span class="assistantName">频次上限</span>
                  <span class="assistantMain">{{specificationInfo.takeFrequence}}</span>
                </li>
                <li>
                  <span class="assistantName">单次剂量上限</span>
                  <span class="assistantMain">
                    <p>{{specificationInfo.takeDose1}}</p>
                    <p>{{specificationInfo.internationalUnit}}</p>
                    <p>{{specificationInfo.takeDose2}}</p>
                    <p>{{specificationInfo.meterageUnit}}</p>
                  </span>
                </li>
                <li>
                  <span class="assistantName">每日剂量上限</span>
                  <span class="assistantMain">
                    <p>{{specificationInfo.maxDose1}}</p>
                    <p>{{specificationInfo.internationalUnit}}</p>
                    <p>{{specificationInfo.maxDose2}}</p>
                    <p>{{specificationInfo.meterageUnit}}</p>
                  </span>
                </li>
                <li>
                  <span class="assistantName">服用天数上限</span>
                  <span class="assistantMain">{{specificationInfo.maxDays?specificationInfo.maxDays+"天":""}}</span>
                </li>
                <li>
                  <span class="assistantName">适用症</span>
                  <span class="assistantMain noFlex">
                    <ul class="indication">
                      <li v-for="(items,indexs) in item.result.indications" :key="indexs">{{items}}</li>
                    </ul>
                    <!-- <span class="more" @click="moreIndications" v-if="item.result.indications && item.result.indications.length > 0">{{isMoreIndications?'更多':'收起'}}</span> -->
                  </span>
                </li>
                <li>
                  <span class="assistantName">禁忌症</span>
                  <span class="assistantMain noFlex">
                    <div class="item" v-for="(items,indexs) in item.result.contras" :key="indexs">
                      <p>{{items.value}}<span :class="(items.risk == 1 || items.risk == 2)?'forbiddenFill':((items.risk == 3 || items.risk == 4)?'dequeFill':'')">{{(items.risk == 1 || items.risk == 2)?'禁用':((items.risk == 3 || items.risk == 4)?'慎用':'')}}</span></p>
                      <p v-if="items.tip">风险提示：{{items.tip}}</p>
                      <p v-if="items.advise">用药建议：{{items.advise}}</p>
                    </div>
                    <!-- <div class="item">
                      <p>冠心病、心绞痛 <span class="deque">慎用</span></p>
                      <p>风险提示：冠心病、心绞痛患者禁用。</p>
                      <p>用药建议：哺乳期妇女用量减半，连续服用不超过7天。</p>
                    </div> -->
                  </span>
                </li>
                <li>
                  <span class="assistantName">过敏源</span>
                  <span class="assistantMain noFlex">
                    <ul class="indication">
                      <li v-for="(items,indexs) in item.result.allergyIngredient" :key="indexs">{{items}}</li>
                    </ul>
                    <!-- <span class="more" @click="moreAllergen" v-if="item.result.allergyIngredient && item.result.allergyIngredient.length > 0">{{isMoreAllergen?'更多':'收起'}}</span> -->
                    <!-- {{item.result.allergyIngredient?item.result.allergyIngredient.join(","):''}} -->
                  </span>
                </li>
                <li>
                  <span class="assistantName">特殊人群禁用</span>
                  <span class="assistantMain noFlex">
                    <div class="item1"> 
                      <p>肝功能异常</p>
                      <p>肾功能异常</p>
                      <p>备孕期</p>
                      <p>妊娠期</p>
                      <p>哺乳期</p>
                    </div>
                    <div class="item1">
                      <p :class="liverRenalItem1== '禁用'?'color_p':''">{{liverRenalItem1}}</p>
                      <p :class="liverRenalItem2== '禁用'?'color_p':''">{{liverRenalItem2}}</p>
                      <p :class="pregnancyItem1== '禁用'?'color_p':''">{{pregnancyItem1}}</p>
                      <p :class="pregnancyItem2== '禁用'?'color_p':''">{{pregnancyItem2}}</p>
                      <p :class="pregnancyItem3== '禁用'?'color_p':''">{{pregnancyItem3}}</p>
                    </div>
                  </span>
                </li>
                <li>
                  <span class="assistantName">特殊人群</span>
                  <span class="assistantMain noFlex">
                    <div class="item" v-for="(items,indexs) in item.result.patientSex" :key="'sex'+indexs">
                      <p>{{items.value == 1 ?'男':'女'}}<span :class="(items.risk == 1 || items.risk == 2)?'forbiddenFill':((items.risk == 3 || items.risk == 4)?'dequeFill':'')">{{(items.risk == 1 || items.risk == 2)?'禁用':((items.risk == 3 || items.risk == 4)?'慎用':'')}}</span></p>
                      <p v-if="items.tip">风险提示：{{items.tip}}</p>
                      <p v-if="items.advise">用药建议：{{items.advise}}</p>
                    </div>
                    <div class="item" v-for="(items,indexs) in item.result.patientAge" :key="'age'+indexs">
                      <p>{{items.value == 1 ?'儿童':(items.value == 2 ?'老年人': JSON.parse(items.value).join("~") + '岁')}}<span :class="(items.risk == 1 || items.risk == 2)?'forbiddenFill':((items.risk == 3 || items.risk == 4)?'dequeFill':'')">{{(items.risk == 1 || items.risk == 2)?'禁用':((items.risk == 3 || items.risk == 4)?'慎用':'')}}</span></p>
                      <p v-if="items.tip">风险提示：{{items.tip}}</p>
                      <p v-if="items.advise">用药建议：{{items.advise}}</p>
                    </div>
                  </span>
                </li>
              </ul>
            </template>
            <template v-else>
              <div class="notInfo">
                暂无药品信息，请谨慎开方！
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="riskItem" v-if="JSON.stringify(medicineRuleResult) !== '{}'">
      <p class="riskItemName">重点关注</p>
      <div class="riskItamMain">
        <ul class="assistant">
          <li>
            <span class="assistantName">药物相互作用</span>
            <span class="assistantMain content_left noFlex">{{medicineRuleResult.medicineInteraction}}</span>
          </li>
          <li>
            <span class="assistantName">用法用量</span>
            <span class="assistantMain content_left noFlex">{{specification.userDoseTip}}</span>
          </li>
          <li>
            <span class="assistantName">用药范围</span>
            <span class="assistantMain content_left noFlex">{{medicineRuleResult.medicineRange}}</span>
          </li>
          <li>
            <span class="assistantName">用药禁忌</span>
            <span class="assistantMain content_left noFlex">{{medicineRuleResult.medicineContras}}</span>
          </li>
          <li>
            <span class="assistantName">注意事项</span>
            <span class="assistantMain content_left noFlex">{{medicineRuleResult.tipThings}}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
</template>
<script>
export default {
  name: 'riskMonitoring',
  data() {
    return {
      activeName: '',
      isMoreIndications: true,
      isMoreAllergen: true,
      specification: {},
      specificationName: '',
      specificationList: [],
      specificationInfo: {},
      medicineRuleResult:[],
      liverRenal: [],
      liverRenalItem1: '不禁用',
      liverRenalItem2: '不禁用',
      pregnancy: [],
      pregnancyItem1: '不禁用',
      pregnancyItem2: '不禁用',
      pregnancyItem3: '不禁用'
    }
  },
  props: {
    medicineResult:{
      type: Array,
      default: []
    },
    validateResults: {
      type: Array,
      default: []
    },
    riskStatiscal: {
      type: Object,
      default: {}
    },
    dataInfoDetail: {
      type: Object,
      default: {}
    }
  },
  watch:{
    medicineResult(val) {
      let that = this
      this.medicineResult = val
      if(this.medicineResult.length > 0) {
        this.activeName = this.medicineResult[0].medicineName;
        this.getMedicineRuleResult(this.activeName);
      }else {
        this.medicineRuleResult = {}
        this.activeName = ""
        this.specificationList = []
        this.specification = {}
        this.specificationName = ""
        this.specificationInfo = {}
        this.liverRenalItem1 = "不禁用"
        this.liverRenalItem2 = "不禁用"
        this.pregnancyItem1 = "不禁用"
        this.pregnancyItem2 = "不禁用"
        this.pregnancyItem3 = "不禁用"
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.insertImg()
    })
  },
  methods:{
    insertImg () {
      var forbidden = chrome.extension.getURL("assets/forbidden.png");
      document.querySelector(".forbiddenImg").src = forbidden;
      var dequeImg = chrome.extension.getURL("assets/deque.png");
      document.querySelector(".dequeImg").src = dequeImg;
      var safety = chrome.extension.getURL("assets/safety.png");
      document.querySelector(".safetyTop").src = safety;
    },
    handleClick(val) {
      this.getMedicineRuleResult(val.name)
    },
    // 切换规格
    specificationChange(item) {
      this.specificationInfo = {}
      this.medicineResult.forEach((ele,num) => {
        if(this.activeName == ele.medicineName) {
          this.specificationList.forEach((eles,index) => {
            if(eles.specificationName == item) {
              this.specification = eles
              let state = true
              if(eles.specificationName == this.replaceItem(ele.specification)) {
                state = false
                eles.useWayAndDoseList.forEach(itemU => {
                  let takeDirectionList = itemU.takeDirection.split(',')
                  takeDirectionList.forEach(itemUs => {
                    if(itemUs === ele.takeDirection) {
                      this.decimalsTransition(itemU)
                    }
                  })
                })
              }else {
                eles.otherNames.forEach(items => {
                  if(items == this.replaceItem(ele.specification)) {
                    state = false
                    eles.useWayAndDoseList.forEach(itemU => {
                      let takeDirectionList = itemU.takeDirection.split(',')
                      takeDirectionList.forEach(itemUs => {
                        if(itemUs === ele.takeDirection) {
                          this.decimalsTransition(itemU)
                        }
                      })
                    })
                  }
                })
              }
              if(state) {
                this.decimalsTransition(eles.useWayAndDoseList[0])
              }
            }
          })
        }
      })
    },
    // 特殊字符转换
    replaceItem(item) {
      item = item.replace(/III/g, "Ⅲ")
      .replace(/II/g, "Ⅱ")
      .replace(/I/g, "Ⅰ")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/毫克/g, "mg")
      .replace(/毫升/g, "ml")
      .replace(/克/g, "g")
      .replace(/升/g, "L")
      .replace(/x/g, "*")
      .replace(/μg/g, "ug")
      return item
    },
    getMedicineRuleResult(name) {
      this.specificationName = ""
      this.specificationInfo = {}
      this.medicineRuleResult = {}
      this.specificationList = []
      this.specification = {}
      this.liverRenalItem1 = "不禁用"
      this.liverRenalItem2 = "不禁用"
      this.pregnancyItem1 = "不禁用"
      this.pregnancyItem2 = "不禁用"
      this.pregnancyItem3 = "不禁用"
      this.medicineResult.forEach((ele,num) => {
        if(ele.result) {
          ele.result.patientAge.forEach(eles => {
            if(eles.value != 1 && eles.value != 2) {
              eles.value = eles.value.replace(")","]")
            }
          })
          if(ele.medicineName == name) {
            this.medicineRuleResult = ele.result
            this.specificationList = ele.result.specificationList;
            this.specificationList.forEach((item,index)=> {
              if(item.specificationName == this.replaceItem(ele.specification)) {
                this.specification = JSON.parse(JSON.stringify(item))
                this.specificationName = JSON.parse(JSON.stringify(item.specificationName))
                item.useWayAndDoseList.forEach(itemU => {
                  let takeDirectionList = itemU.takeDirection.split(',')
                  takeDirectionList.forEach(itemUs => {
                    if(itemUs === ele.takeDirection) {
                      this.decimalsTransition(itemU)
                    }
                  })
                })
              }else {
                item.otherNames.forEach(items => {
                  if(items == this.replaceItem(ele.specification)) {
                    this.specification = JSON.parse(JSON.stringify(item))
                    this.specificationName = JSON.parse(JSON.stringify(item.specificationName))
                    item.useWayAndDoseList.forEach(itemU => {
                      let takeDirectionList = itemU.takeDirection.split(',')
                      takeDirectionList.forEach(itemUs => {
                        if(itemUs === ele.takeDirection) {
                          this.decimalsTransition(itemU)
                        }
                      })
                    })
                  }
                })
              }
            })
            this.liverRenal = ele.result.liverRenal;
            this.pregnancy = ele.result.pregnancy;
            this.liverRenalState(this.liverRenal);
            this.pregnancyState(this.pregnancy);
          }
        }
      })
    },
    // 小数转换
    decimalsTransition(arr) {
      arr.maxDose1 = arr.maxDose1?this.transition(arr.maxDose1):''
      arr.maxDose2 = arr.maxDose2?this.transition(arr.maxDose2):''
      arr.takeDose1 = arr.takeDose1?this.transition(arr.takeDose1):''
      arr.takeDose2 = arr.takeDose2?this.transition(arr.takeDose2):''
      arr.maxDays = arr.maxDays?this.transition(arr.maxDays):''
      this.specificationInfo = arr
    },
    // 修改小数后面是0的数据
    transition(num) {
      var str = parseFloat(num).toString().split('.');
      if(str.length == 1) {
        return str[0]
      }else {
        return num
      }
    },
    // 更多适用症
    moreIndications() {
      if(this.isMoreIndications) {
        document.getElementsByClassName('indication')[0].style.maxHeight="none";
        this.isMoreIndications = false;
      }else {
        document.getElementsByClassName('indication')[0].style.maxHeight="83px";
        this.isMoreIndications = true;
      }
    },
    // 更多过敏源
    moreAllergen() {
      if(this.isMoreAllergen) {
        document.getElementsByClassName('indication')[1].style.maxHeight="none";
        this.isMoreAllergen = false;
      }else {
        document.getElementsByClassName('indication')[1].style.maxHeight="83px";
        this.isMoreAllergen = true;
      }
    },
    toMonitorClick() {
      this.$emit("toMonitor")
    },
    // 肝肾功能禁用状态
    liverRenalState(arr) {
      arr.forEach(ele => {
        if(ele.value == 1) {
          this.liverRenalItem1 = (ele.risk == 1 || ele.risk == 2)?'禁用':'不禁用'
        } else {
          this.liverRenalItem2 = (ele.risk == 1 || ele.risk == 2)?'禁用':'不禁用'
        }
      })
    },
    pregnancyState(arr) {
      // 哺乳等禁用状态
      arr.forEach(ele => {
        if(ele.value == 1) {
          this.pregnancyItem1 = (ele.risk == 1 || ele.risk == 2)?'禁用':'不禁用'
        } else if(ele.value == 2){
          this.pregnancyItem2 = (ele.risk == 1 || ele.risk == 2)?'禁用':'不禁用'
        } else if(ele.value == 3){
          this.pregnancyItem3 = (ele.risk == 1 || ele.risk == 2)?'禁用':'不禁用'
        }
      })
    }
  }
}
</script>
<style>
  .riskMain {
    height: calc(100% - 42px);
    overflow: auto;
  }
  .riskMain .forbiddenFill {
    color: #fff;
    background: #fe5853;
  }
  .riskMain .dequeFill {
    color: #fff;
    background: #fa9414;
  }
  .riskMain .riskItem {
    padding:  0px 8px;
  }
  .riskMain .riskItemName {
    font-size: 14px;
    line-height: 22px;
    color: #000;
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 700;
  }
  .riskMain .riskItamMain {
    border-radius: 2px;
    box-shadow: 0px -1px 10px 0px #d9d9d9;
    position: relative;
    padding-bottom: 8px;
  }
  .riskMain .toMonitor {
    position: absolute;
    top: 22px;
    right: 10px;
    color: #438bef;
    line-height: 14px;
    font-size: 14px;
    cursor: pointer;
  }
          
  .riskMain .toMonitor .el-icon-refresh {
    margin-right: 6px;
  }
  .riskMain .reminder {
    padding-top: 16px;
    text-align: center;
  }
  .reminder .el-icon {
    font-size: 47px;
  }
  .reminder .topImage {
    height: 83px;
    width: 83px;
    position: relative;
    top: -16px;
  }
  .reminder .safetyTop {
    position: initial;
    margin-top: 61px;
  }
  .reminder .el-forbidden {
    color: #f5222d;
  }
  .reminder .el-deque {
    color: #fa9414;
  }
  .reminder .el-safety {
    color: #29c41a;
    padding-top: 92px;
  }
  .reminder .reminder_title {
    margin-top: -30px;
    font-size: 16px;
    line-height: 24px;
  }
  .reminder .safetyReminder_title {
    margin-top: -10px;
  }
  .reminder .reminder_content {
    margin-top: 6px;
    font-size: 14px;
    line-height: 24px;
    color: #595959;
  }
  .reminder .reminder_ul {
    padding: 12px;
    margin: 12px 8px 0px;
    background: rgba(67,139,239,0.05);
    border-radius: 4px;
    padding-bottom: 1px;
  }
  .reminder .reminder_ul li {
      list-style: none;
      overflow: hidden;
      margin-bottom: 11px;
      position: relative;
  }
  .reminder .reminder_ul li >span {
    float: left;
    width: 40px;
    height: 21px;
    line-height: 21px;
    border-radius: 2px;
    text-align: center;
    margin-right: 12px;
    font-size: 12px;
  }
  .reminder .reminder_ul li p {
    float: left;
    font-size: 14px;
    color: #000;
    line-height: 22px;
    max-width: 307px;
    text-align: left;
  }
  .reminder .reminder_ul li p span {
    padding-left: 10px;
  }
  .reminder .reminder_ul li .medicineName {
    color: #000;
    font-weight: 700;
    padding: 0px;
  }    
  .reminder .reminder_ul li .suggest {
    padding-left: 52px;
    text-align: left;
    font-size: 12px;
    color: #262626;
    line-height: 22px;
    min-width: 300px;
    max-width: 364px;
  }
  .riskMain .riskItamMain /deep/.el-tabs--card>.el-tabs__header .el-tabs__nav {
    border-top: none;
    border-left: none;
  }
  .riskMain .riskItamMain /deep/.el-tabs__item {
    font-size: 13px !important;
    line-height: 38px !important;
    height: 38px !important;
  }
  .riskMain .riskItamMain /deep/.el-tabs__item.is-active ,.riskMain .riskItamMain /deep/.el-tabs__item:hover{
    color: #387ef5 !important;
  }
  .riskMain .riskItamMain .specification {
    width: 231px;
    margin: auto;
    display: block;
  }
  .riskMain .riskItamMain /deep/.el-input {
    max-width: 231px !important;
  }
  .riskMain .riskItamMain /deep/.el-input input {
    max-width: 231px !important;
  }
  .riskMain .riskItamMain /deep/.el-tabs__content {
    margin-top: 1px;
  }
  .riskMain .riskItamMain .assistant {
    margin: 0px;
    margin-top: 16px;
    border: 1px solid #bfbfbf;
    border-top: none;
    padding: 0px;
  }
  .riskMain .riskItamMain .assistant >li {
    list-style: none;
    border-top: 1px solid #bfbfbf;
    color: #262626;
    display: flex;
  }
  .riskMain .riskItamMain .assistant .assistantName {
    width: 98px;
    display: inline-block;
    line-height: 20px;
    font-size: 12px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
  }
  .riskMain .riskItamMain .assistant .assistantMain {
    width: 299px;
    display: inline-block;
    border-left: 1px solid #bfbfbf;
    line-height: 20px;
    font-size: 12px;
    text-align: center;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    display: flex;
  }
  .riskMain .riskItamMain .assistant .assistantMain >p {
    width: 25%;
    border-right: 1px solid #bfbfbf;
    height: 100%;
    align-items: center;
    justify-content: center;
    display: flex;
    float: left;
  }
  .riskMain .riskItamMain .assistant .assistantMain >P:last-child {
    border-right: none;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item {
    flex-shrink: 0;
    width: 299px;
    text-align: left;
    padding-bottom: 8px;
    border-bottom: 1px solid #bfbfbf;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item p {
    width: 100%;
    padding: 6px 8px 0;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item p span {
    width: 40px;
    line-height: 40px;
    display: inline-block;
    height: 21px;
    line-height: 21px;
    text-align: center;
    border-radius: 2px;
    margin-left: 10px;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item:last-child {
    border-bottom: none;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item1 {
      overflow: hidden;
      border-bottom: 1px solid #bfbfbf;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item1 p {
    width: 20%;
    float: left;
    border-right: 1px solid #bfbfbf;
    height: 36px;
    line-height: 17px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item1 .color_p {
    color: #fe5853;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item1 p:last-child {
    border-right: none;
  }
  .riskMain .riskItamMain .assistant .assistantMain .item1:last-child {
    border-bottom: none;
  }
  .riskMain .riskItamMain .assistant .content_left {
    text-align: left;
    padding: 8px;
  }
  .riskMain .riskItamMain .assistant .noFlex {
    display: block !important;
  }
  .riskMain .riskItamMain .assistant .assistantMain .indication {
    overflow: hidden;
    padding: 8px;
    padding-bottom: 0;
    width: 100%;
    float: left;
    height: auto;
  }
  .riskMain .riskItamMain .assistant .assistantMain .indication li {
    float: left;
    padding: 5px 8px;
    margin-right: 8px;
    list-style: none;
    border-radius: 4px;
    background: #eee;
    margin-bottom: 8px;
  }
  .riskMain .riskItamMain .assistant .assistantMain .more {
    color: #438bef;
    font-size: 11px;
    float: right;
    margin-right: 5px;
    cursor: pointer;
    position: relative;
    top: 15px;
  }
  .riskMain .riskItamMain .assistant .border_right .assistantName{   
    border-right: 1px solid #bfbfbf;
    width: 99px;
  }
  .riskMain .riskItamMain .assistant .border_right .assistantMain {
    border-left: none;
    width: 298px;
  }
  .riskMain .riskItamMain .assistant .border_left .assistantName{
    border-left: 1px solid #bfbfbf;
  }
  .riskMain .riskItamMain .assistant .border_left {
    border-right: none;
  }
  .riskMain .riskItamMain .notInfo {
    font-size: 16px;
    text-align: center;
    line-height: 25px;
    padding: 10px;
    color: #ffa216;
  }
  .riskMain::-webkit-scrollbar {
    width: 2px;
    height: 10px;
  }
  .riskMain::-webkit-scrollbar-track {
    background: rgb(239, 239, 239);
    border-radius: 2px;
  } 
  .riskMain::-webkit-scrollbar-thumb {
    background: #bfbfbf;
    border-radius: 10px;
  }
  .riskMain::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
  .riskMain::-webkit-scrollbar-corner {
    background: #179a16;
  }
  .el-select-dropdown {
    z-index: 10000 !important;
  }
</style>