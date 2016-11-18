import logging
from aiohttp import web


log = logging.getLogger(__name__)
access_log = logging.getLogger('.'.join([__name__, 'access']))
access_log.info = access_log.debug


class Webapp(object):

    def __init__(self, loop):
        self._loop = loop
        self._handler = None
        self._server = None
        self._app = web.Application(loop=loop, middlewares=[mw_index])

    async def build(self, path, host, port, debug=False):
        self._app.router.add_static('/', path=path)

        log.info("Starting webapp on {}:{}".format(host, port))
        self._handler = self._app.make_handler(
            log=log, access_log=access_log, debug=debug
        )
        self._server = await self._loop.create_server(
            self._handler, host=host, port=port
        )

    async def destroy(self):
        self._server.close()
        await self._handler.finish_connections()
        await self._server.wait_closed()
        log.info('Stopped webapp')


async def mw_index(app, handler):
    async def middleware(request):
        if request.path is '/':
            response = web.Response(
                status=301,
                headers={"Location": "/index.html"}
            )
            return response
        return await handler(request)
    return middleware
