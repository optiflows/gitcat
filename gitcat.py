import logging
from nyuki import Nyuki, resource
from nyuki.capabilities import Response
from aiohttp_cors import ResourceOptions, setup as cors_setup

from webapp import Webapp
from github import Github


log = logging.getLogger(__name__)
WEBAPP_PATH = './webapp/'


class Gitcat(Nyuki):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.webapp = Webapp(self.loop)
        self.github = None

    async def setup(self):
        self._enable_cors()
        await self.webapp.build(WEBAPP_PATH, **self.config['webapp'])
        self.github = Github(**self.config['github'])

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

    @resource(endpoint='/auth', version='v1')
    class Authentication:

        async def post(self, request):
            """
            Request authentication URL to Github.
            """
            url = self.github.auth()
            return Response({'url': url})

        async def get(self, request):
            """
            Authentication request callback.
            """
            token = self.github.token(**request)
            return Response({'token': token})


if __name__ == '__main__':
    nyuki = Gitcat()
    nyuki.start()
