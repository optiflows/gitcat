import logging
from nyuki import Nyuki, resource
from nyuki.capabilities import Response
from aiohttp_cors import ResourceOptions, setup as cors_setup

from webapp import Webapp


log = logging.getLogger(__name__)
WEBAPP_PATH = './webapp/'


class Gitcat(Nyuki):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.webapp = Webapp(self.loop)

    async def setup(self):
        # Enable cors capabilities for the api routes
        self._enable_cors()

        # Start the webapp
        web_host = self.config['webapp']['host']
        web_port = self.config['webapp']['port']
        await self.webapp.build(WEBAPP_PATH, web_host, web_port)

    def _enable_cors(self):
        app = self.api._api._app
        cors = cors_setup(app, defaults={
            "*": ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        })
        for route in self.api._api.router.routes():
            cors.add(route)

    @resource(endpoint='/login', version='v1')
    class Authentication:

        def get(self, request):
            return Response(status=200)


if __name__ == '__main__':
    nyuki = Gitcat()
    nyuki.start()
