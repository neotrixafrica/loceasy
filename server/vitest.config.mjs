export default {
  resolve: {
    alias: [{ find: /^@\//, replacement: `${process.cwd()}/src/` }],
  },
  test: {
    environment: 'node',
  },
};
