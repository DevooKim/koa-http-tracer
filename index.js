const Koa = require("koa");
const Router = require("@koa/router");
const { tracer, transactionStorage } = require("./httpTracer");

const app = new Koa();
const router = new Router();

app.use(tracer());

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        const transaction = transactionStorage.getStore();
        console.log("catch error", error.message, transaction);
    }
});

router.get("/1", async (ctx, next) => {
    const transaction = transactionStorage.getStore();
    console.log("router-start1", transaction);

    ctx.body = "Hello World";
});

const middleware = (ctx, next) => {
    const origin = transactionStorage.getStore();

    const additional = {
        ...origin,
        hello: "world",
    };

    transactionStorage.run(additional, () => {
        next();
    });
};

router.get("/2", middleware, async (ctx, next) => {
    const id = transactionStorage.getStore();
    console.log("router-start2", id);

    ctx.body = "Hello World";
});

router.get("/error", async (ctx, next) => {
    throw new Error("test");
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
