export default [
  {
    path: '/push-request-body',
    name: 'pushRequestBody',
    component: () => import('@/views/push-request-body/index.vue'),
    meta: {
      title: '推送请求体生成器',
    },
  },
];
