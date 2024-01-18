# 목표
- http 요청마다 고유한 id를 생성하고 어디서든지 별도의 파라미터 없이 조회할 수 있도록 한다.
- ex) elastic-apm-node의 transaction

# 개요
멀티쓰레드 환경에서는 TLS(Tread-Local Storage)를 이용하여 requestId를 추적하기 용이하다고 한다.
하지만 Node.js는 이벤트루프 기반의 비동기 특성으로 인해(단일쓰레드) TLS를 사용할 수 없다.
물론 컨텍스트를 직접 관리하면서 requestId를 추적할 수 있지만, 매우 귀찮고 복잡한 방법이다.

따라서 Node.js에서는 TLS를 대신할 CLS(Continuation-Local Storage)가 등장하였다.

## Node.js의 CLS
Node.js에서는 [Async hooks](https://nodejs.org/docs/latest-v21.x/api/async_context.html#class-asynclocalstorage)와 [AsyncLocalStorage](https://nodejs.org/docs/latest-v21.x/api/async_context.html#class-asynclocalstorage)를 제공하고 있다.

`Async hooks`로 구현된 [cls-hooked](https://www.npmjs.com/package/cls-hooked) 라이브러리가 대표적이지만, Node.js 12.17.0 버전부터는 `AsyncLocalStorage`를 사용하는 것을 권장하고 있다.

이 중 안정성이 보장되는 AsyncLocalStorage를 사용하여 requestId를 추적해보자.

# 구현
`elastic-apm-node`에서도 AsyncLocalStorage를 사용하여 context를 관리하고 있다. [코드](https://github.com/elastic/apm-agent-nodejs/blob/6c6d90a16a5e6b8c16d74d268d89f2c539943beb/lib/instrumentation/run-context/AsyncLocalStorageRunContextManager.js#L9)

apm이 어떻게 koa를 어떻게 가로채서 context를 관리하는지 모르겠다. [코드](https://github.com/elastic/apm-agent-nodejs/blob/main/lib/instrumentation/modules/koa-router.js)

그래서 미들웨어에서 `tracer`를 직접 호출하여 context를 관리하도록 구현하였다.

### 참고
- https://if1live.github.io/posts/express-attach-console-log-to-response/
- https://kyungyeon.dev/posts/43
- https://www.npmjs.com/package/elastic-apm-node
- https://nodejs.org/docs/latest-v21.x/api/async_context.
- html#class-asynclocalstorage