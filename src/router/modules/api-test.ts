export default [
  {
    path: '/api-test',
    name: 'api-test',
    component: () => import('@/views/api-test/index.vue'),
    meta: {
      title: 'WebSDK 4.x API 测试',
    },
  },
];
