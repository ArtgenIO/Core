module.exports = () => {
  process.env.ARTGEN_NODE_ID = 'main';
  process.env.ARTGEN_HTTP_PORT = '7200';
  process.env.ARTGEN_DEMO = '0';
  process.env.NODE_ENV = 'test';
};
