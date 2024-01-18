const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

const tracer = () => (ctx, next) => {
    const id = new Date().getTime();

    const store = {
        id,
        url: ctx.url,
        method: ctx.method,
        headers: ctx.headers,
    };

    asyncLocalStorage.run(store, () => {
        next();
    });
};

module.exports = {
    transactionStorage: asyncLocalStorage,
    tracer,
};
