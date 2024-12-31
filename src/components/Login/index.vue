<template>
  <div class="login w-80">
    <div class="login__container">
      <div class="login__right">
        <div class="login__form">
          <div class="login__form__item m-10">
            <a-input placeholder="请输入用户名" />
          </div>
          <div class="login__form__item m-10">
            <!-- <a-input placeholder="" v-model="password" type="password" /> -->
            <a-input-password
              placeholder="请输入密码"
              :defaultVisibility="false"
              allow-clear
            />
          </div>
          <div class="login__form__item m-10 flex justify-around">
            <a-button type="primary">登录</a-button>
            <a-button type="primary" status="warning">token登录</a-button>
            <a-button type="primary" status="danger">退出</a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
