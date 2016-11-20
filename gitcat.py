import os
import logging
import asyncio
from aiohttp.web import Application, run_app
from aiohttp_index import IndexMiddleware
from aiohttp_cors import setup as setup_cors

import runtime
from api import ApiAuth
from github import Github


log = logging.getLogger(__name__)


class Gitcat(object):

    def __init__(self):
        # Asyncio loop
        self.loop = asyncio.get_event_loop()

        # Web application (statics and API routes)
        self.web = Application(middlewares=[IndexMiddleware()])

        # Github intergration
        try:
            key = os.environ['GITHUB_APP_KEY']
            secret = os.environ['GITHUB_APP_SECRET']
        except KeyError:
            raise EnvironmentError("Github application credentials aren't set")
        runtime.github = Github(key, secret, loop=self.loop)

    def run(self):
        setup_cors(self.web)
        self.web.router.add_route('*', '/auth', ApiAuth)
        self.web.router.add_static('/', path='./webapp/')
        run_app(self.web, port=80)


if __name__ == '__main__':
    backend = Gitcat()
    backend.run()
