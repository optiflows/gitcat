import logging
from aiohttp.web import View, json_response as Response

import runtime


log = logging.getLogger(__name__)


class ApiAuth(View):

    async def get(self):
        """
        Request authentication URL to Github.
        """
        log.critical("Requesting OAuth signin URL")
        url = runtime.github.auth()
        return Response({'url': url}, status=200)

    async def post(self):
        """
        Authentication request callback.
        """
        query = self.request.GET
        try:
            code = query['code']
            state = query['state']
        except KeyError:
            return Response(status=404)

        token = runtime.github.token(state, code)
        log.critical("Getting token '{}' for state '{}'".format(token, state))
        return Response({'token': token}, status=200)
