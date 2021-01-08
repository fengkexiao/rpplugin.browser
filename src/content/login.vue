<template>
  <div class="tlogin">
    <img class="tlogin-logo">
    <div class="tlogin-title">
      <p class="tlogin-maintitle">桃子远程医疗助手</p>
      <p class="tlogin-subtitle">Peach Telemedicine Assistant</p>
    </div>
    <div class="tlogin-form">
      <template>
        <el-form :model="form" :rules="rules" ref="ruleForm">
          <el-form-item prop="phone">
            <el-input placeholder="请输入账号" class="tlogin-input" v-model="form.phone" clearable maxlength="11">
              <template slot="prepend">
                <div class="form-prepend">
                  <img class="input-icon tlogin-account">
                  <span>账号</span>
                </div>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="pass">
            <el-input placeholder="请输入密码" class="tlogin-input pwd-input mt24" maxlength="20" v-model="form.pass" show-password>
              <template slot="prepend">
                <div class="form-prepend">
                  <img class="input-icon tlogin-pwd">
                  <span>密码</span>
                </div>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
    </div>
    <div class="tlogin-button__container">
      <button class="tlogin-form__button" @click="handleLogin">
        登录
      </button>
    </div>
    <div class="tlogin-footer">
      <div>copyright©2020桃子健康互联网医院管理有限公司</div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        phone: '',
        pass: ''
      },
      rules: {
        phone: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        pass: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
      }
    }
  },
  props:{
    originStatus: Number
  },
  mounted () {
    this.insertImg()
  },
  methods: {
    handleLogin () {
      try {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            this.form.originStatus = this.originStatus
            chrome.runtime.sendMessage({ login: JSON.stringify(this.form) }, (response) => {
              const res = JSON.parse(response)
              if (res.code === 0) {
                this.$emit('loginSuccess', res.data)
                this.$setChromeStorage({ userInfo: res.data })
              } else {
                this.$message({
                  message: res.message,
                  type: 'error',
                  customClass: "plugin-error__message",
                });
              }
            });
          }
        })
      } catch (error) {
        console.log(error)
      }
    },
    insertImg () {
      var loginLogo = chrome.extension.getURL("assets/login-logo.png");
      document.querySelector(".tlogin-logo").src = loginLogo;
      var loginAccount = chrome.extension.getURL("assets/login-account.png");
      document.querySelector(".tlogin-account").src = loginAccount;
      var loginPwd = chrome.extension.getURL("assets/login-pwd.png");
      document.querySelector(".tlogin-pwd").src = loginPwd;
    }
  }
}
</script>

<style >
.tlogin-logo {
  width: 233px;
  height: 88px;
}
.tlogin-maintitle {
  font-size: 30px;
  font-weight: 800;
  color: #262626;
}

.type-text {
  font-size: 18px;
  cursor: pointer;
  color: #262626;
}
.type-line {
  width: 60px;
  height: 4px;
  background: #438bef;
  border-radius: 2px;
  margin-top: 6px;
}
.type-check {
  color: #438bef !important;
}
.tlogin-type__container {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tlogin-title {
  margin-top: 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tlogin-title p {
  margin: 0;
  padding: 0;
}

.tlogin-subtitle {
  font-size: 17px;
  font-weight: Normal;
  color: #262626;
  margin-top: 7px !important;
}

.tlogin-type {
  display: flex;
  margin-top: 63px;
}

.tlogin-form {
  margin-top: 24px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  display: flex;
}

.tlogin-input {
  width: 372px !important;
}

.tlogin-input input {
  border: 1px solid #dcdfe6 !important;
  border-left: 0 !important;
  height: 49px;
  line-height: 49px;
}

.tlogin-input :focus {
  border: 1px solid #438bef !important;
}
/* .tlogin-input :last-child {
  margin-top: 24px;
} */

.mt24 {
  margin-top: 24px;
}

.tlogin {
  width: 420px;
  background: #ffffff;
  height: 100vh;
  position: relative;
}
/* .pwd-input input {
  border-right: 0 !important;
} */
.pwd-input .el-input-group__prepend {
  background: #eeeeee !important;
}

.pwd-input .el-input__inner {
  background: #eeeeee !important;
}
.pwd-input .el-input-group__append {
  background: #eeeeee !important;
}

.tlogin-input .el-input-group__prepend {
  background-color: #fff;
  padding: 0 12px;
  color: #595959;
}
.tlogin-input .el-input-group__prepend .input-icon {
  width: 24px;
  height: 24px;
}
.tlogin-input .el-input-group__prepend .form-prepend {
  display: flex;
  align-items: center;
}
.tlogin-input .el-input-group__prepend .form-prepend span {
  margin-left: 6px;
}

.tlogin-input .el-input-group__append {
  background-color: #eeeeee;
}

.form-append {
  display: flex;
  align-items: center;
}
.form-append div {
  width: 1px;
  height: 40px;
  background: #bfbfbf;
}
.form-append span {
  color: #595959;
  cursor: pointer;
  margin-left: 16px;
}

.tlogin-checkbox {
  padding-left: 24px;
  padding-top: 24px;
}
.tlogin-button__container {
  display: flex;
  justify-content: center;
}
.tlogin-form__button {
  cursor: pointer;
  margin-top: 66px;
  width: 372px;
  height: 49px;
  background: #438bef;
  border-radius: 5px;
  font-size: 18px;
  font-family: PingFang SC, PingFang SC-Medium;
  font-weight: 500;
  color: #ffffff;
  border: 0;
  outline: none;
}

.tlogin-form__button:hover {
  background: #66b1ff;
}

.tlogin-footer {
  font-size: 14px;
  position: absolute;
  bottom: 32px;
  margin-left: -157.5px;
  left: 50%;
  font-family: PingFang SC, PingFang SC-Regular;
  font-weight: 400;
  color: #8c8c8c;
  line-height: 14px;
}
</style>